import { UserInputs } from "../carbon";

export function parseNLP(text: string): Partial<UserInputs> {
  const result: Partial<UserInputs> = {};
  const lower = text.toLowerCase();

  const driveMatch = lower.match(/(?:drive|driving|commute)\s*(?:about|around|approximately|~)?\s*(\d+)\s*(?:km|kms|miles|mi|kilometers?|m)?/i);
  if (driveMatch) {
    const val = parseInt(driveMatch[1], 10);
    const unit = driveMatch[0].toLowerCase();
    result.kmDrivenPerWeek = unit.includes("mile") || unit.includes("mi ") ? Math.round(val * 1.609) : val;
  }

  if (/vegan|plant.based|no (animal|meat|dairy)/i.test(lower)) {
    result.dietType = "vegan";
  } else if (/vegetarian|veg\b|no meat/i.test(lower) && !result.dietType) {
    result.dietType = "vegetarian";
  } else if (/heavy.meat|eat.*meat.*daily|meat.*every.*day/i.test(lower)) {
    result.dietType = "heavy-meat";
  } else if (/omnivore|eat.*meat|meat.*3|meat.*three|meat.*times?.*week/i.test(lower)) {
    result.dietType = "omnivore";
  }

  const flightMatch = lower.match(/(?:fly|flight|flying|travel|trip)\s*(?:about|around|~)?\s*(\d+)\s*(?:times?|x\b)?/i);
  if (flightMatch) {
    result.flightsPerYear = parseInt(flightMatch[1], 10);
  }

  return result;
}
