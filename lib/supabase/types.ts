export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          region: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          region?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          region?: string;
          updated_at?: string;
        };
      };
      footprints: {
        Row: {
          id: string;
          user_id: string | null;
          anonymous_id: string | null;
          persona_id: string;
          total_kg_co2_per_year: number;
          breakdown: Json;
          severity: string;
          top_category: string;
          comparison_to_national_avg: number;
          comparison_to_persona_baseline: number;
          actions_taken: Json;
          eco_score: number;
          eco_level: number;
          streak_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          anonymous_id?: string | null;
          persona_id: string;
          total_kg_co2_per_year: number;
          breakdown: Json;
          severity: string;
          top_category: string;
          comparison_to_national_avg: number;
          comparison_to_persona_baseline: number;
          actions_taken?: Json;
          eco_score?: number;
          eco_level?: number;
          streak_days?: number;
        };
        Update: {
          user_id?: string | null;
          anonymous_id?: string | null;
          persona_id?: string;
          total_kg_co2_per_year?: number;
          breakdown?: Json;
          severity?: string;
          top_category?: string;
          comparison_to_national_avg?: number;
          comparison_to_persona_baseline?: number;
          actions_taken?: Json;
          eco_score?: number;
          eco_level?: number;
          streak_days?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export interface ActionRecord {
  id: string;
  label: string;
  savingsKg: number;
  checked: boolean;
}

export interface LeaderboardEntry {
  anonymous_id: string | null;
  user_id: string | null;
  persona_id: string;
  eco_score: number;
  eco_level: number;
  total_kg_co2_per_year: number;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    region: string;
  } | null;
}
