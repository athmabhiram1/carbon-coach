import { FootprintResult } from "./carbonCalculator";

export interface Action {
  id: string;
  label: string;
  savingsKg: number;
}

export interface TimeMachineProjection {
  years: number;
  projectedTotal: number;
  projectedWithActions: number;
  savingsPotential: number;
  equivalentTrees: number;
  equivalentMiles: number;
}

export function projectFootprint(
  currentResult: FootprintResult,
  actions: Action[],
  years: number
): TimeMachineProjection {
  const projectedTotal = currentResult.totalKgCO2PerYear * years;
  const annualSavings = actions.reduce((sum, a) => sum + a.savingsKg, 0);
  const projectedWithActions = Math.max(
    0,
    (currentResult.totalKgCO2PerYear - annualSavings) * years
  );
  const savingsPotential = Math.max(0, projectedTotal - projectedWithActions);

  return {
    years,
    projectedTotal: Math.round(projectedTotal),
    projectedWithActions: Math.round(projectedWithActions),
    savingsPotential: Math.round(savingsPotential),
    equivalentTrees: Math.round(savingsPotential / 22),
    equivalentMiles: Math.round(savingsPotential / 0.404),
  };
}

export function getAllProjections(
  currentResult: FootprintResult,
  actions: Action[]
): TimeMachineProjection[] {
  return [1, 5, 10].map((years) =>
    projectFootprint(currentResult, actions, years)
  );
}
