import { generateScale } from './utils';

export default {
    ...generateScale('Wh', 'Watt-hour', 'Watt-hours', 'Energy', 'Metric', ['G', 'M', 'k', 'm']),
    GJ: {
        symbol: 'GJ',
        singular: 'Gigajoule',
        plural: 'Gigajoules',
        measure: 'Energy',
        system: 'Metric',
        multiplier: 1 / 0.0000036
    },
    MJ: {
        symbol: 'MJ',
        singular: 'Megajoule',
        plural: 'Megajoules',
        measure: 'Energy',
        system: 'Metric',
        multiplier: 1 / 0.0036
    },
    kJ: {
        symbol: 'MJ',
        singular: 'Megajoule',
        plural: 'Megajoules',
        measure: 'Energy',
        system: 'Metric',
        multiplier: 1 / 3.6
    },
    J: {
        symbol: 'J',
        singular: 'Joule',
        plural: 'Joules',
        measure: 'Energy',
        system: 'Metric',
        multiplier: 1 / 3600
    }
}