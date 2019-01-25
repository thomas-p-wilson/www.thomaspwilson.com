import { generateScale } from './utils';

export default {
    ...generateScale('m', 'Metre', 'Metres', 'Length', 'Metric', ['k', 'c', 'm', 'u', 'n', 'p', 'f']),
    in: {
        symbol: 'in',
        singular: 'Inch',
        plural: 'Inches',
        measure: 'Length',
        system: 'Imperial',
        multiplier: .0254 // To metres
    },
    'in-us': {
        symbol: 'in-us',
        singular: 'Inch (US Customary)',
        plural: 'Inches (US Customary)',
        measure: 'Length',
        system: 'US Customary',
        multiplier: 1 / 39.37 // To metres
    },
    yd: {
        symbol: 'yd',
        singular: 'Yard',
        plural: 'Yards',
        measure: 'Length',
        system: 'Imperial',
        multiplier: 0.9144 // To metres
    },
    ft: {
        symbol: 'ft',
        singular: 'Foot',
        plural: 'Feet',
        measure: 'Length',
        system: 'Imperial',
        multiplier: 0.3048 // To metres
    },
    'ft-us': {
        symbol: 'ft-us',
        singular: 'Foot (US Customary)',
        plural: 'Feet (US Customary)',
        measure: 'Length',
        system: 'US Customary',
        multiplier: 1200 / 3937 // To metres
    },
    fathom: {
        symbol: 'fathom',
        singular: 'Fathom',
        plural: 'Fathoms',
        measure: 'Length',
        system: 'Imperial',
        multiplier: 1.8288 // To metres
    },
    mi: {
        symbol: 'mi',
        singular: 'Mile',
        plural: 'Miles',
        measure: 'Length',
        system: 'Imperial',
        multiplier: 1609.344 // To metres
    },
    'mi-us': {
        symbol: 'mi-us',
        singular: 'Mile (US Customary)',
        plural: 'Miles (US Customary)',
        measure: 'Length',
        system: 'US Customary',
        multiplier: 1609.347 // To metres
    },
    nmi: {
        symbol: 'nmi',
        singular: 'Nautical Mile',
        plural: 'Nautical Miles',
        measure: 'Length',
        system: 'Maritime',
        multiplier: 1852 // To metres
    }
}
