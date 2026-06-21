export interface LeaderboardProfile {
  display_name: string | null;
  avatar_url: string | null;
  region: string;
}

export interface LeaderboardEntry {
  anonymous_id: string | null;
  user_id: string | null;
  persona_id: string;
  eco_score: number;
  eco_level: number;
  total_kg_co2_per_year: number;
  created_at: string;
  profiles?: LeaderboardProfile | null;
}

export type SortKey = "eco_score" | "total_kg_co2_per_year" | "created_at";
