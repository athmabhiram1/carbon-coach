import { Persona } from "../personas";
import { EMISSION_FACTORS, DIET_FACTORS, US_NATIONAL_AVERAGE } from "../../config/carbon";

export interface UserInputs {
  kmDrivenPerWeek: number;
  publicTransportKmPerWeek: number;
  flightsPerYear: number;
  dietType: "vegan" | "vegetarian" | "omnivore" | "heavy-meat";
  electricityKwhPerMonth: number;
  onlineOrdersPerMonth: number;
  naturalGasThermsPerMonth: number;
}

export interface FootprintResult {
  totalKgCO2PerYear: number;
  breakdown: {
    transport: number;
    diet: number;
    energy: number;
    shopping: number;
  };
  comparisonToPersonaBaseline: number;
  comparisonToNationalAverage: number;
  severity: "excellent" | "good" | "average" | "high" | "critical";
  topCategory: string;
}

function clamp(value: number): number {
  return Math.max(0, value);
}

export function calculateFootprint(
  inputs: UserInputs,
  persona: Persona
): FootprintResult {
  const kmDriven = clamp(inputs.kmDrivenPerWeek);
  const pubTransport = clamp(inputs.publicTransportKmPerWeek);
  const flights = clamp(inputs.flightsPerYear);
  const electricity = clamp(inputs.electricityKwhPerMonth);
  const orders = clamp(inputs.onlineOrdersPerMonth);
  const gas = clamp(inputs.naturalGasThermsPerMonth);

  const transport =
    kmDriven * 52 * EMISSION_FACTORS.carPerKm +
    pubTransport * 52 * EMISSION_FACTORS.publicTransportPerKm +
    flights * EMISSION_FACTORS.flightPerTrip;

  const diet = DIET_FACTORS[inputs.dietType];

  const energy =
    electricity * 12 * EMISSION_FACTORS.electricityPerKwh +
    gas * 12 * EMISSION_FACTORS.naturalGasPerTherm;

  const shopping = orders * 12 * EMISSION_FACTORS.shoppingPerOrder;

  const totalKgCO2PerYear = transport + diet + energy + shopping;

  const personaBaselineTotal =
    persona.baseline.transport +
    persona.baseline.diet +
    persona.baseline.energy +
    persona.baseline.shopping;

  const comparisonToPersonaBaseline =
    personaBaselineTotal > 0
      ? ((totalKgCO2PerYear - personaBaselineTotal) / personaBaselineTotal) * 100
      : 0;

  const comparisonToNationalAverage =
    ((totalKgCO2PerYear - US_NATIONAL_AVERAGE) / US_NATIONAL_AVERAGE) * 100;

  let severity: FootprintResult["severity"];
  if (totalKgCO2PerYear < 4000) {
    severity = "excellent";
  } else if (totalKgCO2PerYear < 8000) {
    severity = "good";
  } else if (totalKgCO2PerYear < 12000) {
    severity = "average";
  } else if (totalKgCO2PerYear < 20000) {
    severity = "high";
  } else {
    severity = "critical";
  }

  const categories: [string, number][] = [
    ["transport", transport],
    ["diet", diet],
    ["energy", energy],
    ["shopping", shopping],
  ];
  const topCategory = [...categories].sort((a, b) => b[1] - a[1])[0][0];

  return {
    totalKgCO2PerYear,
    breakdown: { transport, diet, energy, shopping },
    comparisonToPersonaBaseline,
    comparisonToNationalAverage,
    severity,
    topCategory,
  };
}
