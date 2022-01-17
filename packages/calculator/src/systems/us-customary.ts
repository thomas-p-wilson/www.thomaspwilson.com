
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
