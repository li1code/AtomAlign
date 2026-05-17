import { UOMType } from '@prisma/client';

export const calculateProgress = (uomType: UOMType, target: number, actual: number): number => {
  if (target === 0 && uomType !== 'ZERO_BASED') return 0;

  let progress = 0;

  switch (uomType) {
    case 'NUMERIC_MIN':
    case 'PERCENT_MIN':
      // Higher is better: Sales Revenue (Actual / Target)
      progress = (actual / target) * 100;
      break;

    case 'NUMERIC_MAX':
    case 'PERCENT_MAX':
      // Lower is better: Cost, TAT (Target / Actual)
      progress = actual === 0 ? 100 : (target / actual) * 100;
      // If we achieved lower than target, progress is > 100%, we cap at 100% or allow overachievement
      break;

    case 'TIMELINE':
      // Date based completion. Let's simplify this to 0 or 100 for now if actual is used as a boolean flag (e.g. 1 for done)
      progress = actual >= target ? 100 : 0;
      break;

    case 'ZERO_BASED':
      // Zero = Success
      progress = actual === 0 ? 100 : 0;
      break;

    default:
      progress = 0;
  }

  // Cap at 100% or allow overachievement based on business rules. We cap at 100% for simple scoring.
  return Math.min(Math.max(progress, 0), 100);
};
