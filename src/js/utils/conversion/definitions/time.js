import { generateScale } from './utils';

const daysInYear = 365.25;

export default {
    ...generateScale('s', 'Second', 'Seconds', 'Time', 'Metric', ['n', 'u', 'm']),
    min: {
        symbol: 'min',
        singular: 'Minute',
        plural: 'Minutes',
        measure: 'Time',
        multiplier: 60
    },
    h: {
        symbol: 'h',
        singular: 'Hour',
        plural: 'Hours',
        measure: 'Time',
        multiplier: 60 * 60
    },
    d: {
        symbol: 'd',
        singular: 'Day',
        plural: 'Days',
        measure: 'Time',
        multiplier: 60 * 60 * 24
    },
    y: {
        symbol: 'y',
        singular: 'Year',
        plural: 'Years',
        measure: 'Time',
        multiplier: 60 * 60 * 24 * daysInYear
    }
}
