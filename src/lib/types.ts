export interface TravelItem {
  id: number;
  title: string;
  location: string;
  price: number;
  tags: string[];
}

export interface MatchedResult {
  item: TravelItem;
  reason: string;
  score: number;
}

export interface ScoutRequest {
  query: string;
}

export interface ScoutResponse {
  results: MatchedResult[];
  totalFound: number;
  queryEcho: string;
}
