export const US_NATIONAL_AVERAGE = 16000; // kg CO2/year

export const EMISSION_FACTORS = {
  carPerKm: 0.251,
  publicTransportPerKm: 0.089,
  flightPerTrip: 637.5,
  electricityPerKwh: 0.42,
  naturalGasPerTherm: 5.3,
  shoppingPerOrder: 3.5,
} as const;

export const DIET_FACTORS = {
  vegan: 1500,
  vegetarian: 1700,
  omnivore: 2500,
  "heavy-meat": 3300,
} as const;
