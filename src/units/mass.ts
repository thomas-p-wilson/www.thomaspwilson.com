import { groupUnits } from '@/utils/groupUnits';
import { Unit } from './Unit';
import { decimal } from '@/utils/decimal';

export const measure = {
  'metric-femtogram': {
    symbol: 'fg',
    singular: 'Femtogram',
    plural: 'Femtograms',
    system: 'Metric',
    multiplier: decimal(10).pow(-15),
  },
  'metric-picogram': {
    symbol: 'pg',
    singular: 'Picogram',
    plural: 'Picograms',
    system: 'Metric',
    multiplier: decimal(10).pow(-12),
  },
  'metric-nanogram': {
    symbol: 'ng',
    singular: 'Nanogram',
    plural: 'Nanograms',
    system: 'Metric',
    multiplier: decimal(10).pow(-9),
  },
  'metric-microgram': {
    symbol: 'ug',
    singular: 'Microgram',
    plural: 'Micrograms',
    system: 'Metric',
    multiplier: decimal(10).pow(-6),
  },
  'metric-milligram': {
    symbol: 'mg',
    singular: 'Milligram',
    plural: 'Milligrams',
    system: 'Metric',
    multiplier: decimal(10).pow(-3),
  },
  'metric-gram': {
    symbol: 'g',
    singular: 'Gram',
    plural: 'Grams',
    system: 'Metric',
    multiplier: decimal(1),
  },
  'metric-kilogram': {
    symbol: 'kg',
    singular: 'Kilogram',
    plural: 'Kilograms',
    system: 'Metric',
    multiplier: decimal(10).pow(3),
  },

  // Tower Weights - Pre 1527
  // The "Wheat Grain" was the fundamental unit of the pre-1527 English weight system known as Tower weights. It was defined as exactly 45/64ths of a Troy grain, and is one of very few distinct measurements of the grain.
  'tower-wheat-grain': {
    // The "Wheat Grain" was the fundamental unit of the pre-1527 English weight system known as Tower weights. Defined as exactly 45/64 of a troy grain.
    singular: 'Wheat Grain',
    plural: 'Wheat Grains',
    system: 'Tower Weights - Pre 1527',
    multiplier: decimal('0.455617335938'), // To grams
  },
  'tower-pound': {
    // 5400 grains
    singular: 'Pound',
    plural: 'Pounds',
    system: 'Tower Weights - Pre 1527',
    multiplier: decimal('349.914114'),
  },

  // Troy Weights - c. 1414
  // The earliest reference to the modern troy weights is in 1414. The troy grain is the same grain used in the more common Avoirdupois system. Many aspects of the troy system of measure were derived from the Roman monetary system.
  'troy-grain': {
    singular: 'Grain',
    plural: 'Grains',
    system: 'Troy Weights - c. 1414',
    multiplier: decimal('0.06479891'), // To grams
  },
  'troy-pennyweight': {
    // 24 grains in 1 dwt
    singular: 'Pennyweight',
    plural: 'Pennyweights',
    symbol: 'dwt',
    system: 'Troy Weights - c. 1414',
    multiplier: decimal('1.55517384'), // To grams
  },
  'troy-ounce': {
    // 1 troy ounce = 480 grains
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'Troy Weights - c. 1414',
    multiplier: decimal('31.1034768'), // To grams
  },
  'troy-pound': {
    // The troy pound is 5 760 grains (≈ 373.24 g, 12 oz t)
    singular: 'Pound',
    plural: 'Pounds',
    system: 'Troy Weights - c. 1414',
    multiplier: decimal('373.2417216'), // To grams
  },
  'troy-stone': {
    // 1 troy stone = 16 troy pounds
    singular: 'Stone',
    plural: 'Stones',
    system: 'Troy Weights - c. 1414',
    multiplier: decimal('5971.8675456'), // To grams
  },

  // Early Avoirdupois - c. 1300
  'early-avoirdupois-part': {
    // 1/16 of an ounce
    singular: 'Part',
    plural: 'Parts',
    system: 'Avoirdupois - c. 1300',
    multiplier: decimal('1.76982022938'), // To grams
  },
  'early-avoirdupois-ounce': {
    // 1/16 of a pound
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'Avoirdupois - c. 1300',
    multiplier: decimal('28.31712367'), // To grams
  },
  'early-avoirdupois-pound': {
    // Also known as the "wool pound"
    singular: 'Pound',
    plural: 'Pounds',
    system: 'Avoirdupois - c. 1300',
    multiplier: decimal('453.07397872'), // To grams
  },
  'early-avoirdupois-stone': {
    // 14 pounds
    singular: 'Stone',
    plural: 'Stone',
    system: 'Avoirdupois - c. 1300',
    multiplier: decimal('5889.96172336'), // To grams
  },
  'early-avoirdupois-woolsack': {
    // 26 stone
    singular: 'Woolsack',
    plural: 'Woolsacks',
    system: 'Avoirdupois - c. 1300',
    multiplier: decimal('153139.004807'), // To grams
  },

  // Late Avoirdupois - Post-Elizabethan (1588)
  'late-avoirdupois-drachm': {
    // 1/16 of an ounce
    singular: 'Drachm',
    plural: 'Drachms',
    symbol: 'dr',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('1.77184519531'), // To grams, through ounce
  },
  'late-avoirdupois-ounce': {
    // 1/16 of a pound
    singular: 'Ounce',
    plural: 'Ounces',
    symbol: 'oz',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('28.349523125'), // To grams, through pound
  },
  'late-avoirdupois-pound': {
    // 7000 grains
    singular: 'Pound',
    plural: 'Pounds',
    symbol: 'lb',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('453.59237'), // To grams
  },
  'late-avoirdupois-stone': {
    // 14 pounds
    singular: 'Stone',
    plural: 'Stone',
    symbol: 'st',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('6350.29318'), // To grams, through pound
  },
  'late-avoirdupois-quarter': {
    // 2 stone
    singular: 'Quarter',
    plural: 'Quarters',
    symbol: 'qr',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('12700.58636'), // To grams, through stone
  },
  'late-avoirdupois-hundredweight': {
    // 4 quarters
    singular: 'Hundredweight',
    plural: 'Hundredweights',
    symbol: 'cwt',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('50802.34544'), // To grams, through quarter
  },
  'late-avoirdupois-ton': {
    // 20 hundredweights
    singular: 'Long Ton',
    plural: 'Long Tons',
    symbol: 't',
    system: 'Avoirdupois - post-1588',
    multiplier: decimal('1016046.9088'), // To grams, through hundredweight
  },

  // U.S. Customary Units
  // Derived from post-Elizabethan Avoirdupois system
  'us-customary-dram': {
    // 1/16 of an ounce
    singular: 'Dram',
    plural: 'Drams',
    symbol: 'dr',
    system: 'U.S. Customary Units',
    multiplier: decimal('1.77184519531') // To grams, through ounce
  },
  'us-customary-ounce': {
    // 1/16 of a pound
    singular: 'Ounce',
    plural: 'Ounces',
    symbol: 'oz',
    system: 'U.S. Customary Units',
    multiplier: decimal('28.349523125') // To grams, through pound
  },
  'us-customary-pound': {
    // 7000 grains
    singular: 'Pound',
    plural: 'Pounds',
    symbol: 'lb',
    system: 'U.S. Customary Units',
    multiplier: decimal('453.59237') // To grams
  },
  'us-customary-quarter': {
    // 25 pounds
    singular: 'Quarter',
    plural: 'Quarters',
    symbol: 'qr',
    system: 'U.S. Customary Units',
    multiplier: decimal('11339.80925') // To grams, through pound
  },
  'us-customary-hundredweight': {
    // 4 quarters
    singular: 'Hundredweight',
    plural: 'Hundredweights',
    symbol: 'cwt',
    system: 'U.S. Customary Units',
    multiplier: decimal('45359.237') // To grams, through quarter
  },
  'us-customary-ton': {
    // 20 hundredweights
    singular: 'Short Ton',
    plural: 'Short Tons',
    symbol: 't',
    system: 'U.S. Customary Units',
    multiplier: decimal('907184.74') // to grams, through hundredweight
  },

  // Hanseatic League
  'hanseatic-pound': {
    // 7200 grains
    singular: 'Pound',
    plural: 'Pounds',
    system: 'Hanseatic League',
    multiplier: decimal('466.552152') // To grams,
  },
  'hanseatic-ounce': {
    // 1/16 of a pound
    singular: 'Ounce',
    plural: 'Ounce',
    system: 'Hanseatic League',
    multiplier: decimal('29.1595095') // To grams,
  },

  // Apothecaries\s System - Pre-Imperial (pre-1864)
  // Officially implemented in Britain in 1826, officially abolished in 1858, used until 1971 in the United States.
  'early-apothecary-pound': {
    // 5,760 grains, 373 grams, identical to the troy pound
    singular: 'Pound',
    plural: 'Pounds',
    system: 'British Apothecaries\' weights and conversions pre-1864',
    multiplier: decimal('373.2417216') // To grams
  },
  'early-apothecary-ounce': {
    // 1/12 of a pound
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'British Apothecaries\' weights and conversions pre-1864',
    multiplier: decimal('31.1034768') // To grams
  },
  'early-apothecary-dram': {
    // 1/8 of an ounce
    singular: 'Drachm',
    plural: 'Drachms',
    system: 'British Apothecaries\' weights and conversions pre-1864',
    multiplier: decimal('3.8879346') // To grams
  },
  'early-apothecary-scruple': {
    // 1/3 of a drachm
    singular: 'Scruple',
    plural: 'Scruples',
    system: 'British Apothecaries\' weights and conversions pre-1864',
    multiplier: decimal('1.2959782') // To grams
  },

  // Apothecaries\' System - Post-Imperial (1864-1971)
  // Used until 1971 in the United States
  'late-apothecary-pound': {
    // 7000 grains
    singular: 'Pound',
    plural: 'Pounds',
    system: 'British Apothecaries\' weights and conversions 1864-1971',
    multiplier: decimal('453.59237') // To grams
  },
  'late-apothecary-ounce': {
    // 1/16 of a pound
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'British Apothecaries\' weights and conversions 1864-1971',
    multiplier: decimal('28.349523125') // To grams
  },

  // Mint Weights
  // Of the Troy system, legalised by Act of Parliament dated 17 July 1649, An Act touching the monies and coins of England
  'mint-mite': {
    // 1/20 of a grain
    singular: 'Mite',
    plural: 'Mites',
    system: 'Mint Weights - c. 1649',
    multiplier: decimal('.0032399455') // To grams
  },
  'mint-droit': {
    // 1/24 of a mite
    singular: 'Droit',
    plural: 'Droits',
    system: 'Mint Weights - c. 1649',
    multiplier: decimal('.000134997729167') // To grams
  },
  'mint-perit': {
    // 1/20 of a droit
    singular: 'Perit',
    plural: 'Perits',
    system: 'Mint Weights - c. 1649',
    multiplier: decimal('.0000067498864583') // To grams
  },
  'mint-blank': {
    // 1/24 of a perit
    singular: 'Blank',
    plural: 'Blanks',
    system: 'Mint Weights - c. 1649',
    multiplier: decimal('.0000002812452691') // To grams
  },

  // Incorporation of Goldsmiths of the City of Edinburgh
  'scottish-drops': {
    // 1/16 troy ounce
    singular: 'Drop',
    plural: 'Drops',
    system: 'Scottish - c. 1681',
    multiplier: decimal('1.9439673') // To grams
  },
  'scottish-ounce': {
    // 1/16 troy pound
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'Scottish - c. 1681',
    multiplier: decimal('23.3276076') // To grams
  },
  'scottish-pound': {
    // 1/16 troy stone, a troy stone is 16 troy pounds...so this is a troy pound?
    singular: 'Pound',
    plural: 'Pounds',
    system: 'Scottish - c. 1681',
    multiplier: decimal('373.2417216') // To grams
  },

  // Dutch
  'dutch-mark': {
    // 8 ounces, 3798 grains, 246.084 grams
    singular: 'Mark',
    plural: 'Marks',
    system: 'Dutch',
    multiplier: decimal('246.10626018') // To grams, through troy grains. Why is this off?
  },
  'dutch-ounce': {
    // 20 Engels
    singular: 'Ounce',
    plural: 'Ounces',
    system: 'Dutch',
    multiplier: decimal('30.7632825225') // To grams, through Dutch mark
  },
  'dutch-engel': {
    // 32 As
    singular: 'Engel',
    plural: 'Engels',
    system: 'Dutch',
    multiplier: decimal('1.53816412613') // To grams, through Dutch ounce
  },
  'dutch-a': {
    singular: 'A',
    plural: 'As',
    system: 'Dutch',
    multiplier: decimal('.0480676289414') // To grams, through Dutch engel
  },

  // Other
  'bremen-troy-ounce': {
    // Bremen troy ounce had a mass of 480.8 British Imperial grains.
    singular: 'Bremen Troy Ounce',
    plural: 'Bremen Troy Ounces',
    system: 'Other',
    multiplier: decimal('31.155315928') // To grams
  },
  'gold-dirhem': {
    // Gold Dirhem (47.966 British Imperial grains)
    singular: 'Gold Dirhem',
    plural: 'Gold Dirhems',
    system: 'Other',
    multiplier: decimal('3.10814451706') // To grams
  },
  'silver-dirhem': {
    // silver Dirhem (about 45.0 British grains)
    singular: 'Silver Dirhem',
    plural: 'Silver Dirhem',
    system: 'Other',
    multiplier: decimal('2.91595095')
  }
} satisfies { [k: string]: Unit };

export const grouped = groupUnits(measure);

export const reference = 'metric-gram';
