import { Decimal } from '../decimal-config';
import { System } from '../types/System';
import '../decimal-config';

export const englishUnits: System = {
  name: 'English Units - Pre 1826',
  description: 'All conversions to the metre are through the late 13th century foot',
  measures: {
    length: new Map(Object.entries({
      // 'twip': {
      //   singular: 'Twip',
      //   plural: 'Twips',
      //   multiplier: new Decimal(1).dividedBy(17280)
      //   // multiplier: .000694444444444444 * englishInchInMetres // 1/20 of a point, 1/200 of a pica, 1/1440 of an inch
      // },
      // 'point': {
      //   singular: 'Point',
      //   plural: 'Points',
      //   multiplier: new Decimal(1).dividedBy(864)
      //   // multiplier: .013888888888888888 * englishInchInMetres // 1/12 of a pica, 1/72 of an inch
      // },
      // 'pica': {
      //   singular: 'Pica',
      //   plural: 'Picas',
      //   multiplier: new Decimal(1).dividedBy(72)
      //   // multiplier: .166666666666666666 * englishInchInMetres // 1/6 of an inch
      // },

      // 'stick': {
      //   singular: 'Stick',
      //   plural: 'Sticks',
      //   multiplier: new Decimal(1).dividedBy(6)
      //   // multiplier: .166666666666666666 * englishFootInMetres // 1/6 of an foot
      // },
      'line': {
        singular: 'Line',
        plural: 'Lines',
        multiplier: new Decimal(1).dividedBy(144), // 1/4 of a barleycorn
        synonyms: [{
          singular: 'Poppyseed',
          plural: 'Poppyseeds'
        }]
      },
      'barleycorn': {
        singular: 'Barleycorn',
        plural: 'Barleycorns',
        multiplier: new Decimal(1).dividedBy(36) // 1/3 of an inch
      },
      'digit': {
        singular: 'Digit',
        plural: 'Digits',
        multiplier: new Decimal(1).dividedBy(16) // 1/16 of a foot (3/4 of an inch)
      },
      'finger': {
        singular: 'Finger',
        plural: 'Fingers',
        multiplier: new Decimal(7).dividedBy(96) // 7/8 of an inch
      },
      'inch': {
        singular: 'Inch',
        plural: 'Inches',
        multiplier: new Decimal(1).dividedBy(12) // 1/12 of a foot (3 barleycorns)
      },
      'nail': {
        singular: 'Nail',
        plural: 'Nails',
        multiplier: new Decimal(3).dividedBy(16) // 3/16 of a foot (2-1/4 inches)
      },
      'palm': {
        singular: 'Palm',
        plural: 'Palms',
        multiplier: new Decimal(1).dividedBy(4) // 1/4 of a foot (3 inches)
      },
      'hand': {
        singular: 'Hand',
        plural: 'Hands',
        multiplier: new Decimal(1).dividedBy(3) // 1/3 of a foot (4 inches)
      },
      'shaftment': {
        singular: 'Shaftment',
        plural: 'Shaftments',
        // TODO 6.5 inches before 12th century
        multiplier: new Decimal(1).dividedBy(2) // 1/2 of a foot (6 inches)
      },
      'link': {
        singular: 'Link',
        plural: 'Links',
        multiplier: new Decimal('0.6601049869') // 7.92 inches or approximately 33/50 of a foot
      },
      'span': {
        singular: 'Span',
        plural: 'Spans',
        multiplier: new Decimal(3).dividedBy(4) // 3/4 of a foot
      },
      'foot': {
        singular: 'Foot',
        plural: 'Feet',
        base: true,
        multiplier: new Decimal('.3048') // To metres
      },
      // 'cubit': {
      //     singular: 'Cubit',
      //     plural: 'Cubits',
      //     multiplier: 1.5 * englishFootInMetres // 3/2 of a foot
      // },
      // 'pace': {
      //     singular: 'Pace',
      //     plural: 'Paces',
      //     multiplier: 2.5 * englishFootInMetres // 5/2 of a foot
      // },
      // 'yard': {
      //     singular: 'Yard',
      //     plural: 'Yards',
      //     multiplier: 3* englishFootInMetres // 3 feet
      // },
      // 'step': {
      //     singular: 'Step',
      //     plural: 'Steps',
      //     multiplier: 5 * englishFootInMetres, // 5 feet
      //     synonyms: [{
      //         singular: 'Grade',
      //         plural: 'Grades'
      //     }]
      // },
      // 'ell': {
      //     singular: 'Ell',
      //     plural: 'Ells',
      //     multiplier: 3.75 * englishFootInMetres // 15/4 of a foot
      // },
      // 'skein': {
      //     singular: 'Skein',
      //     plural: 'Skeins',
      //     multiplier: 360 * englishFootInMetres // 360 feet
      // },
      // 'spindle': {
      //     singular: 'Spindle',
      //     plural: 'Spindles',
      //     multiplier: 450 * englishFootInMetres // 450 feet
      // },
      // 'rope': {
      //     singular: 'Rope',
      //     plural: 'Ropes',
      //     multiplier: 20 * englishFootInMetres // 20 feet
      // },
      // 'ramsden_chain': {
      //     singular: 'Ramsden\'s chain',
      //     plural: 'Ramsden\'s chains',
      //     multiplier: 100 * englishFootInMetres // 100 feet (5 ropes)
      // },
      // 'roman_mile': {
      //     singular: 'Roman mile',
      //     plural: 'Roman miles',
      //     multiplier:  5000 * englishFootInMetres // 5000 feet (50 Ramsden's chains)
      // },
      // 'rod': {
      //     singular: 'Rod',
      //     plural: 'Rods',
      //     multiplier: 16.5 * englishFootInMetres, // 33/2 feet (11 cubits)
      //     synonyms: [{
      //         singular: 'Pole',
      //         plural: 'Poles'
      //     }, {
      //         singular: 'Perch',
      //         plural: 'Perches'
      //     }]
      // },
      // 'furlong': {
      //     singular: 'Furlong',
      //     plural: 'Furlongs',
      //     multiplier: 660 * englishFootInMetres // 660 feet (10 Gunter's chains)
      // },
      // 'mile': {
      //     singular: 'Mile',
      //     plural: 'Miles',
      //     multiplier: 5280 * englishFootInMetres // 5280 feet (1760 yards)
      // },
      // 'fathom': {
      //     singular: 'Fathom',
      //     plural: 'Fathoms',
      //     multiplier: 6 * englishFootInMetres // 6 feet (2 yards)
      // },
      // 'shackle': {
      //     singular: 'Shackle',
      //     plural: 'Shackles',
      //     multiplier: 90 * englishFootInMetres // 90 feet (15 fathoms)
      // },
      // 'cable': {
      //     singular: 'Cable',
      //     plural: 'Cables',
      //     multiplier: 600 * englishFootInMetres // 600 feet (100 fathoms)
      // },
      // 'nautical_mile': {
      //     singular: 'Nautical mile',
      //     plural: 'Nautical miles',
      //     multiplier: 6000 * englishFootInMetres // 6000 feet (10 cables)
      // },
      // 'league': {
      //     singular: 'League',
      //     plural: 'Leagues',
      //     multiplier: 9000 * englishFootInMetres // 9000 feet (3 Nautical Miles)
      // },
    }))
  }
}
