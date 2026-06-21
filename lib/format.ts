export function formatTonnes(kg: number): string {
  const tonnes = kg / 1000;
  if (tonnes < 1) return `${Math.round(kg)} kg`;
  return `${tonnes.toFixed(1)}t`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}
