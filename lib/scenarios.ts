import { UserInputs, FootprintResult, calculateFootprint } from "./carbonCalculator";
import { Persona } from "./personas";

export interface Scenario {
  id: string;
  label: string;
  description: string;
  apply: (inputs: UserInputs) => Partial<UserInputs>;
  estimatedSavingsKg: number;
}

const SCENARIO_DEFINITIONS: Omit<Scenario, "estimatedSavingsKg">[] = [
  {
    id: "switch-to-ev",
    label: "Switch to EV",
    description: "Reduce transport emissions by 60% by switching to an electric vehicle",
    apply: (inputs) => ({
      kmDrivenPerWeek: inputs.kmDrivenPerWeek,
      publicTransportKmPerWeek: inputs.publicTransportKmPerWeek,
      flightsPerYear: inputs.flightsPerYear,
      dietType: inputs.dietType,
      electricityKwhPerMonth: inputs.electricityKwhPerMonth,
      onlineOrdersPerMonth: inputs.onlineOrdersPerMonth,
      naturalGasThermsPerMonth: inputs.naturalGasThermsPerMonth,
    }),
  },
  {
    id: "go-vegan",
    label: "Go Vegan",
    description: "Adopt a plant-based diet to reduce food emissions",
    apply: () => ({ dietType: "vegan" as const }),
  },
  {
    id: "less-flying",
    label: "50% Less Flying",
    description: "Halve your annual flights",
    apply: (inputs) => ({
      flightsPerYear: Math.floor(inputs.flightsPerYear / 2),
    }),
  },
  {
    id: "renewable-energy",
    label: "Renewable Energy",
    description: "Switch to renewable energy to reduce energy emissions by 80%",
    apply: (inputs) => ({
      electricityKwhPerMonth: Math.floor(inputs.electricityKwhPerMonth * 0.2),
      naturalGasThermsPerMonth: Math.floor(inputs.naturalGasThermsPerMonth * 0.2),
    }),
  },
  {
    id: "buy-local",
    label: "Buy Local Only",
    description: "Reduce online shopping and buy local to cut shipping emissions",
    apply: (inputs) => ({
      onlineOrdersPerMonth: Math.floor(inputs.onlineOrdersPerMonth * 0.6),
    }),
  },
];

export const SCENARIO_IDS = SCENARIO_DEFINITIONS.map((s) => s.id);

function calculateScenarioSavings(
  definition: Omit<Scenario, "estimatedSavingsKg">,
  inputs: UserInputs,
  persona: Persona
): number {
  const modifiedInputs = { ...inputs, ...definition.apply(inputs) };
  const originalResult = calculateFootprint(inputs, persona);
  const modifiedResult = calculateFootprint(modifiedInputs as UserInputs, persona);

  const savings =
    originalResult.totalKgCO2PerYear - modifiedResult.totalKgCO2PerYear;

  return Math.max(0, Math.round(savings));
}

export function getScenarios(inputs: UserInputs, persona: Persona): Scenario[] {
  return SCENARIO_DEFINITIONS.map((def) => ({
    ...def,
    estimatedSavingsKg: calculateScenarioSavings(def, inputs, persona),
  }));
}

export function applyScenario(
  inputs: UserInputs,
  scenarioId: string,
  persona: Persona
): FootprintResult {
  const definition = SCENARIO_DEFINITIONS.find((s) => s.id === scenarioId);
  if (!definition) {
    return calculateFootprint(inputs, persona);
  }
  const modifiedInputs = { ...inputs, ...definition.apply(inputs) };
  return calculateFootprint(modifiedInputs as UserInputs, persona);
}
