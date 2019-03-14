import { generateScale } from './utils';

export const metric = {
    name: 'Metric',
    description: '',
    units: {
        ...generateScale('Wh', 'Watt-hour', 'Watt-hours', ['G', 'M', 'k', 'm']),
        GJ: {
            symbol: 'GJ',
            singular: 'Gigajoule',
            plural: 'Gigajoules',
            multiplier: 1 / 0.0000036
        },
        MJ: {
            symbol: 'MJ',
            singular: 'Megajoule',
            plural: 'Megajoules',
            multiplier: 1 / 0.0036
        },
        kJ: {
            symbol: 'MJ',
            singular: 'Megajoule',
            plural: 'Megajoules',
            multiplier: 1 / 3.6
        },
        J: {
            symbol: 'J',
            singular: 'Joule',
            plural: 'Joules',
            multiplier: 1 / 3600
        }
    }
}
