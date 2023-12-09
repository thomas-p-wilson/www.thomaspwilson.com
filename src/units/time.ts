import { decimal } from '@/utils/decimal';
import { groupUnits } from '@/utils/groupUnits';
import { Unit } from './Unit';

const daysInYear = decimal('365.25');

export const measure = {
  'metric-nanosecond': {
      symbol: 'ns',
      singular: 'Nanosecond',
      plural: 'Nanoseconds',
      system: 'Metric',
      multiplier: decimal(10).pow(-9),
  },
  'metric-microsecond': {
      symbol: 'ns',
      singular: 'Microsecond',
      plural: 'Microseconds',
      system: 'Metric',
      multiplier: decimal(10).pow(-6),
  },
  'metric-millisecond': {
      symbol: 'ms',
      singular: 'Millisecond',
      plural: 'Milliseconds',
      system: 'Metric',
      multiplier: decimal(10).pow(-3),
  },
  'metric-second': {
      symbol: 's',
      singular: 'Second',
      plural: 'Seconds',
      system: 'Metric',
      multiplier: decimal(1),
  },
  minute: {
      symbol: 'min',
      singular: 'Minute',
      plural: 'Minutes',
      system: 'Other',
      multiplier: decimal(60),
  },
  hour: {
      symbol: 'h',
      singular: 'Hour',
      plural: 'Hours',
      system: 'Other',
      multiplier: decimal(60).times(60),
  },
  day: {
      symbol: 'd',
      singular: 'Day',
      plural: 'Days',
      system: 'Other',
      multiplier: decimal(60).times(60).times(24),
  },
  year: {
      symbol: 'y',
      singular: 'Year',
      plural: 'Years',
      system: 'Other',
      multiplier: decimal(60).times(60).times(24).times(daysInYear),
  }
} satisfies { [k: string]: Unit };

export const grouped = groupUnits(measure);

export const reference = 'metric-second';
