import { generateScale } from './utils';

const englishFootInMetres = .3048;
const englishInchInMetres = .0254

const result = {
    // Metric
    ...generateScale('m', 'Metre', 'Metres', 'Length', 'Metric', ['k', 'c', 'm', 'u', 'n', 'p', 'f']),

    // English Units - In use until 1826
    // ----
    // All conversions to the metre are through the late 13th century foot
    'twip-english': {
        singular: 'Twip',
        plural: 'Twips',
        system: 'English Units - Pre 1826',
        multiplier: .000694444444444444 * englishInchInMetres // 1/20 of a point, 1/200 of a pica, 1/1440 of an inch
    },
    'point-english': {
        singular: 'Point',
        plural: 'Points',
        system: 'English Units - Pre 1826',
        multiplier: .013888888888888888 * englishInchInMetres // 1/12 of a pica, 1/72 of an inch
    },
    'pica-english': {
        singular: 'Pica',
        plural: 'Picas',
        system: 'English Units - Pre 1826',
        multiplier: .166666666666666666 * englishInchInMetres // 1/6 of an inch
    },
    'line-english': {
        singular: 'Line',
        plural: 'Lines',
        system: 'English Units - Pre 1826',
        multiplier: .083333333333333333 * englishInchInMetres, // 1/12 of an inch
        synonyms: [{
            singular: 'Poppyseed',
            plural: 'Poppyseeds'
        }]
    },
    'barleycorn-english': {
        singular: 'Barleycorn',
        plural: 'Barleycorns',
        system: 'English Units - Pre 1826',
        multiplier: .333333333333333333 * englishInchInMetres // 1/3 of an inch
    },
    'finger-english': {
        singular: 'Finger',
        plural: 'Fingers',
        system: 'English Units - Pre 1826',
        multiplier: .875 * englishInchInMetres // 7/8 of an inch
    },
    'inch-english': {
        singular: 'Inch',
        plural: 'Inches',
        system: 'English Units - Pre 1826',
        multiplier: .083333333333333333 * englishFootInMetres // 1/12 of a foot
    },
    'stick-english': {
        singular: 'Stick',
        plural: 'Sticks',
        system: 'English Units - Pre 1826',
        multiplier: .166666666666666666 * englishFootInMetres // 1/6 of an foot
    },
    'hand-english': {
        singular: 'Hand',
        plural: 'Hands',
        system: 'English Units - Pre 1826',
        multiplier: 0.333333333333333333 * englishFootInMetres // 1/3 of a foot
    },
    'digit-english': {
        singular: 'Digit',
        plural: 'Digits',
        system: 'English Units - Pre 1826',
        multiplier: .0625 * englishFootInMetres // 1/16 of a foot
    },
    'palm-english': {
        singular: 'Palm',
        plural: 'Palms',
        system: 'English Units - Pre 1826',
        multiplier: .25 * englishFootInMetres // 1/4 of a foot
    },
    'nail-english': {
        singular: 'Nail',
        plural: 'Nails',
        system: 'English Units - Pre 1826',
        multiplier: .1875 * englishFootInMetres // 3/16 of a foot
    },
    'shaftment-english': {
        singular: 'Shaftment',
        plural: 'Shaftments',
        system: 'English Units - Pre 1826',
        multiplier: .5 * englishFootInMetres // 1/2 of a foot
    },
    'span-english': {
        singular: 'Span',
        plural: 'Spans',
        system: 'English Units - Pre 1826',
        multiplier: .75 * englishFootInMetres // 3/4 of a foot
    },
    'link-english': {
        singular: 'Link',
        plural: 'Links',
        system: 'English Units - Pre 1826',
        multiplier: .201168 * englishFootInMetres // 33/50 of a foot
    },
    'foot-english': {
        singular: 'Foot',
        plural: 'Feet',
        system: 'English Units - Pre 1826',
        multiplier: englishFootInMetres // To metres
    },
    'cubit-english': {
        singular: 'Cubit',
        plural: 'Cubits',
        system: 'English Units - Pre 1826',
        multiplier: 1.5 * englishFootInMetres // 3/2 of a foot
    },
    'pace-english': {
        singular: 'Pace',
        plural: 'Paces',
        system: 'English Units - Pre 1826',
        multiplier: 2.5 * englishFootInMetres // 5/2 of a foot
    },
    'yard-english': {
        singular: 'Yard',
        plural: 'Yards',
        system: 'English Units - Pre 1826',
        multiplier: 3* englishFootInMetres // 3 feet
    },
    'step-english': {
        singular: 'Step',
        plural: 'Steps',
        system: 'English Units - Pre 1826',
        multiplier: 5 * englishFootInMetres, // 5 feet
        synonyms: [{
            singular: 'Grade',
            plural: 'Grades'
        }]
    },
    'ell-english': {
        singular: 'Ell',
        plural: 'Ells',
        system: 'English Units - Pre 1826',
        multiplier: 3.75 * englishFootInMetres // 15/4 of a foot
    },
    'skein-english': {
        singular: 'Skein',
        plural: 'Skeins',
        system: 'English Units - Pre 1826',
        multiplier: 360 * englishFootInMetres // 360 feet
    },
    'spindle-english': {
        singular: 'Spindle',
        plural: 'Spindles',
        system: 'English Units - Pre 1826',
        multiplier: 450 * englishFootInMetres // 450 feet
    },
    'rope-english': {
        singular: 'Rope',
        plural: 'Ropes',
        system: 'English Units - Pre 1826',
        multiplier: 20 * englishFootInMetres // 20 feet
    },
    'ramsden_chain-english': {
        singular: 'Ramsden\'s chain',
        plural: 'Ramsden\'s chains',
        system: 'English Units - Pre 1826',
        multiplier: 100 * englishFootInMetres // 100 feet (5 ropes)
    },
    'roman_mile-english': {
        singular: 'Roman mile',
        plural: 'Roman miles',
        system: 'English Units - Pre 1826',
        multiplier:  5000 * englishFootInMetres // 5000 feet (50 Ramsden's chains)
    },
    'rod-english': {
        singular: 'Rod',
        plural: 'Rods',
        system: 'English Units - Pre 1826',
        multiplier: 16.5 * englishFootInMetres, // 33/2 feet (11 cubits)
        synonyms: [{
            singular: 'Pole',
            plural: 'Poles'
        }, {
            singular: 'Perch',
            plural: 'Perches'
        }]
    },
    'furlong-english': {
        singular: 'Furlong',
        plural: 'Furlongs',
        system: 'English Units - Pre 1826',
        multiplier: 660 * englishFootInMetres // 660 feet (10 Gunter's chains)
    },
    'mile-english': {
        singular: 'Mile',
        plural: 'Miles',
        system: 'English Units - Pre 1826',
        multiplier: 5280 * englishFootInMetres // 5280 feet (1760 yards)
    },
    'fathom-english': {
        singular: 'Fathom',
        plural: 'Fathoms',
        system: 'English Units - Pre 1826',
        multiplier: 6 * englishFootInMetres // 6 feet (2 yards)
    },
    'shackle-english': {
        singular: 'Shackle',
        plural: 'Shackles',
        system: 'English Units - Pre 1826',
        multiplier: 90 * englishFootInMetres // 90 feet (15 fathoms)
    },
    'cable-english': {
        singular: 'Cable',
        plural: 'Cables',
        system: 'English Units - Pre 1826',
        multiplier: 600 * englishFootInMetres // 600 feet (100 fathoms)
    },
    'nautical_mile-english': {
        singular: 'Nautical mile',
        plural: 'Nautical miles',
        system: 'English Units - Pre 1826',
        multiplier: 6000 * englishFootInMetres // 6000 feet (10 cables)
    },
    'league-english': {
        singular: 'League',
        plural: 'Leagues',
        system: 'English Units - Pre 1826',
        multiplier: 9000 * englishFootInMetres // 9000 feet (3 Nautical Miles)
    },

    // British Imperial
    'thou-imperial': {
        symbol: 'th',
        singular: 'Thou',
        plural: 'Thou',
        system: 'Imperial',
        multiplier: 0.0000254 // To metres
    },
    'inch-imperial': {
        symbol: 'in',
        singular: 'Inch',
        plural: 'Inches',
        system: 'Imperial',
        multiplier: .0254 // To metres
    },
    'foot-imperial': {
        symbol: 'ft',
        singular: 'Foot',
        plural: 'Feet',
        system: 'Imperial',
        multiplier: 0.3048 // To metres
    },
    'yard-imperial': {
        symbol: 'yd',
        singular: 'Yard',
        plural: 'Yards',
        system: 'Imperial',
        multiplier: 0.9144 // To metres
    },
    'chain-imperial': {
        symbol: 'ch',
        singular: 'Chain',
        plural: 'Chains',
        system: 'Imperial',
        multiplier: 20.1168 // To metres
    },
    'furlong-imperial': {
        symbol: 'fur',
        singular: 'Furlong',
        plural: 'Furlongs',
        system: 'Imperial',
        multiplier: 201.168 // To metres
    },
    'mile-imperial': {
        symbol: 'mi',
        singular: 'Mile',
        plural: 'Miles',
        system: 'Imperial',
        multiplier: 1609.344 // To metres
    },
    'fathom-imperial-maritime': {
        symbol: 'ftm',
        singular: 'Fathom',
        plural: 'Fathoms',
        system: 'Imperial - Maritime',
        multiplier: 1.852 // To metres
    },
    'cable-imperial-maritime': {
        symbol: 'cable',
        singular: 'Cable',
        plural: 'Cable',
        system: 'Imperial - Maritime',
        multiplier: 185.2
    },
    'nautical-mile-imperial-maritime': {
        symbol: 'nmi',
        singular: 'Nautical Mile',
        plural: 'Nautical Miles',
        system: 'Imperial - Maritime',
        multiplier: 1852 // To metres
    },

    // Gunter's Survey Units
    'chain-gunter': {
        singular: 'Chain',
        plural: 'Chains',
        system: 'Imperial - Gunter\s Survey Units',
        multiplier: 66 * englishFootInMetres // 66 feet (4 rods)
    },
    'link-gunter': {
        symbol: 'link',
        singular: 'Link',
        plural: 'Links',
        system: 'Imperial - Gunter\'s Survey Units',
        multiplier: 0.201168 // To metres
    },
    'rod-gunter': {
        symbol: 'rod',
        singular: 'Rods',
        plural: 'Rods',
        system: 'Imperial - Gunter\'s Survey Units',
        multiplier: 5.0292
    },

    // U.S. Customary Units
    'point-us': {
        symbol: 'p',
        singular: 'Point',
        plural: 'Points',
        system: 'US Customary',
        multiplier: 1 / 2834.64 // To metres, 1/12 of a pica
    },
    'pica-us': {
        symbol: 'pc',
        singular: 'Pica',
        plural: 'Picas',
        system: 'US Customary',
        multiplier: 1 / 236.22 // To metres, 1/6 of an inch
    },
    'inch-us': {
        symbol: 'in-us',
        singular: 'Inch (US Customary)',
        plural: 'Inches (US Customary)',
        system: 'US Customary',
        multiplier: 1 / 39.37 // To metres
    },
    'foot-us': {
        symbol: 'ft-us',
        singular: 'Foot (US Customary)',
        plural: 'Feet (US Customary)',
        system: 'US Customary',
        multiplier: 1200 / 3937 // To metres
    },
    'yard-us': {
        symbol: 'yd-us',
        singular: 'Yard (US Customary)',
        plural: 'Yards (US Customary)',
        system: 'US Customary',
        multiplier: 3600 / 3937
    },
    'mile-us': {
        symbol: 'mi-us',
        singular: 'Mile (US Customary)',
        plural: 'Miles (US Customary)',
        system: 'US Customary',
        multiplier: 1760 * (3600 / 3937) // To metres
    }
}

Object.keys(result)
    .forEach((key) => {
        result[key].measure = 'Length';
    });
export default result;