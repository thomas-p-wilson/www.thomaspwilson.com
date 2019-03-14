import { generateScale } from './utils';

/*
 *
 */
export const metric = {
    name: 'Metric System',
    description: '',
    units: generateScale('g', 'Gram', 'Grams', ['k', 'm', 'u', 'n', 'p', 'f'])
}

export const towerWeights = {
    name: 'Tower Weights - Pre 1527',
    description: 'The "Wheat Grain" was the fundamental unit of the pre-1527 English weight system known as Tower weights. It was defined as exactly 45/64ths of a Troy grain, and is one of very few distinct measurements of the grain.',
    units: {
        wheatGrain: {
            // The "Wheat Grain" was the fundamental unit of the pre-1527 English weight system known as Tower weights. Defined as exactly 45/64 of a troy grain.
            singular: 'Wheat Grain',
            plural: 'Wheat Grains',
            multiplier: 0.455617335938 // To grams
        },
        pound: {
            // 5400 grains
            singular: 'Pound',
            plural: 'Pounds',
            multiplier: 349.914114
        }
    }
}

export const troyWeights = {
    name: 'Troy Weights - c. 1414',
    description: 'The earliest reference to the modern troy weights is in 1414. The troy grain is the same grain used in the more common Avoirdupois system. Many aspects of the troy system of measure were derived from the Roman monetary system.',
    units: {
        grain: {
            singular: 'Grain',
            plural: 'Grains',
            multiplier: 0.06479891 // To grams
        },
        pennyweight: {
            // 24 grains in 1 dwt
            singular: 'Pennyweight',
            plural: 'Pennyweights',
            symbol: 'dwt',
            multiplier: 1.55517384 // To grams
        },
        ounce: {
            // 1 troy ounce = 480 grains
            singular: 'Ounce',
            plural: 'Ounces',
            multiplier: 31.1034768 // To grams
        },
        pound: {
            // The troy pound is 5 760 grains (≈ 373.24 g, 12 oz t)
            singular: 'Pound',
            plural: 'Pounds',
            multiplier: 373.2417216 // To grams
        },
        stone: {
            // 1 troy stone = 16 troy pounds
            singular: 'Stone',
            plural: 'Stones',
            multiplier: 5971.8675456
        }
    }
}

export const earlyAvoirdupois = {
    name: 'Early Avoirdupois - c. 1300',
    description: '',
    units: {
        'part-avoir-early': {
            // 1/16 of an ounce
            singular: 'Part',
            plural: 'Parts',
            system: 'Avoirdupois - c. 1300',
            multiplier: 1.76982022938
        },
        'ounce-avoir-early': {
            // 1/16 of a pound
            singular: 'Ounce',
            plural: 'Ounces',
            system: 'Avoirdupois - c. 1300',
            multiplier: 28.31712367
        },
        'pound-avoir-early': {
            // Also known as the "wool pound"
            singular: 'Pound',
            plural: 'Pounds',
            system: 'Avoirdupois - c. 1300',
            multiplier: 453.07397872 // To grams
        },
        'stone-avoir-early': {
            // 14 pounds
            singular: 'Stone',
            plural: 'Stone',
            system: 'Avoirdupois - c. 1300',
            multiplier: 5889.96172336
        },
        'woolsack-avoir-early': {
            // 26 stone
            singular: 'Woolsack',
            plural: 'Woolsacks',
            system: 'Avoirdupois - c. 1300',
            multiplier: 153139.004807
        },
    }
}

export const lateAvoirdupois = {
    name: 'Late Avoirdupois - Post-Elizabethan (1588)',
    description: '',
    units: {
        'drachm-avoir': {
            // 1/16 of an ounce
            singular: 'Drachm',
            plural: 'Drachms',
            symbol: 'dr',
            system: 'Avoirdupois - post-1588',
            multiplier: 1.77184519531 // To grams, through ounce
        },
        'ounce-avoir': {
            // 1/16 of a pound
            singular: 'Ounce',
            plural: 'Ounces',
            symbol: 'oz',
            system: 'Avoirdupois - post-1588',
            multiplier: 28.349523125 // To grams, through pound
        },
        'pound-avoir': {
            // 7000 grains
            singular: 'Pound',
            plural: 'Pounds',
            symbol: 'lb',
            system: 'Avoirdupois - post-1588',
            multiplier: 453.59237 // To grams
        },
        'stone-avoir': {
            // 14 pounds
            singular: 'Stone',
            plural: 'Stone',
            symbol: 'st',
            system: 'Avoirdupois - post-1588',
            multiplier: 6350.29318 // To grams, through pound
        },
        'quarter-avoir': {
            // 2 stone
            singular: 'Quarter',
            plural: 'Quarters',
            symbol: 'qr',
            system: 'Avoirdupois - post-1588',
            multiplier: 12700.58636 // To grams, through stone
        },
        'hundredweight-avoir': {
            // 4 quarters
            singular: 'Hundredweight',
            plural: 'Hundredweights',
            symbol: 'cwt',
            system: 'Avoirdupois - post-1588',
            multiplier: 50802.34544 // To grams, through quarter
        },
        'ton-avoir': {
            // 20 hundredweights
            singular: 'Long Ton',
            plural: 'Long Tons',
            symbol: 't',
            system: 'Avoirdupois - post-1588',
            multiplier: 1016046.9088 // To grams, through hundredweight
        },
    }
}

export const usCustomaryUnits = {
    name: 'U.S. Customary Units',
    description: 'Derived from post-Elizabethan Avoirdupois system',
    units: {
        'dram-us': {
            // 1/16 of an ounce
            singular: 'Dram',
            plural: 'Drams',
            symbol: 'dr',
            system: 'U.S. Customary Units',
            multiplier: 1.77184519531 // To grams, through ounce
        },
        'ounce-us': {
            // 1/16 of a pound
            singular: 'Ounce',
            plural: 'Ounces',
            symbol: 'oz',
            system: 'U.S. Customary Units',
            multiplier: 28.349523125 // To grams, through pound
        },
        'pound-us': {
            // 7000 grains
            singular: 'Pound',
            plural: 'Pounds',
            symbol: 'lb',
            system: 'U.S. Customary Units',
            multiplier: 453.59237 // To grams
        },
        'quarter-us': {
            // 25 pounds
            singular: 'Quarter',
            plural: 'Quarters',
            symbol: 'qr',
            system: 'U.S. Customary Units',
            multiplier: 11339.80925 // To grams, through pound
        },
        'hundredweight-us': {
            // 4 quarters
            singular: 'Hundredweight',
            plural: 'Hundredweights',
            symbol: 'cwt',
            system: 'U.S. Customary Units',
            multiplier: 45359.237 // To grams, through quarter
        },
        'ton-us': {
            // 20 hundredweights
            singular: 'Short Ton',
            plural: 'Short Tons',
            symbol: 't',
            system: 'U.S. Customary Units',
            multiplier: 907184.74 // to grams, through hundredweight
        },
    }
}

export const hanseaticLeague = {
    name: 'Hanseatic League',
    description: '',
    units: {
        'pound-hanseatic': {
            // 7200 grains
            singular: 'Pound',
            plural: 'Pounds',
            system: 'Hanseatic League',
            multiplier: 466.552152 // To grams, 
        },
        'ounce-hanseatic': {
            // 1/16 of a pound
            singular: 'Ounce',
            plural: 'Ounce',
            system: 'Hanseatic League',
            multiplier: 29.1595095
        },
    }
}

export const preImperialApothecarySystem = {
    name: 'Apothecaries\s System - Pre-Imperial (pre-1864)',
    description: 'Officially implemented in Britain in 1826, officially abolished in 1858, used until 1971 in the United States.',
    units: {
        'pound-apothecary': {
            // 5,760 grains, 373 grams, identical to the troy pound
            singular: 'Pound',
            plural: 'Pounds',
            system: 'British Apothecaries\' weights and conversions pre-1864',
            multiplier: 373.2417216 // To grams
        },
        'ounce-apothecary': {
            // 1/12 of a pound
            singular: 'Ounce',
            plural: 'Ounces',
            system: 'British Apothecaries\' weights and conversions pre-1864',
            multiplier: 31.1034768 // To grams
        },
        'dram-apothecary': {
            // 1/8 of an ounce
            singular: 'Drachm',
            plural: 'Drachms',
            system: 'British Apothecaries\' weights and conversions pre-1864',
            multiplier: 3.8879346 // To grams
        },
        'scruple-apothecary': {
            // 1/3 of a drachm
            singular: 'Scruple',
            plural: 'Scruples',
            system: 'British Apothecaries\' weights and conversions pre-1864',
            multiplier: 1.2959782 // To grams
        },
    }
}

export const postImperialApothecarySystem = {
    name: 'Apothecaries\' System - Post-Imperial (1864-1971)',
    description: 'Used until 1971 in the United States',
    units: {
        'pound-apothecary-post-imp': {
            // 7000 grains
            singular: 'Pound',
            plural: 'Pounds',
            system: 'British Apothecaries\' weights and conversions 1864-1971',
            multiplier: 453.59237 // To grams
        },
        'ounce-apothecary-post-imp': {
            // 1/16 of a pound
            singular: 'Ounce',
            plural: 'Ounces',
            system: 'British Apothecaries\' weights and conversions 1864-1971',
            multiplier: 28.349523125 // To grams
        },
    }
}

export const mintWeights = {
    name: 'Mint Weights',
    description: 'Of the Troy system, legalised by Act of Parliament dated 17 July 1649, An Act touching the monies and coins of England',
    units: {
        'mite-mint': {
            // 1/20 of a grain
            singular: 'Mite',
            plural: 'Mites',
            system: 'Mint Weights - c. 1649',
            multiplier: .0032399455 // To grams
        },
        'droit-mint': {
            // 1/24 of a mite
            singular: 'Droit',
            plural: 'Droits',
            system: 'Mint Weights - c. 1649',
            multiplier: .000134997729167 // To grams
        },
        'perit-mint': {
            // 1/20 of a droit
            singular: 'Perit',
            plural: 'Perits',
            system: 'Mint Weights - c. 1649',
            multiplier: .0000067498864583 // To grams
        },
        'blank-mint': {
            // 1/24 of a perit
            singular: 'Blank',
            plural: 'Blanks',
            system: 'Mint Weights - c. 1649',
            multiplier: .0000002812452691 // To grams
        },
    }
}

export const scottishWeights = {
    name: 'Incorporation of Goldsmiths of the City of Edinburgh',
    description: '',
    units: {
        'drops-scottish': {
            // 1/16 troy ounce
            singular: 'Drop',
            plural: 'Drops',
            system: 'Scottish - c. 1681',
            multiplier: 1.9439673 // To grams
        },
        'ounce-scottish': {
            // 1/16 troy pound
            singular: 'Ounce',
            plural: 'Ounces',
            system: 'Scottish - c. 1681',
            multiplier: 23.3276076 // To grams
        },
        'pound-scottish': {
            // 1/16 troy stone, a troy stone is 16 troy pounds...so this is a troy pound?
            singular: 'Pound',
            plural: 'Pounds',
            system: 'Scottish - c. 1681',
            multiplier: 373.2417216 // To grams
        },
    }
}

export const dutchSystem = {
    name: 'Dutch',
    description: '',
    units: {
        'mark-dutch': {
            // 8 ounces, 3798 grains, 246.084 grams
            singular: 'Mark',
            plural: 'Marks',
            system: 'Dutch',
            multiplier: 246.10626018 // To grams, through troy grains. Why is this off?
        },
        'ounce-dutch': {
            // 20 Engels
            singular: 'Ounce',
            plural: 'Ounces',
            system: 'Dutch',
            multiplier: 30.7632825225 // To grams, through Dutch mark
        },
        'engel-dutch': {
            // 32 As
            singular: 'Engel',
            plural: 'Engels',
            system: 'Dutch',
            multiplier: 1.53816412613 // To grams, through Dutch ounce
        },
        'a-dutch': {
            singular: 'A',
            plural: 'As',
            system: 'Dutch',
            multiplier: .0480676289414 // To grams, through Dutch engel
        },
    }
}

export const other = {
    name: 'Other',
    description: '',
    units: {
        'bremen-troy-ounce': {
            // Bremen troy ounce had a mass of 480.8 British Imperial grains.
            singular: 'Bremen Troy Ounce',
            plural: 'Bremen Troy Ounces',
            system: 'Other',
            multiplier: 31.155315928 // To grams
        },
        'gold-dirhem': {
            // Gold Dirhem (47.966 British Imperial grains)
            singular: 'Gold Dirhem',
            plural: 'Gold Dirhems',
            system: 'Other',
            multiplier: 3.10814451706 // To grams
        },
        'silver-dirhem': {
            // silver Dirhem (about 45.0 British grains)
            singular: 'Silver Dirhem',
            plural: 'Silver Dirhem',
            system: 'Other',
            multiplier: 2.91595095
        }
    }
}
