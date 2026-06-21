export const LEVEL_THRESHOLDS = [
  { min: 0, max: 199, title: "Seedling" },
  { min: 200, max: 499, title: "Sprout" },
  { min: 500, max: 999, title: "Guardian" },
  { min: 1000, max: 1999, title: "Champion" },
  { min: 2000, max: Infinity, title: "Planet Hero" },
] as const;

export const LEVEL_COLORS: Record<string, string> = {
  Seedling: "#b45309",
  Sprout: "#cbd5e1",
  Guardian: "#facc15",
  Champion: "#22d3ee",
  PlanetHero: "#10b981",
} as const;

export const BASE_SCORE = 100;
export const ACTION_POINTS = 50;
export const STREAK_POINTS_MAX = 100;
export const STREAK_POINTS_FACTOR = 10;
export const MILESTONE_POINTS_FACTOR = 200;
export const MILESTONE_KG_STEP = 1000;
