import BigDecimal from 'decimal.js';
import { groupUnits } from '@/utils/groupUnits';
import { Unit } from './Unit';

const englishFootInMetres = new BigDecimal('.3048');
const englishInchInMetres = new BigDecimal('.0254');

export const measure = {
  // Metric
  'metric-femtometre': {
    symbol: 'fm',
    singular: 'Femtometre',
    plural: 'Femtometres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-15')),
    system: 'Metric',
  },
  'metric-picometre': {
    symbol: 'fm',
    singular: 'Picometre',
    plural: 'Picometres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-12')),
    system: 'Metric',
  },
  'metric-nanometre': {
    symbol: 'nm',
    singular: 'Nanometre',
    plural: 'Nanometres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-9')),
    system: 'Metric',
  },
  'metric-micrometre': {
    symbol: 'um',
    singular: 'Micrometre',
    plural: 'Micrometres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-6')),
    system: 'Metric',
  },
  'metric-millimetre': {
    symbol: 'mm',
    singular: 'Millimetre',
    plural: 'Millimetres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-3')),
    system: 'Metric',
  },
  'metric-centimetre': {
    symbol: 'cm',
    singular: 'Centimetre',
    plural: 'Centimetres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('-2')),
    system: 'Metric',
  },
  'metric-metre': {
    symbol: 'm',
    singular: 'Metre',
    plural: 'Metres',
    multiplier: new BigDecimal('1'),
    system: 'Metric',
  },
  'metric-kilometre': {
    symbol: 'km',
    singular: 'Kilometre',
    plural: 'Kilometres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('3')),
    system: 'Metric',
  },
  'metric-megametre': {
    symbol: 'Mm',
    singular: 'Megametre',
    plural: 'Megametres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('6')),
    system: 'Metric',
  },
  'metric-gigametre': {
    symbol: 'Gm',
    singular: 'Gigametre',
    plural: 'Gigametres',
    multiplier: new BigDecimal('10').pow(new BigDecimal('6')),
    system: 'Metric',
  },

  // U.S. Customary Units
  'us-customary-point': {
    symbol: 'p',
    singular: 'Point',
    plural: 'Points',
    multiplier: new BigDecimal('1').div(new BigDecimal('2834.64')), // To metres, 1/12 of a pica
    system: 'U.S. Customary Units',
  },
  'us-customary-pica': {
    symbol: 'pc',
    singular: 'Pica',
    plural: 'Picas',
    multiplier: new BigDecimal('1').div(new BigDecimal('236.22')), // To metres, 1/6 of an inch
    system: 'U.S. Customary Units',
  },
  'us-customary-inch': {
    symbol: 'in',
    singular: 'Inch (US Customary)',
    plural: 'Inches (US Customary)',
    multiplier: new BigDecimal('1').div(new BigDecimal('39.37')), // To metres
    system: 'U.S. Customary Units',
  },
  'us-customary-foot': {
    symbol: 'ft',
    singular: 'Foot (US Customary)',
    plural: 'Feet (US Customary)',
    multiplier: new BigDecimal('1200').div(new BigDecimal('3937')), // To metres
    system: 'U.S. Customary Units',
  },
  'us-customary-yard': {
    symbol: 'yd',
    singular: 'Yard (US Customary)',
    plural: 'Yards (US Customary)',
    multiplier: new BigDecimal('3600').div(new BigDecimal('3937')),
    system: 'U.S. Customary Units',
  },
  'us-customary-mile': {
    symbol: 'mi',
    singular: 'Mile (US Customary)',
    plural: 'Miles (US Customary)',
    multiplier: new BigDecimal('1760').times(new BigDecimal('3600').div(3937)), // To metres
    system: 'U.S. Customary Units',
  },

  // British Imperial Units
  'british-imperial-thou': {
    symbol: 'th',
    singular: 'Thou',
    plural: 'Thou',
    multiplier: new BigDecimal('0.0000254'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-inch': {
    symbol: 'in',
    singular: 'Inch',
    plural: 'Inches',
    multiplier: new BigDecimal('.0254'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-foot': {
    symbol: 'ft',
    singular: 'Foot',
    plural: 'Feet',
    multiplier: new BigDecimal('0.3048'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-yard': {
    symbol: 'yd',
    singular: 'Yard',
    plural: 'Yards',
    multiplier: new BigDecimal('0.9144'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-chain': {
    symbol: 'ch',
    singular: 'Chain',
    plural: 'Chains',
    multiplier: new BigDecimal('20.1168'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-furlong': {
    symbol: 'fur',
    singular: 'Furlong',
    plural: 'Furlongs',
    multiplier: new BigDecimal('201.168'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-mile': {
    symbol: 'mi',
    singular: 'Mile',
    plural: 'Miles',
    multiplier: new BigDecimal('1609.344'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-fathom': {
    symbol: 'ftm',
    singular: 'Fathom',
    plural: 'Fathoms',
    multiplier: new BigDecimal('1.852'), // To metres
    system: 'British Imperial Units',
  },
  'british-imperial-cable': {
    symbol: 'cable',
    singular: 'Cable',
    plural: 'Cable',
    multiplier: new BigDecimal('185.2'),
    system: 'British Imperial Units',
  },
  'british-imperial-nautical-mile': {
    symbol: 'nmi',
    singular: 'Nautical Mile',
    plural: 'Nautical Miles',
    multiplier: new BigDecimal('1852'), // To metres
    system: 'British Imperial Units',
  },

  // English Units - Pre 1826
  // All conversions to the metre are through the late 13th century foot
  'english-twip': {
    symbol: 'twip',
    singular: 'Twip',
    plural: 'Twips',
    multiplier: new BigDecimal('.000694444444444444').times(englishInchInMetres), // 1/20 of a point, 1/200 of a pica, 1/1440 of an inch
    system: 'English Units - Pre 1826',
  },
  'english-point': {
    symbol: 'point',
    singular: 'Point',
    plural: 'Points',
    multiplier: new BigDecimal('.013888888888888888').times(englishInchInMetres), // 1/12 of a pica, 1/72 of an inch
    system: 'English Units - Pre 1826',
  },
  'english-pica': {
    symbol: 'pica',
    singular: 'Pica',
    plural: 'Picas',
    multiplier: new BigDecimal('.166666666666666666').times(englishInchInMetres), // 1/6 of an inch
    system: 'English Units - Pre 1826',
  },
  'english-line': {
    symbol: 'line',
    singular: 'Line',
    plural: 'Lines',
    multiplier: new BigDecimal('.083333333333333333').times(englishInchInMetres), // 1/12 of an inch
    system: 'English Units - Pre 1826',
    synonyms: [{
      singular: 'Poppyseed',
      plural: 'Poppyseeds'
    }]
  },
  'english-barleycorn': {
    symbol: 'barleycorn',
    singular: 'Barleycorn',
    plural: 'Barleycorns',
    multiplier: new BigDecimal('.333333333333333333').times(englishInchInMetres), // 1/3 of an inch
    system: 'English Units - Pre 1826',
  },
  'english-finger': {
    symbol: 'finger',
    singular: 'Finger',
    plural: 'Fingers',
    multiplier: new BigDecimal('.875').times(englishInchInMetres), // 7/8 of an inch
    system: 'English Units - Pre 1826',
  },
  'english-inch': {
    symbol: 'inch',
    singular: 'Inch',
    plural: 'Inches',
    multiplier: new BigDecimal('.083333333333333333').times(englishFootInMetres), // 1/12 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-stick': {
    symbol: 'stick',
    singular: 'Stick',
    plural: 'Sticks',
    multiplier: new BigDecimal('.166666666666666666').times(englishFootInMetres), // 1/6 of an foot
    system: 'English Units - Pre 1826',
  },
  'english-hand': {
    symbol: 'hand',
    singular: 'Hand',
    plural: 'Hands',
    multiplier: new BigDecimal('0.333333333333333333').times(englishFootInMetres), // 1/3 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-digit': {
    symbol: 'digit',
    singular: 'Digit',
    plural: 'Digits',
    multiplier: new BigDecimal('.0625').times(englishFootInMetres), // 1/16 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-palm': {
    symbol: 'palm',
    singular: 'Palm',
    plural: 'Palms',
    multiplier: new BigDecimal('.25').times(englishFootInMetres), // 1/4 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-nail': {
    symbol: 'nail',
    singular: 'Nail',
    plural: 'Nails',
    multiplier: new BigDecimal('.1875').times(englishFootInMetres), // 3/16 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-shaftment': {
    symbol: 'shaftment',
    singular: 'Shaftment',
    plural: 'Shaftments',
    multiplier: new BigDecimal('.5').times(englishFootInMetres), // 1/2 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-span': {
    symbol: 'span',
    singular: 'Span',
    plural: 'Spans',
    multiplier: new BigDecimal('.75').times(englishFootInMetres), // 3/4 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-link': {
    symbol: 'link',
    singular: 'Link',
    plural: 'Links',
    multiplier: new BigDecimal('.201168').times(englishFootInMetres), // 33/50 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-foot': {
    symbol: 'foot',
    singular: 'Foot',
    plural: 'Feet',
    multiplier: englishFootInMetres, // To metres
    system: 'English Units - Pre 1826',
  },
  'english-cubit': {
    symbol: 'cubit',
    singular: 'Cubit',
    plural: 'Cubits',
    multiplier: new BigDecimal('1.5').times(englishFootInMetres), // 3/2 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-pace': {
    symbol: 'pace',
    singular: 'Pace',
    plural: 'Paces',
    multiplier: new BigDecimal('2.5').times(englishFootInMetres), // 5/2 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-yard': {
    symbol: 'yard',
    singular: 'Yard',
    plural: 'Yards',
    multiplier: new BigDecimal('3').times(englishFootInMetres), // 3 feet
    system: 'English Units - Pre 1826',
  },
  'english-step': {
    symbol: 'step',
    singular: 'Step',
    plural: 'Steps',
    multiplier: new BigDecimal('5').times(englishFootInMetres), // 5 feet
    system: 'English Units - Pre 1826',
    synonyms: [{
      singular: 'Grade',
      plural: 'Grades'
    }]
  },
  'english-ell': {
    symbol: 'ell',
    singular: 'Ell',
    plural: 'Ells',
    multiplier: new BigDecimal('3.75').times(englishFootInMetres), // 15/4 of a foot
    system: 'English Units - Pre 1826',
  },
  'english-skein': {
    symbol: 'skein',
    singular: 'Skein',
    plural: 'Skeins',
    multiplier: new BigDecimal('360').times(englishFootInMetres), // 360 feet
    system: 'English Units - Pre 1826',
  },
  'english-spindle': {
    symbol: 'spindle',
    singular: 'Spindle',
    plural: 'Spindles',
    multiplier: new BigDecimal('450').times(englishFootInMetres), // 450 feet
    system: 'English Units - Pre 1826',
  },
  'english-rope': {
    symbol: 'rope',
    singular: 'Rope',
    plural: 'Ropes',
    multiplier: new BigDecimal('20').times(englishFootInMetres), // 20 feet
    system: 'English Units - Pre 1826',
  },
  'english-ramsden_chain': {
    symbol: 'ramsden_chain',
    singular: 'Ramsden\'s chain',
    plural: 'Ramsden\'s chains',
    multiplier: new BigDecimal('100').times(englishFootInMetres), // 100 feet (5 ropes)
    system: 'English Units - Pre 1826',
  },
  'english-roman_mile': {
    symbol: 'roman_mile',
    singular: 'Roman mile',
    plural: 'Roman miles',
    multiplier: new BigDecimal('5000').times(englishFootInMetres), // 5000 feet (50 Ramsden's chains)
    system: 'English Units - Pre 1826',
  },
  'english-rod': {
    symbol: 'rod',
    singular: 'Rod',
    plural: 'Rods',
    multiplier: new BigDecimal('16.5').times(englishFootInMetres), // 33/2 feet (11 cubits)
    system: 'English Units - Pre 1826',
    synonyms: [{
      singular: 'Pole',
      plural: 'Poles'
    }, {
      singular: 'Perch',
      plural: 'Perches'
    }]
  },
  'english-furlong': {
    symbol: 'furlong',
    singular: 'Furlong',
    plural: 'Furlongs',
    multiplier: new BigDecimal('660').times(englishFootInMetres), // 660 feet (10 Gunter's chains)
    system: 'English Units - Pre 1826',
  },
  'english-mile': {
    symbol: 'mile',
    singular: 'Mile',
    plural: 'Miles',
    multiplier: new BigDecimal('5280').times(englishFootInMetres), // 5280 feet (1760 yards)
    system: 'English Units - Pre 1826',
  },
  'english-fathom': {
    symbol: 'fathom',
    singular: 'Fathom',
    plural: 'Fathoms',
    multiplier: new BigDecimal('6').times(englishFootInMetres), // 6 feet (2 yards)
    system: 'English Units - Pre 1826',
  },
  'english-shackle': {
    symbol: 'shackle',
    singular: 'Shackle',
    plural: 'Shackles',
    multiplier: new BigDecimal('90').times(englishFootInMetres), // 90 feet (15 fathoms)
    system: 'English Units - Pre 1826',
  },
  'english-cable': {
    symbol: 'cable',
    singular: 'Cable',
    plural: 'Cables',
    multiplier: new BigDecimal('600').times(englishFootInMetres), // 600 feet (100 fathoms)
    system: 'English Units - Pre 1826',
  },
  'english-nautical_mile': {
    symbol: 'nautical_mile',
    singular: 'Nautical mile',
    plural: 'Nautical miles',
    multiplier: new BigDecimal('6000').times(englishFootInMetres), // 6000 feet (10 cables)
    system: 'English Units - Pre 1826',
  },
  'english-league': {
    symbol: 'league',
    singular: 'League',
    plural: 'Leagues',
    multiplier: new BigDecimal('9000').times(englishFootInMetres), // 9000 feet (3 Nautical Miles)
    system: 'English Units - Pre 1826',
  },

  // Imperial - Gunter\'s Survey Units
  'gunter-chain': {
    symbol: 'chain',
    singular: 'Chain',
    plural: 'Chains',
    multiplier: new BigDecimal('66').times(englishFootInMetres), // 66 feet (4 rods)
    system: 'Gunter\'s Survey Units',
  },
  'gunter-link': {
    symbol: 'link',
    singular: 'Link',
    plural: 'Links',
    multiplier: new BigDecimal('0.201168'), // To metres
    system: 'Gunter\'s Survey Units',
  },
  'gunter-rod': {
    symbol: 'rod',
    singular: 'Rods',
    plural: 'Rods',
    multiplier: new BigDecimal('5.0292'),
    system: 'Gunter\'s Survey Units',
  },

  // Myanmar/Burmese Units
  'burmese-sanchi': {
    symbol: 'ဆံချည်',
    singular: 'Sanchi',
    plural: 'Sanchi',
    multiplier: new BigDecimal('.000079375'), // To metres (79.375 um)
    system: 'Myanmar/Burmese Units',
  },
  'burmese-hnan': {
    symbol: 'နှမ်း',
    singular: 'Hnan',
    plural: 'Hnan',
    multiplier: new BigDecimal('.00079375'), // To metres (793.75 um)
    system: 'Myanmar/Burmese Units',
  },
  'burmese-muyaw': {
    symbol: '',
    singular: 'Muyaw',
    plural: 'Muyaw',
    multiplier: new BigDecimal('.0047625'), // To metres (4.7625mm)
    system: 'Myanmar/Burmese Units',
  },
  'burmese-let-thit': {
    symbol: '',
    singular: 'Let thit',
    plural: 'Let thit',
    multiplier: new BigDecimal('.01905'), // To metres (19.05mm)
    system: 'Myanmar/Burmese Units',
  },
  'burmese-maik': {
    symbol: '',
    singular: 'Maik',
    plural: 'Maik',
    multiplier: new BigDecimal('.1524'), // To metres (152.4mm, also one Imperial shaftment)
    system: 'Myanmar/Burmese Units',
  },
  'burmese-htwa': {
    symbol: '',
    singular: 'Htwa',
    plural: 'Htwa',
    multiplier: new BigDecimal('.2286'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-taung': {
    symbol: '',
    singular: 'Taung',
    plural: 'Taung',
    multiplier: new BigDecimal('.4572'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-lan': {
    symbol: '',
    singular: 'Lan',
    plural: 'Lan',
    multiplier: new BigDecimal('1.8288'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-ta': {
    symbol: '',
    singular: 'Ta',
    plural: 'Ta',
    multiplier: new BigDecimal('3.2004'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-out-thaba': {
    symbol: '',
    singular: 'Out-thaba',
    plural: 'Out-thaba',
    multiplier: new BigDecimal('64.008'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-kawtha': {
    symbol: '',
    singular: 'Kawtha',
    plural: 'Kawtha',
    multiplier: new BigDecimal('1280.16'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-ga-wout': {
    symbol: '',
    singular: 'Ga-wout',
    plural: 'Ga-wout',
    multiplier: new BigDecimal('5120.64'), // To metres
    system: 'Myanmar/Burmese Units',
  },
  'burmese-yuzana': {
    symbol: '',
    singular: 'Yuzana',
    plural: 'Yuzana',
    multiplier: new BigDecimal('20482.56'), // To metres
    system: 'Myanmar/Burmese Units',
  },
} satisfies { [k: string]: Unit };

export const grouped = groupUnits(measure);

export const reference = 'metric-metre';
