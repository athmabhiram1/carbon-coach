export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      footprints: {
        Row: {
          id: string;
          anonymous_id: string;
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
          anonymous_id: string;
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
          anonymous_id?: string;
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
  anonymous_id: string;
  persona_id: string;
  eco_score: number;
  eco_level: number;
  total_kg_co2_per_year: number;
  created_at: string;
}

/*
  SQL Schema — Run in Supabase SQL Editor:

  CREATE TABLE footprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    anonymous_id UUID NOT NULL,
    persona_id TEXT NOT NULL,
    total_kg_co2_per_year NUMERIC NOT NULL,
    breakdown JSONB NOT NULL,
    severity TEXT NOT NULL,
    top_category TEXT NOT NULL,
    comparison_to_national_avg NUMERIC NOT NULL,
    comparison_to_persona_baseline NUMERIC NOT NULL,
    actions_taken JSONB DEFAULT '[]',
    eco_score NUMERIC DEFAULT 0,
    eco_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX idx_footprints_eco_score ON footprints(eco_score DESC);
  CREATE INDEX idx_footprints_created_at ON footprints(created_at DESC);
*/
