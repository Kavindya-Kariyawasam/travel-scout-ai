import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { inventory, INVENTORY_IDS } from "@/lib/inventory";
import { semanticSearch } from "@/lib/vectorSearch";
import { MatchedResult, ScoutResponse } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- RATE LIMITING ---
// Per IP, In-memory, Resets on cold starts
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max requests per window
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

// Zod schema - hallucination firewall.
// Any ID returned by Gemini that isn't in our inventory is rejected here.
const AIResponseSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number().refine((id) => INVENTORY_IDS.includes(id), {
        message: "ID not in inventory - hallucination rejected",
      }),
      reason: z.string().min(10).max(200),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const query: string = body.query?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Please enter a search query." },
        { status: 400 },
      );
    }

    if (query.length > 300) {
      return NextResponse.json(
        { error: "Query too long. Please keep it under 300 characters." },
        { status: 400 },
      );
    }

    // --- RETRIEVAL LAYER ---
    // Step 1: Embed the user's query using the same model used for inventory
    const embeddingModel = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });
    const queryEmbedding = await embeddingModel.embedContent(query);
    const queryVector = queryEmbedding.embedding.values;

    // Step 2: Semantic search - cosine similarity against precomputed inventory vectors
    const searchResults = semanticSearch(queryVector);

    // Nothing passed the similarity threshold
    if (searchResults.length === 0) {
      const response: ScoutResponse = {
        results: [],
        totalFound: 0,
        queryEcho: query,
      };
      return NextResponse.json(response);
    }

    // --- AUGMENTED PROMPT ---
    // Only semantically relevant candidates are sent to Gemini
    const candidatesForAI = searchResults.map((r) => ({
      id: r.item.id,
      title: r.item.title,
      location: r.item.location,
      price: r.item.price,
      tags: r.item.tags,
    }));

    const prompt = `You are a travel experience matcher. Match the user's query to the most relevant experiences from the inventory below.

    STRICT RULES:
    1. You MUST only return items from the provided inventory. Never suggest anything outside it.
    2. Return ONLY valid JSON matching the schema below. No markdown, no code fences, no text outside the JSON.
    3. Only include items that genuinely match the query. If nothing matches well, return an empty matches array.
    4. Each reason must be one concise sentence explaining the specific match — mention relevant tags, price fit, or location.
    5. Rank matches from most relevant to least relevant.

    RESPONSE SCHEMA:
    {"matches": [{"id": <number>, "reason": "<one sentence why this matches the query>"}]}

    INVENTORY:
    ${JSON.stringify(candidatesForAI, null, 2)}

    User query: "${query}"`;

    // --- GENERATION LAYER ---
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const result = await chatModel.generateContent(prompt);
    const rawText = result.response.text().trim();

    // --- ZOD VALIDATION (Hallucination Firewall) ---
    let parsed;
    try {
      parsed = AIResponseSchema.parse(JSON.parse(rawText));
    } catch {
      console.error("Schema validation failed:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected response. Please try again." },
        { status: 500 },
      );
    }

    // --- BUILD FINAL RESPONSE ---
    // Join validated IDs back to full inventory data + similarity scores
    const results: MatchedResult[] = parsed.matches
      .map((match) => {
        const inventoryItem = inventory.find((i) => i.id === match.id);
        const searchResult = searchResults.find((r) => r.item.id === match.id);
        if (!inventoryItem) return null;
        return {
          item: inventoryItem,
          reason: match.reason,
          similarity: searchResult?.similarity ?? 0,
        };
      })
      .filter((r): r is MatchedResult => r !== null);

    const response: ScoutResponse = {
      results,
      totalFound: results.length,
      queryEcho: query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Scout API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
