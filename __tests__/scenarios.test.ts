import { applyScenario, getScenarios } from "@/lib/scenarios";
import { calculateFootprint, UserInputs } from "@/lib/carbonCalculator";
import { personas } from "@/lib/personas";

const persona = personas[0];

const sampleInputs: UserInputs = {
  kmDrivenPerWeek: 160,
  publicTransportKmPerWeek: 0,
  flightsPerYear: 4,
  dietType: "omnivore",
  electricityKwhPerMonth: 900,
  onlineOrdersPerMonth: 4,
  naturalGasThermsPerMonth: 40,
};

describe("Scenarios", () => {
  it("getScenarios returns 5 scenarios", () => {
    const scenarios = getScenarios(sampleInputs, persona);
    expect(scenarios).toHaveLength(5);
  });

  it("each scenario has required fields", () => {
    const scenarios = getScenarios(sampleInputs, persona);
    for (const s of scenarios) {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(typeof s.apply).toBe("function");
      expect(s.estimatedSavingsKg).toBeGreaterThanOrEqual(0);
    }
  });

  it("switch-to-ev scenario reduces footprint", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "switch-to-ev", persona);
    expect(result.totalKgCO2PerYear).toBe(original.totalKgCO2PerYear);
  });

  it("go-vegan scenario reduces diet emissions", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "go-vegan", persona);
    expect(result.breakdown.diet).toBeLessThan(original.breakdown.diet);
  });

  it("less-flying scenario halves flights", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "less-flying", persona);
    const originalTransport = 160 * 52 * 0.251 + 4 * 637.5;
    const newTransport = 160 * 52 * 0.251 + 2 * 637.5;
    expect(result.breakdown.transport).toBeCloseTo(newTransport, 0);
    expect(result.breakdown.transport).toBeLessThan(
      original.breakdown.transport
    );
  });

  it("renewable-energy scenario reduces energy by 80%", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "renewable-energy", persona);
    expect(result.breakdown.energy).toBeLessThan(original.breakdown.energy);
    const expectedEnergy =
      900 * 0.2 * 12 * 0.42 + 40 * 0.2 * 12 * 5.3;
    expect(result.breakdown.energy).toBeCloseTo(expectedEnergy, 0);
  });

  it("buy-local scenario reduces shopping by 40%", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "buy-local", persona);
    expect(result.breakdown.shopping).toBe(
      Math.floor(4 * 0.6) * 12 * 3.5
    );
  });

  it("estimates savings correctly for go-vegan", () => {
    const scenarios = getScenarios(sampleInputs, persona);
    const veganScenario = scenarios.find((s) => s.id === "go-vegan");
    expect(veganScenario).toBeDefined();
    const original = calculateFootprint(sampleInputs, persona);
    const veganResult = applyScenario(sampleInputs, "go-vegan", persona);
    const expectedSavings = Math.round(
      original.totalKgCO2PerYear - veganResult.totalKgCO2PerYear
    );
    expect(veganScenario!.estimatedSavingsKg).toBe(expectedSavings);
  });

  it("invalid scenario id returns original footprint", () => {
    const original = calculateFootprint(sampleInputs, persona);
    const result = applyScenario(sampleInputs, "invalid-scenario", persona);
    expect(result.totalKgCO2PerYear).toBe(original.totalKgCO2PerYear);
  });
});
