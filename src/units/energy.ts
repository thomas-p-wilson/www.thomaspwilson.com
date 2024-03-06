import { groupUnits } from '@/utils/groupUnits';
import { Unit } from './Unit';
import { decimal } from '@/utils/decimal';

export const measure = {
  // Metric
  'metric-watt': {
    symbol: 'W',
    singular: 'Watt',
    plural: 'Watts',
    multiplier: decimal(1),
    system: 'Metric',
  },
  'metric-kilowatt': {
    symbol: 'kW',
    singular: 'Kilowatt',
    plural: 'Kilowatt',
    multiplier: decimal(10).pow(3),
    system: 'Metric',
  },
  'metric-megawatt': {
    symbol: 'MW',
    singular: 'Megawatt',
    plural: 'Megawatts',
    multiplier: decimal(10).pow(6),
    system: 'Metric',
  },
  'metric-gigawatt': {
    symbol: 'GW',
    singular: 'Gigawatt',
    plural: 'Gigawatts',
    multiplier: decimal(10).pow(6),
    system: 'Metric',
  },
  'metric-gigajoule': {
    symbol: 'GJ',
    singular: 'Gigajoule',
    plural: 'Gigajoules',
    multiplier: decimal(1).div('0.0000036'),
    system: 'Metric',
  },
  'metric-megajoule': {
    symbol: 'MJ',
    singular: 'Megajoule',
    plural: 'Megajoules',
    multiplier: decimal(1).div('0.0036'),
    system: 'Metric',
  },
  'metric-kilojoule': {
    symbol: 'kJ',
    singular: 'Kilojoule',
    plural: 'Kilojoules',
    multiplier: decimal(1).div('3.6'),
    system: 'Metric',
  },
  'metric-joule': {
    symbol: 'J',
    singular: 'Joule',
    plural: 'Joules',
    multiplier: decimal(1),
    system: 'Metric',
  },
} satisfies { [k: string]: Unit };

export const grouped = groupUnits(measure);

export const reference = 'metric-joule';
