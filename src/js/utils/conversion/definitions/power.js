import { generateScale } from './utils';

export const metric = {
	name: 'Metric',
	description: '',
	units: generateScale('W', 'Watt', 'Watts', ['G', 'M', 'k', 'm'])
}