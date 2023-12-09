import { Unit } from './Unit';
import { decimal } from '@/utils/decimal';

export const measure = {
  rad: {
    symbol: 'rad',
    singular: 'Radian',
    plural: 'Radians',
    system: 'Metric',
    multiplier: decimal(Math.PI).div(180),
  },
  deg: {
    symbol: 'deg',
    singular: 'Degree',
    plural: 'Degrees',
    system: 'Metric',
    multiplier: decimal(1),
  },
  grad: {
    symbol: 'grad',
    singular: 'Gradian',
    plural: 'Gradians',
    system: 'Metric',
    multiplier: decimal(200).div(180),
  },
  arcmin: {
    symbol: 'arcmin',
    singular: 'Arcminute',
    plural: 'Arcminutes',
    system: 'Metric',
    multiplier: decimal(60),
  },
  arcsec: {
    symbol: 'arcsec',
    singular: 'Arcsecond',
    plural: 'Arcseconds',
    system: 'Metric',
    multiplier: decimal(3600),
  },
  rot: {
    symbol: 'rot',
    singular: 'Rotation',
    plural: 'Rotations',
    system: 'Metric',
    multiplier: decimal(1).div(360),
  }
} satisfies { [k: string]: Unit };

export const grouped = {
  all: measure,
};

export const reference = 'deg';
