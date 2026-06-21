import {
  calculateEcoScore,
  getLevelTitle,
  getLevelColor,
} from "@/lib/ecoScore";

describe("calculateEcoScore", () => {
  it("base score is 100 with zero actions, zero streak, zero savings", () => {
    const result = calculateEcoScore(0, 0, 0);
    expect(result.score).toBe(100);
    expect(result.level).toBe(1);
    expect(result.title).toBe("Seedling");
  });

  it("actions increase score by 50 each", () => {
    const result = calculateEcoScore(3, 0, 0);
    expect(result.score).toBe(250);
    expect(result.level).toBe(2);
    expect(result.title).toBe("Sprout");
  });

  it("streak bonus caps at 100", () => {
    const result = calculateEcoScore(0, 15, 0);
    expect(result.score).toBe(200);
    expect(result.streakDays).toBe(15);
  });

  it("level upgrades at correct thresholds", () => {
    const seedling = calculateEcoScore(0, 0, 0);
    expect(seedling.level).toBe(1);
    expect(seedling.title).toBe("Seedling");

    const sprout = calculateEcoScore(3, 0, 0);
    expect(sprout.level).toBe(2);
    expect(sprout.title).toBe("Sprout");

    const guardian = calculateEcoScore(8, 10, 0);
    expect(guardian.level).toBe(3);
    expect(guardian.title).toBe("Guardian");

    const champion = calculateEcoScore(10, 10, 2000);
    expect(champion.level).toBe(4);
    expect(champion.title).toBe("Champion");

    const hero = calculateEcoScore(20, 10, 10000);
    expect(hero.level).toBe(5);
    expect(hero.title).toBe("Planet Hero");
  });

  it("milestone points are 200 per 1000kg saved", () => {
    const result = calculateEcoScore(0, 0, 2500);
    expect(result.score).toBe(500);
    expect(result.totalKgSaved).toBe(2500);
  });

  it("progressToNext is 0-100", () => {
    const result = calculateEcoScore(0, 0, 0);
    expect(result.progressToNext).toBeGreaterThanOrEqual(0);
    expect(result.progressToNext).toBeLessThanOrEqual(100);
  });
});

describe("getLevelTitle", () => {
  it("returns correct title for each level", () => {
    expect(getLevelTitle(1)).toBe("Seedling");
    expect(getLevelTitle(2)).toBe("Sprout");
    expect(getLevelTitle(3)).toBe("Guardian");
    expect(getLevelTitle(4)).toBe("Champion");
    expect(getLevelTitle(5)).toBe("Planet Hero");
  });

  it("clamps out-of-range levels", () => {
    expect(getLevelTitle(0)).toBe("Seedling");
    expect(getLevelTitle(6)).toBe("Planet Hero");
  });
});

describe("getLevelColor", () => {
  it("returns a valid color string for each level", () => {
    for (let level = 1; level <= 5; level++) {
      const color = getLevelColor(level);
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
