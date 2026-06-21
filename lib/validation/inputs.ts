import { UserInputs } from "../carbon";

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateFootprintInput(inputs: UserInputs): boolean {
  return (
    inputs.kmDrivenPerWeek >= 0 &&
    inputs.publicTransportKmPerWeek >= 0 &&
    inputs.flightsPerYear >= 0 &&
    inputs.electricityKwhPerMonth >= 0 &&
    inputs.onlineOrdersPerMonth >= 0 &&
    inputs.naturalGasThermsPerMonth >= 0 &&
    ["vegan", "vegetarian", "omnivore", "heavy-meat"].includes(inputs.dietType)
  );
}

export function validateScenarioInput(inputs: Partial<UserInputs>): boolean {
  if (inputs.kmDrivenPerWeek !== undefined && inputs.kmDrivenPerWeek < 0) return false;
  if (inputs.publicTransportKmPerWeek !== undefined && inputs.publicTransportKmPerWeek < 0) return false;
  if (inputs.flightsPerYear !== undefined && inputs.flightsPerYear < 0) return false;
  if (inputs.electricityKwhPerMonth !== undefined && inputs.electricityKwhPerMonth < 0) return false;
  return true;
}
