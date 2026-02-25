export interface TravelItem {
  id: number;
  title: string;
  location: string;
  price: number;
  tags: string[];
}

// Stored in embeddings.json - precomputed once at build time
export interface EmbeddedItem {
  id: number;
  text: string; // the text that was embedded (for transparency)
  vector: number[]; // the embedding vector from Gemini text-embedding-004
}

export interface MatchedResult {
  item: TravelItem;
  reason: string;
  similarity: number; // cosine similarity score 0-1
}

export interface ScoutRequest {
  query: string;
}

export interface ScoutResponse {
  results: MatchedResult[];
  totalFound: number;
  queryEcho: string;
}
