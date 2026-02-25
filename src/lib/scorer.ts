/**
 * DEPRECATED - No longer used in the active pipeline.
 *
 * This was our initial retrieval layer: manual tag synonym expansion +
 * regex-based price ceiling extraction. It worked, but carried a real risk
 * of missing relevant results whenever a user's wording didn't match our
 * hardcoded synonym map (e.g. "peaceful" never mapped to "beach").
 *
 * Replaced this with real semantic search using Gemini embeddings
 * (see vectorSearch.ts). The embedding model captures meaning, not just
 * keywords, so it handles phrasing we never anticipated.
 *
 * Kept in the repo for reference - shows the evolution from keyword
 * matching to vector search.
 */

import { TravelItem } from "./types";

interface ScoredItem {
  item: TravelItem;
  score: number;
}

const PRICE_INDICATORS: Record<string, number> = {
  cheap: 60,
  budget: 60,
  affordable: 80,
  "under $50": 50,
  "under $100": 100,
  "under $150": 150,
  "under $200": 200,
  luxury: 999,
  expensive: 999,
};

const TAG_SYNONYMS: Record<string, string[]> = {
  beach: ["beach", "surfing", "young-vibe"],
  surf: ["surfing", "beach"],
  surfing: ["surfing", "beach"],
  history: ["history", "culture"],
  culture: ["culture", "history", "walking"],
  nature: ["nature", "hiking", "cold"],
  hike: ["hiking", "nature"],
  hiking: ["hiking", "nature", "cold"],
  safari: ["animals", "adventure", "photography"],
  wildlife: ["animals", "adventure"],
  animals: ["animals", "adventure"],
  adventure: ["adventure", "climbing", "hiking"],
  climb: ["climbing", "view"],
  ancient: ["history", "climbing", "view"],
  ruins: ["history", "culture"],
  photo: ["photography", "view"],
  photography: ["photography", "view", "animals"],
  tea: ["cold", "nature", "hiking"],
  mountain: ["cold", "nature", "hiking"],
  cold: ["cold", "nature"],
  chill: ["beach", "surfing", "young-vibe"],
  relax: ["beach", "young-vibe"],
  walk: ["walking", "culture"],
  fort: ["history", "culture", "walking"],
  city: ["history", "culture"],
};

function extractPriceCeiling(query: string): number | null {
  const lower = query.toLowerCase();
  for (const [phrase, price] of Object.entries(PRICE_INDICATORS)) {
    if (lower.includes(phrase)) return price;
  }
  const match =
    lower.match(/\$\s*(\d+)/) ||
    lower.match(/(\d+)\s*\$/) ||
    lower.match(/(\d+)\s*dollars?/);
  if (match) return parseInt(match[1]);
  return null;
}

function expandQueryToTags(query: string): Set<string> {
  const lower = query.toLowerCase();
  const expanded = new Set<string>();
  for (const [keyword, tags] of Object.entries(TAG_SYNONYMS)) {
    if (lower.includes(keyword)) tags.forEach((t) => expanded.add(t));
  }
  return expanded;
}

function scoreItem(
  item: TravelItem,
  expandedTags: Set<string>,
  priceCeiling: number | null,
): number {
  let score = 0;
  const matchedTags = item.tags.filter((tag) => expandedTags.has(tag));
  score += (matchedTags.length / Math.max(item.tags.length, 1)) * 70;
  if (priceCeiling !== null) {
    if (item.price <= priceCeiling) {
      const headroom = (priceCeiling - item.price) / priceCeiling;
      score += 20 + headroom * 10;
    } else {
      score *= 0.2;
    }
  } else {
    score += 15;
  }
  return Math.min(Math.round(score), 100);
}

const MIN_SCORE_THRESHOLD = 15;

export function preFilterInventory(
  query: string,
  inventory: TravelItem[],
): ScoredItem[] {
  const priceCeiling = extractPriceCeiling(query);
  const expandedTags = expandQueryToTags(query);
  return inventory
    .map((item) => ({
      item,
      score: scoreItem(item, expandedTags, priceCeiling),
    }))
    .filter((s) => s.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}
