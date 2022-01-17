import { System } from '../types/System';
import { generateScale } from '../utils/scale';

export const guntersUnits: System = {
  name: 'Imperial - Gunter\'s Survey Units',
  description: '',
  measures: {
    length: {
      chain: {
        symbol: 'chain',
        singular: 'Chain',
        plural: 'Chains',
        multiplier: 66 * englishFootInMetres // 66 feet (4 rods)
      },
      link: {
        symbol: 'link',
        singular: 'Link',
        plural: 'Links',
        multiplier: 0.201168 // To metres
      },
      rod: {
        symbol: 'rod',
        singular: 'Rods',
        plural: 'Rods',
        multiplier: 5.0292
      },
    }
  }
}

export const guntersUnits = {
  name: 'Imperial - Gunter\'s Survey Units',
  description: '',
  units: {
  }
}
