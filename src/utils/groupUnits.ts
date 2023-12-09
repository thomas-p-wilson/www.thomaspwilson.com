import { Unit } from '@/units/Unit';

export const groupUnits = (measure: { [k: string]: Unit }) => (
  Object.keys(measure)
    .reduce((result, id: keyof typeof measure) => {
      result[measure[id]!.system] = result[measure[id]!.system] ?? {};
      result[measure[id]!.system][id] = measure[id]!;
      return result;
    }, {} as { [k in Unit['system']]: { [k: string]: Unit }})
)
