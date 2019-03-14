import { generateScale } from './utils';

export const metric = {
    name: 'Metric',
    description: '',
    units: generateScale('Pa', 'Pascal', 'Pascals', ['M', 'k', 'h', 'm'])
}

export const other = {
    name: 'Other',
    description: '',
    units: {
        bar: {
            symbol: 'bar',
            singular: 'Bar',
            plural: 'Bar',
            multiplier: 100
        },
        torr: {
            symbol: 'torr',
            singular: 'Torr',
            plural: 'Torr',
            multiplier: 101325 / 760000
        },
        psi: {
            symbol: 'psi',
            singular: 'Pound per square inch',
            plural: 'Pounds per square inch',
            multiplier: 4.4482216152605 / 0.00064516
        }
    }
}
