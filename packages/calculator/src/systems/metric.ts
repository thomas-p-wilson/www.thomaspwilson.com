import { System } from '../types/System';
import { generateScale } from '../utils/scale';

export const metric: System = {
  name: 'Metric',
  description: '',
  measures: {
    length: generateScale('m', 'Metre', 'Metres', ['k', 'c', 'm', 'u', 'n', 'p', 'f'])
  }
}
