import { EmbeddedItem, TravelItem } from "./types";
import { inventory } from "./inventory";
import embeddingsData from "./embeddings.json";

const embeddings = embeddingsData as EmbeddedItem[];

/**
 * Cosine similarity between two vectors.
 * Returns a value between 0 (completely different) and 1 (identical meaning).
 *
 * Formula: (A · B) / (|A| × |B|) Dot product and the magnitude of the vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export interface SearchResult {
  item: TravelItem;
  similarity: number;
}

/**
 * Semantic search over the inventory using precomputed embeddings.
 *
 * Purely semantic
 *
 * SIMILARITY_THRESHOLD: items below this score are considered irrelevant.
 */
const SIMILARITY_THRESHOLD = 0.5;

export function semanticSearch(queryVector: number[]): SearchResult[] {
  return inventory
    .map((item) => {
      const embedded = embeddings.find((e) => e.id === item.id);
      if (!embedded) return null;
      return {
        item,
        similarity: cosineSimilarity(queryVector, embedded.vector),
      };
    })
    .filter((r): r is SearchResult => r !== null)
    .filter((r) => r.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);
}
