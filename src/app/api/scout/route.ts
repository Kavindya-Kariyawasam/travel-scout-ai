import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { inventory, INVENTORY_IDS } from "@/lib/inventory";
import { preFilterInventory } from "@/lib/scorer";
import { MatchedResult, ScoutResponse } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const AIResponseSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number().refine((id) => INVENTORY_IDS.includes(id), {
        message: "ID not in inventory - rejecting hallucination",
      }),
      reason: z.string().min(10).max(200),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
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
    const scoredCandidates = preFilterInventory(query, inventory);

    if (scoredCandidates.length === 0) {
      const response: ScoutResponse = {
        results: [],
        totalFound: 0,
        queryEcho: query,
      };
      return NextResponse.json(response);
    }

    const candidatesForAI = scoredCandidates.map((s) => ({
      id: s.item.id,
      title: s.item.title,
      location: s.item.location,
      price: s.item.price,
      tags: s.item.tags,
    }));

    // --- AUGMENTED PROMPT ---
    const prompt = `You are a travel experience matcher. Your ONLY job is to match a user's travel query to experiences from the provided inventory.

    STRICT RULES:
    1. Only return items from the provided inventory. Never suggest anything outside it.
    2. Return ONLY valid JSON — no markdown, no code fences, no explanation outside the JSON.
    3. If no items match well, return an empty matches array.
    4. Keep each reason to 1 concise sentence mentioning tags, price, or location.

    RESPONSE FORMAT (return exactly this structure):
    {"matches": [{"id": <number>, "reason": "<one sentence>"}]}

    INVENTORY (match ONLY from these):
    ${JSON.stringify(candidatesForAI)}

    User query: "${query}"`;

    // --- GENERATION LAYER ---
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json", // Forces Gemini to return pure JSON
      },
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // --- ZOD VALIDATION (Hallucination Firewall) ---
    let parsed;
    try {
      parsed = AIResponseSchema.parse(JSON.parse(rawText));
    } catch {
      console.error("AI response failed schema validation:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected response. Please try again." },
        { status: 500 },
      );
    }

    // --- BUILD FINAL RESPONSE ---
    const results: MatchedResult[] = parsed.matches
      .map((match) => {
        const inventoryItem = inventory.find((i) => i.id === match.id);
        const scored = scoredCandidates.find((s) => s.item.id === match.id);
        if (!inventoryItem) return null;
        return {
          item: inventoryItem,
          reason: match.reason,
          score: scored?.score ?? 0,
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
