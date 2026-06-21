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

export interface ActionRecord {
  id: string;
  label: string;
  savingsKg: number;
  checked: boolean;
}
