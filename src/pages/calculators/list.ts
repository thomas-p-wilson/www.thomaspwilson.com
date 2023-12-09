import { CalculatorDescriptor } from '@/types/CalculatorDescriptor';

const jsons = require.context(__dirname, true, /\.json$/);

export const descriptors: CalculatorDescriptor[] = jsons.keys()
  .map((key) => ({
    ...jsons(key),
    dir: key.substring(2, key.lastIndexOf('/'))
  } satisfies CalculatorDescriptor)) as CalculatorDescriptor[]
console.log('Descriptors: ', descriptors);
