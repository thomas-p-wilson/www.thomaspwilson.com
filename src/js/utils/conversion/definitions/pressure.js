import { generateScale } from './utils';

export default {
    ...generateScale('Pa', 'Pascal', 'Pascals', 'Pressure', 'Metric', ['M', 'k', 'h', 'm']),
    bar: {
        symbol: 'bar',
        singular: 'Bar',
        plural: 'Bar',
        measure: 'Pressure',
        system: 'Metric',
        multiplier: 100
    },
    torr: {
        symbol: 'torr',
        singular: 'Torr',
        plural: 'Torr',
        measure: 'Pressure',
        system: 'Metric',
        multiplier: 101325/760000
    },
    psi: {
        symbol: 'psi',
        singular: 'Pound per square inch',
        plural: 'Pounds per square inch',
        measure: 'Pressure',
        system: 'Imperial',
        multiplier: 4.4482216152605 / 0.00064516
    },
    ksi: {
        symbol: 'psi',
        singular: 'Pound per square inch',
        plural: 'Pounds per square inch',
        measure: 'Pressure',
        system: 'Imperial',
        multiplier: 4.4482216152605 / 0.00064516 * 1000
    },
    Mpsi: {
        symbol: 'psi',
        singular: 'Pound per square inch',
        plural: 'Pounds per square inch',
        measure: 'Pressure',
        system: 'Imperial',
        multiplier: 4.4482216152605 / 0.00064516 * 1000000
    }
}
