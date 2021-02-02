import { generateScale } from './utils';

const englishFootInMetres = .3048;
const englishInchInMetres = .0254

export const metric = {
    name: 'Metric',
    description: '',
    units: generateScale('m', 'Metre', 'Metres', ['k', 'c', 'm', 'u', 'n', 'p', 'f'])
}

export const englishUnits = {
    name: 'English Units - Pre 1826',
    description: 'All conversions to the metre are through the late 13th century foot',
    units: {
        'twip': {
            singular: 'Twip',
            plural: 'Twips',
            multiplier: .000694444444444444 * englishInchInMetres // 1/20 of a point, 1/200 of a pica, 1/1440 of an inch
        },
        'point': {
            singular: 'Point',
            plural: 'Points',
            multiplier: .013888888888888888 * englishInchInMetres // 1/12 of a pica, 1/72 of an inch
        },
        'pica': {
            singular: 'Pica',
            plural: 'Picas',
            multiplier: .166666666666666666 * englishInchInMetres // 1/6 of an inch
        },
        'line': {
            singular: 'Line',
            plural: 'Lines',
            multiplier: .083333333333333333 * englishInchInMetres, // 1/12 of an inch
            synonyms: [{
                singular: 'Poppyseed',
                plural: 'Poppyseeds'
            }]
        },
        'barleycorn': {
            singular: 'Barleycorn',
            plural: 'Barleycorns',
            multiplier: .333333333333333333 * englishInchInMetres // 1/3 of an inch
        },
        'finger': {
            singular: 'Finger',
            plural: 'Fingers',
            multiplier: .875 * englishInchInMetres // 7/8 of an inch
        },
        'inch': {
            singular: 'Inch',
            plural: 'Inches',
            multiplier: .083333333333333333 * englishFootInMetres // 1/12 of a foot
        },
        'stick': {
            singular: 'Stick',
            plural: 'Sticks',
            multiplier: .166666666666666666 * englishFootInMetres // 1/6 of an foot
        },
        'hand': {
            singular: 'Hand',
            plural: 'Hands',
            multiplier: 0.333333333333333333 * englishFootInMetres // 1/3 of a foot
        },
        'digit': {
            singular: 'Digit',
            plural: 'Digits',
            multiplier: .0625 * englishFootInMetres // 1/16 of a foot
        },
        'palm': {
            singular: 'Palm',
            plural: 'Palms',
            multiplier: .25 * englishFootInMetres // 1/4 of a foot
        },
        'nail': {
            singular: 'Nail',
            plural: 'Nails',
            multiplier: .1875 * englishFootInMetres // 3/16 of a foot
        },
        'shaftment': {
            singular: 'Shaftment',
            plural: 'Shaftments',
            multiplier: .5 * englishFootInMetres // 1/2 of a foot
        },
        'span': {
            singular: 'Span',
            plural: 'Spans',
            multiplier: .75 * englishFootInMetres // 3/4 of a foot
        },
        'link': {
            singular: 'Link',
            plural: 'Links',
            multiplier: .201168 * englishFootInMetres // 33/50 of a foot
        },
        'foot': {
            singular: 'Foot',
            plural: 'Feet',
            multiplier: englishFootInMetres // To metres
        },
        'cubit': {
            singular: 'Cubit',
            plural: 'Cubits',
            multiplier: 1.5 * englishFootInMetres // 3/2 of a foot
        },
        'pace': {
            singular: 'Pace',
            plural: 'Paces',
            multiplier: 2.5 * englishFootInMetres // 5/2 of a foot
        },
        'yard': {
            singular: 'Yard',
            plural: 'Yards',
            multiplier: 3* englishFootInMetres // 3 feet
        },
        'step': {
            singular: 'Step',
            plural: 'Steps',
            multiplier: 5 * englishFootInMetres, // 5 feet
            synonyms: [{
                singular: 'Grade',
                plural: 'Grades'
            }]
        },
        'ell': {
            singular: 'Ell',
            plural: 'Ells',
            multiplier: 3.75 * englishFootInMetres // 15/4 of a foot
        },
        'skein': {
            singular: 'Skein',
            plural: 'Skeins',
            multiplier: 360 * englishFootInMetres // 360 feet
        },
        'spindle': {
            singular: 'Spindle',
            plural: 'Spindles',
            multiplier: 450 * englishFootInMetres // 450 feet
        },
        'rope': {
            singular: 'Rope',
            plural: 'Ropes',
            multiplier: 20 * englishFootInMetres // 20 feet
        },
        'ramsden_chain': {
            singular: 'Ramsden\'s chain',
            plural: 'Ramsden\'s chains',
            multiplier: 100 * englishFootInMetres // 100 feet (5 ropes)
        },
        'roman_mile': {
            singular: 'Roman mile',
            plural: 'Roman miles',
            multiplier:  5000 * englishFootInMetres // 5000 feet (50 Ramsden's chains)
        },
        'rod': {
            singular: 'Rod',
            plural: 'Rods',
            multiplier: 16.5 * englishFootInMetres, // 33/2 feet (11 cubits)
            synonyms: [{
                singular: 'Pole',
                plural: 'Poles'
            }, {
                singular: 'Perch',
                plural: 'Perches'
            }]
        },
        'furlong': {
            singular: 'Furlong',
            plural: 'Furlongs',
            multiplier: 660 * englishFootInMetres // 660 feet (10 Gunter's chains)
        },
        'mile': {
            singular: 'Mile',
            plural: 'Miles',
            multiplier: 5280 * englishFootInMetres // 5280 feet (1760 yards)
        },
        'fathom': {
            singular: 'Fathom',
            plural: 'Fathoms',
            multiplier: 6 * englishFootInMetres // 6 feet (2 yards)
        },
        'shackle': {
            singular: 'Shackle',
            plural: 'Shackles',
            multiplier: 90 * englishFootInMetres // 90 feet (15 fathoms)
        },
        'cable': {
            singular: 'Cable',
            plural: 'Cables',
            multiplier: 600 * englishFootInMetres // 600 feet (100 fathoms)
        },
        'nautical_mile': {
            singular: 'Nautical mile',
            plural: 'Nautical miles',
            multiplier: 6000 * englishFootInMetres // 6000 feet (10 cables)
        },
        'league': {
            singular: 'League',
            plural: 'Leagues',
            multiplier: 9000 * englishFootInMetres // 9000 feet (3 Nautical Miles)
        },
    }
}

export const britishImperial = {
    name: 'Imperial',
    description: '',
    units: {
        'thou': {
            symbol: 'th',
            singular: 'Thou',
            plural: 'Thou',
            multiplier: 0.0000254 // To metres
        },
        'inch': {
            symbol: 'in',
            singular: 'Inch',
            plural: 'Inches',
            multiplier: .0254 // To metres
        },
        'foot': {
            symbol: 'ft',
            singular: 'Foot',
            plural: 'Feet',
            multiplier: 0.3048 // To metres
        },
        'yard': {
            symbol: 'yd',
            singular: 'Yard',
            plural: 'Yards',
            multiplier: 0.9144 // To metres
        },
        'chain': {
            symbol: 'ch',
            singular: 'Chain',
            plural: 'Chains',
            multiplier: 20.1168 // To metres
        },
        'furlong': {
            symbol: 'fur',
            singular: 'Furlong',
            plural: 'Furlongs',
            multiplier: 201.168 // To metres
        },
        'mile': {
            symbol: 'mi',
            singular: 'Mile',
            plural: 'Miles',
            multiplier: 1609.344 // To metres
        },
        'fathom': {
            symbol: 'ftm',
            singular: 'Fathom',
            plural: 'Fathoms',
            multiplier: 1.852 // To metres
        },
        'cable': {
            symbol: 'cable',
            singular: 'Cable',
            plural: 'Cable',
            multiplier: 185.2
        },
        'nautical-mile': {
            symbol: 'nmi',
            singular: 'Nautical Mile',
            plural: 'Nautical Miles',
            multiplier: 1852 // To metres
        },
    }
}

export const guntersUnits = {
    name: 'Imperial - Gunter\'s Survey Units',
    description: '',
    units: {
        'chain': {
            singular: 'Chain',
            plural: 'Chains',
            multiplier: 66 * englishFootInMetres // 66 feet (4 rods)
        },
        'link': {
            symbol: 'link',
            singular: 'Link',
            plural: 'Links',
            multiplier: 0.201168 // To metres
        },
        'rod': {
            symbol: 'rod',
            singular: 'Rods',
            plural: 'Rods',
            multiplier: 5.0292
        },
    }
}

export const usCustomaryUnits = {
    name: 'U.S. Customary Units',
    description: '',
    units: {
        'point': {
            symbol: 'p',
            singular: 'Point',
            plural: 'Points',
            multiplier: 1 / 2834.64 // To metres, 1/12 of a pica
        },
        'pica': {
            symbol: 'pc',
            singular: 'Pica',
            plural: 'Picas',
            multiplier: 1 / 236.22 // To metres, 1/6 of an inch
        },
        'inch': {
            symbol: 'in',
            singular: 'Inch (US Customary)',
            plural: 'Inches (US Customary)',
            multiplier: 1 / 39.37 // To metres
        },
        'foot': {
            symbol: 'ft',
            singular: 'Foot (US Customary)',
            plural: 'Feet (US Customary)',
            multiplier: 1200 / 3937 // To metres
        },
        'yard': {
            symbol: 'yd',
            singular: 'Yard (US Customary)',
            plural: 'Yards (US Customary)',
            multiplier: 3600 / 3937
        },
        'mile': {
            symbol: 'mi',
            singular: 'Mile (US Customary)',
            plural: 'Miles (US Customary)',
            multiplier: 1760 * (3600 / 3937) // To metres
        }
    }
}
