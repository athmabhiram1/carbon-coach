export interface EcoScore {
  score: number;
  level: number;
  title: string;
  progressToNext: number;
  streakDays: number;
  totalActionsTaken: number;
  totalKgSaved: number;
}

const LEVEL_THRESHOLDS = [
  { min: 0, max: 199, title: "Seedling" },
  { min: 200, max: 499, title: "Sprout" },
  { min: 500, max: 999, title: "Guardian" },
  { min: 1000, max: 1999, title: "Champion" },
  { min: 2000, max: Infinity, title: "Planet Hero" },
];

const LEVEL_COLORS: Record<string, string> = {
  Seedling: "#b45309",
  Sprout: "#cbd5e1",
  Guardian: "#facc15",
  Champion: "#22d3ee",
  PlanetHero: "#10b981",
};

export function calculateEcoScore(
  actionsTaken: number,
  streakDays: number,
  totalKgSaved: number
): EcoScore {
  const baseScore = 100;
  const actionPoints = actionsTaken * 50;
  const streakPoints = Math.min(streakDays * 10, 100);
  const milestonePoints = Math.floor(totalKgSaved / 1000) * 200;

  const score = baseScore + actionPoints + streakPoints + milestonePoints;

  const levelInfo = LEVEL_THRESHOLDS.find(
    (t) => score >= t.min && score <= t.max
  ) ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const level = LEVEL_THRESHOLDS.indexOf(levelInfo) + 1;
  const title = levelInfo.title;

  const range = levelInfo.max - levelInfo.min;
  const progress = range > 0 ? score - levelInfo.min : 100;
  const progressToNext = Math.min(100, Math.round((progress / range) * 100));

  return {
    score,
    level,
    title,
    progressToNext,
    streakDays,
    totalActionsTaken: actionsTaken,
    totalKgSaved,
  };
}

export function getLevelTitle(level: number): string {
  const index = Math.max(0, Math.min(level - 1, LEVEL_THRESHOLDS.length - 1));
  return LEVEL_THRESHOLDS[index].title;
}

export function getLevelColor(level: number): string {
  const index = Math.max(0, Math.min(level - 1, LEVEL_THRESHOLDS.length - 1));
  const title = LEVEL_THRESHOLDS[index].title;
  const colorKey = title.replace(/[\s-]/g, "");
  return LEVEL_COLORS[colorKey] ?? "#94a3b8";
}
