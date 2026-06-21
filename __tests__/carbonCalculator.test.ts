import { calculateFootprint, UserInputs } from "@/lib/carbonCalculator";
import { personas, Persona } from "@/lib/personas";

const defaultPersona: Persona = personas[0];

const zeroInputs: UserInputs = {
  kmDrivenPerWeek: 0,
  publicTransportKmPerWeek: 0,
  flightsPerYear: 0,
  dietType: "vegan",
  electricityKwhPerMonth: 0,
  onlineOrdersPerMonth: 0,
  naturalGasThermsPerMonth: 0,
};

describe("calculateFootprint", () => {
  it("zero inputs return zero in all categories", () => {
    const result = calculateFootprint(zeroInputs, defaultPersona);
    expect(result.totalKgCO2PerYear).toBe(1500);
    expect(result.breakdown.transport).toBe(0);
    expect(result.breakdown.diet).toBe(1500);
    expect(result.breakdown.energy).toBe(0);
    expect(result.breakdown.shopping).toBe(0);
  });

  it("typical commuter inputs return expected range", () => {
    const commuterInputs: UserInputs = {
      kmDrivenPerWeek: 160,
      publicTransportKmPerWeek: 0,
      flightsPerYear: 2,
      dietType: "omnivore",
      electricityKwhPerMonth: 900,
      onlineOrdersPerMonth: 4,
      naturalGasThermsPerMonth: 40,
    };
    const result = calculateFootprint(commuterInputs, defaultPersona);
    const transport = 160 * 52 * 0.251 + 2 * 637.5;
    const diet = 2500;
    const energy = 900 * 12 * 0.42 + 40 * 12 * 5.3;
    const shopping = 4 * 12 * 3.5;
    const expectedTotal = transport + diet + energy + shopping;

    expect(result.totalKgCO2PerYear).toBeCloseTo(expectedTotal, 0);
    expect(result.breakdown.transport).toBeCloseTo(transport, 0);
    expect(result.breakdown.diet).toBe(diet);
    expect(result.breakdown.energy).toBeCloseTo(energy, 0);
    expect(result.breakdown.shopping).toBe(shopping);
  });

  it("diet type changes affect total correctly", () => {
    const baseInputs: UserInputs = { ...zeroInputs, dietType: "vegan" };
    const veganResult = calculateFootprint(baseInputs, defaultPersona);

    const heavyMeatInputs: UserInputs = { ...zeroInputs, dietType: "heavy-meat" };
    const heavyMeatResult = calculateFootprint(heavyMeatInputs, defaultPersona);

    expect(heavyMeatResult.totalKgCO2PerYear).toBeGreaterThan(
      veganResult.totalKgCO2PerYear
    );
    expect(heavyMeatResult.breakdown.diet).toBe(3300);
    expect(veganResult.breakdown.diet).toBe(1500);
  });

  it("negative inputs are clamped to zero", () => {
    const negativeInputs: UserInputs = {
      kmDrivenPerWeek: -100,
      publicTransportKmPerWeek: -50,
      flightsPerYear: -5,
      dietType: "vegan",
      electricityKwhPerMonth: -200,
      onlineOrdersPerMonth: -10,
      naturalGasThermsPerMonth: -20,
    };
    const result = calculateFootprint(negativeInputs, defaultPersona);
    expect(result.breakdown.transport).toBe(0);
    expect(result.breakdown.energy).toBe(0);
    expect(result.breakdown.shopping).toBe(0);
    expect(result.totalKgCO2PerYear).toBe(1500);
  });

  it("severity levels trigger at correct thresholds", () => {
    const resultExcellent = calculateFootprint(
      { ...zeroInputs, dietType: "vegan" },
      defaultPersona
    );
    expect(resultExcellent.severity).toBe("excellent");

    const resultGood = calculateFootprint(
      { ...zeroInputs, kmDrivenPerWeek: 200, dietType: "vegan" },
      defaultPersona
    );
    expect(resultGood.severity).toBe("good");

    const resultAverage = calculateFootprint(
      { ...zeroInputs, kmDrivenPerWeek: 300, flightsPerYear: 6, dietType: "omnivore" },
      defaultPersona
    );
    expect(resultAverage.severity).toBe("average");

    const resultHigh = calculateFootprint(
      { ...zeroInputs, kmDrivenPerWeek: 250, flightsPerYear: 8, electricityKwhPerMonth: 1200, dietType: "heavy-meat" },
      defaultPersona
    );
    expect(resultHigh.severity).toBe("high");

    const resultCritical = calculateFootprint(
      { ...zeroInputs, kmDrivenPerWeek: 500, flightsPerYear: 20, electricityKwhPerMonth: 2000, naturalGasThermsPerMonth: 100, onlineOrdersPerMonth: 50, dietType: "heavy-meat" },
      defaultPersona
    );
    expect(resultCritical.severity).toBe("critical");
  });

  it("returns comparison percentages correctly", () => {
    const result = calculateFootprint(zeroInputs, defaultPersona);
    expect(result.comparisonToPersonaBaseline).toBeLessThan(0);
    expect(result.comparisonToNationalAverage).toBeLessThan(0);
  });

  it("identifies the top category correctly", () => {
    const highTransport: UserInputs = {
      ...zeroInputs,
      kmDrivenPerWeek: 500,
      dietType: "vegan",
    };
    const result = calculateFootprint(highTransport, defaultPersona);
    expect(result.topCategory).toBe("transport");
  });
});
