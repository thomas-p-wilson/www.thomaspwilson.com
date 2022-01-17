import { metric } from './metric';
import { englishUnits } from './english-pre-1826';
import { Measure, System, Unit } from '../types/System';

export const systems = [
  metric,
  englishUnits,
];

/**
 * Map of units, keyed by symbol or lowercase singular name
 */
export const units = systems.reduce((res: Map<string, Unit>, system: System): Map<string, Unit> => (
  Object.values(system.measures)
    .reduce((res2: Map<string, Unit>, measure: Measure): Map<string, Unit> => (
      Array.from(measure.values())
        .reduce((res3: Map<string, Unit>, unit: Unit) => (
          res3.set(unit.symbol || unit.singular.toLowerCase(), unit)
        ), res2)
    ), res)
), new Map<string, Unit>());
