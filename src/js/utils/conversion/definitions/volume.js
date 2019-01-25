import { generateScale } from './utils';

export default {
    ...generateScale('L', 'Litre', 'Litres', 'Volume', 'Metric', ['k', 'd', 'c', 'm']),
    mm3: {
        symbol: 'mm3',
        singular: 'Cubic Millimetre',
        plural: 'Cubic Millimetres',
        measure: 'Volume',
        system: 'Metric',
        multiplier: 1 / 1000000
    },
    cm3: {
        symbol: 'cm3',
        singular: 'Cubic Centimetre',
        plural: 'Cubic Centimetres',
        measure: 'Volume',
        system: 'Metric',
        multiplier: 1 / 1000
    },
    m3: {
        symbol: 'm3',
        singular: 'Cubic Metre',
        plural: 'Cubic Metres',
        measure: 'Volume',
        system: 'Metric',
        multiplier: 1000
    },
    km3: {
        symbol: 'km3',
        singular: 'Cubic Kilometre',
        plural: 'Cubic Kilometres',
        measure: 'Volume',
        system: 'Metric',
        multiplier: 1000000000000
    },
    tsp: {
        symbol: 'tsp',
        singular: 'Teaspoon',
        plural: 'Teaspoons',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 0.005
    },
    tbsp: {
        symbol: 'tbsp',
        singular: 'Tablespoon',
        plural: 'Tablespoons',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 0.0148
    },
    in3: {
        symbol: 'in3',
        singular: 'Cubic Inch',
        plural: 'Cubic Inches',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 0.0163871
    },
    'fl-oz': {
        symbol: 'fl-oz',
        singular: 'Fluid Ounce',
        plural: 'Fluid Ounces',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 0.02841312491923635
    },
    cup: {
        symbol: 'cup',
        singular: 'Cup',
        plural: 'Cups',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: .25
    },
    pnt: {
        symbol: 'pnt',
        singular: 'Pint',
        plural: 'Pints',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: .56826125
    },
    qt: {
        symbol: 'qt',
        singular: 'Quart',
        plural: 'Quarts',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 1.1365225
    },
    gal: {
        symbol: 'gal',
        singular: 'Gallon',
        plural: 'Gallons',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 4.54609
    },
    ft3: {
        symbol: 'ft3',
        singular: 'Cubic Foot',
        plural: 'Cubic Feet',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 28.3168864564566
    },
    yd3: {
        symbol: 'yd3',
        singular: 'Cubic Yard',
        plural: 'Cubic Yard',
        measure: 'Volume',
        system: 'Imperial',
        multiplier: 764.555
    }
}
