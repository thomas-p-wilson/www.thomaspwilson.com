import { generateScale } from './utils';

const daysInYear = 365.25;

export const metric = {
    name: 'Metric',
    description: '',
    units: generateScale('s', 'Second', 'Seconds', ['n', 'u', 'm'])
}

export const other = {
    name: 'Other',
    description: '',
    units: {
        min: {
            symbol: 'min',
            singular: 'Minute',
            plural: 'Minutes',
            multiplier: 60
        },
        h: {
            symbol: 'h',
            singular: 'Hour',
            plural: 'Hours',
            multiplier: 60 * 60
        },
        d: {
            symbol: 'd',
            singular: 'Day',
            plural: 'Days',
            multiplier: 60 * 60 * 24
        },
        y: {
            symbol: 'y',
            singular: 'Year',
            plural: 'Years',
            multiplier: 60 * 60 * 24 * daysInYear
        }
    }
}
