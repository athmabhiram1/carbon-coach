import {
  projectFootprint,
  getAllProjections,
  Action,
} from "@/lib/timeMachine";
import { FootprintResult } from "@/lib/carbonCalculator";

const mockResult: FootprintResult = {
  totalKgCO2PerYear: 10000,
  breakdown: { transport: 4000, diet: 2000, energy: 3000, shopping: 1000 },
  comparisonToPersonaBaseline: 0,
  comparisonToNationalAverage: -37.5,
  severity: "average",
  topCategory: "transport",
};

const mockActions: Action[] = [
  { id: "go-vegan", label: "Go Vegan", savingsKg: 1000 },
  { id: "ev", label: "Switch to EV", savingsKg: 2400 },
];

describe("projectFootprint", () => {
  it("1-year projection equals current annual total", () => {
    const projection = projectFootprint(mockResult, mockActions, 1);
    expect(projection.projectedTotal).toBe(10000);
  });

  it("10-year projection scales correctly", () => {
    const projection = projectFootprint(mockResult, mockActions, 10);
    expect(projection.projectedTotal).toBe(100000);
  });

  it("actions reduce projected total", () => {
    const projection = projectFootprint(mockResult, mockActions, 5);
    const expectedWithActions = (10000 - 3400) * 5;
    expect(projection.projectedWithActions).toBe(expectedWithActions);
    expect(projection.projectedWithActions).toBeLessThan(
      projection.projectedTotal
    );
  });

  it("equivalentTrees is positive when savings exist", () => {
    const projection = projectFootprint(mockResult, mockActions, 5);
    expect(projection.savingsPotential).toBeGreaterThan(0);
    expect(projection.equivalentTrees).toBeGreaterThan(0);
    expect(projection.equivalentMiles).toBeGreaterThan(0);
  });

  it("savingsPotential equals projectedTotal - projectedWithActions", () => {
    const projection = projectFootprint(mockResult, mockActions, 1);
    expect(projection.savingsPotential).toBe(
      projection.projectedTotal - projection.projectedWithActions
    );
  });

  it("equivalentMiles is calculated correctly", () => {
    const projection = projectFootprint(mockResult, mockActions, 1);
    const expectedMiles = Math.round(3400 / 0.404);
    expect(projection.equivalentMiles).toBe(expectedMiles);
  });

  it("equivalentTrees is calculated correctly", () => {
    const projection = projectFootprint(mockResult, mockActions, 1);
    const expectedTrees = Math.round(3400 / 22);
    expect(projection.equivalentTrees).toBe(expectedTrees);
  });

  it("no actions results in no savings", () => {
    const projection = projectFootprint(mockResult, [], 5);
    expect(projection.savingsPotential).toBe(0);
    expect(projection.projectedWithActions).toBe(projection.projectedTotal);
  });
});

describe("getAllProjections", () => {
  it("returns 3 projections for 1, 5, and 10 years", () => {
    const projections = getAllProjections(mockResult, mockActions);
    expect(projections).toHaveLength(3);
    expect(projections[0].years).toBe(1);
    expect(projections[1].years).toBe(5);
    expect(projections[2].years).toBe(10);
  });

  it("projections scale progressively", () => {
    const projections = getAllProjections(mockResult, mockActions);
    expect(projections[0].projectedTotal).toBeLessThan(
      projections[1].projectedTotal
    );
    expect(projections[1].projectedTotal).toBeLessThan(
      projections[2].projectedTotal
    );
  });
});
