import {
  LEVEL_THRESHOLDS,
  LEVEL_COLORS,
  BASE_SCORE,
  ACTION_POINTS,
  STREAK_POINTS_MAX,
  STREAK_POINTS_FACTOR,
  MILESTONE_POINTS_FACTOR,
  MILESTONE_KG_STEP,
} from "../../config/scoring";

export interface EcoScore {
  score: number;
  level: number;
  title: string;
  progressToNext: number;
  streakDays: number;
  totalActionsTaken: number;
  totalKgSaved: number;
}

export function calculateEcoScore(
  actionsTaken: number,
  streakDays: number,
  totalKgSaved: number
): EcoScore {
  const actionPoints = actionsTaken * ACTION_POINTS;
  const streakPoints = Math.min(streakDays * STREAK_POINTS_FACTOR, STREAK_POINTS_MAX);
  const milestonePoints = Math.floor(totalKgSaved / MILESTONE_KG_STEP) * MILESTONE_POINTS_FACTOR;

  const score = BASE_SCORE + actionPoints + streakPoints + milestonePoints;

  const levelInfo =
    LEVEL_THRESHOLDS.find((t) => score >= t.min && score <= t.max) ??
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

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
