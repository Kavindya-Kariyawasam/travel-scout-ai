/**
 * One-time script to generate embeddings for all inventory items.
 *
 * Uses Gemini gemini-embedding-001 to convert each inventory item's
 * descriptive text into a vector of numbers capturing its semantic meaning.
 *
 * Run with:
 * npx ts-node --project tsconfig.scripts.json -r tsconfig-paths/register scripts/generateEmbeddings.ts
 *
 * Output: src/lib/embeddings.json
 * This file never needs to regenerate unless inventory changes. If you clone my repo, it already includes this file with precomputed embeddings for the sample inventory.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const inventory = [
  {
    id: 1,
    title: "High-Altitude Tea Trails",
    location: "Nuwara Eliya",
    price: 120,
    tags: ["cold", "nature", "hiking"],
  },
  {
    id: 2,
    title: "Coastal Heritage Wander",
    location: "Galle Fort",
    price: 45,
    tags: ["history", "culture", "walking"],
  },
  {
    id: 3,
    title: "Wild Safari Expedition",
    location: "Yala",
    price: 250,
    tags: ["animals", "adventure", "photography"],
  },
  {
    id: 4,
    title: "Surf & Chill Retreat",
    location: "Arugam Bay",
    price: 80,
    tags: ["beach", "surfing", "young-vibe"],
  },
  {
    id: 5,
    title: "Ancient City Exploration",
    location: "Sigiriya",
    price: 110,
    tags: ["history", "climbing", "view"],
  },
];

/**
 * Converts an inventory item to a rich descriptive sentence for embedding.
 */
function itemToText(item: (typeof inventory)[0]): string {
  return `${item.title} in ${item.location}. Price: $${item.price}. Tags: ${item.tags.join(", ")}.`;
}

async function generateEmbeddings() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in .env.local");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-embedding-001 is Google's embedding model - separate from the chat model
  const embeddingModel = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  console.log("Generating embeddings for inventory items...\n");

  const results = [];

  for (const item of inventory) {
    const text = itemToText(item);
    console.log(`Embedding item ${item.id}: "${text}"`);

    const result = await embeddingModel.embedContent(text);
    const vector = result.embedding.values;

    results.push({ id: item.id, text, vector });
    console.log(`[OK] Item ${item.id} - vector length: ${vector.length}\n`);
  }

  // Save to src/lib/embeddings.json
  const outputPath = path.join(__dirname, "../src/lib/embeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\nDone! Embeddings saved to src/lib/embeddings.json`);
  console.log(
    `Commit this file to your repo - no need to regenerate unless inventory changes.`,
  );
}

generateEmbeddings().catch(console.error);
