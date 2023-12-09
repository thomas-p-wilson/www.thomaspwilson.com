import { Decimal } from '@/types/Decimal';
import { Measure } from '@/units/Measure';
import { Unit } from '@/units/Unit';
import BigDecimal from 'decimal.js';
import { decimal } from './decimal';

/**
 * @deprecated
 */
export class Converter<M extends Measure> {
  public measure: M;
  public value: Decimal;
  public exponent: Decimal;
  public origin: Unit;
  public originId: keyof M;
  public target: Unit;
  public targetId: keyof M;

  constructor(measure: M, value: Decimal, exponent: Decimal = decimal(1)) {
    this.measure = measure;
    this.value = value;
    this.exponent = exponent;
  }

  from(id: keyof M) {
    if (this.target) {
      throw new Error('.from must be called before .to');
    }

    this.origin = this.measure[id]!;
    this.originId = id;
    if (!this.origin) {
      throw new Error(`Unrecognized unit: ${String(id)}`);
    }

    return this;
  }

  to(id: keyof M) {
    if (!this.origin) {
      throw new Error('.to must be called after .from');
    }

    this.target = this.measure[id]!;
    this.targetId = id;
    if (!this.target) {
      throw new Error(`Unrecognized unit: ${String(id)}`);
    }

    // If the origin and target are the same, so is the value
    if (this.originId === this.targetId) {
      return this.value;
    }

    let result = this.value;
    if (this.exponent.toNumber() !== 1) {
      result = result.pow(new BigDecimal('1').div(this.exponent));
    }
    result = result.times(this.origin.multiplier || 1);
    if (this.origin.toReference) {
      result = this.origin.toReference(result);
    } else if (this.origin.shift) {
      result = result.sub(this.origin.shift);
    }

    if (this.target.fromReference) {
      result = this.target.fromReference(result);
    } else if (this.target.shift) {
      result = result.add(this.target.shift);
    }
    result = result.div(this.target.multiplier || 1);
    if (this.exponent.toNumber() !== 1) {
      return result.pow(this.exponent);
    }
    return result;

    // /**
    // * Convert from the source value to its anchor inside the system
    // */
    // result = this.val * this.origin.unit.to_anchor;

    // /**
    // * For some changes it's a simple shift (C to K)
    // * So we'll add it when convering into the unit (later)
    // * and subtract it when converting from the unit
    // */
    // if (this.origin.unit.anchor_shift) {
    // result -= this.origin.unit.anchor_shift
    // }

    // *
    // * Convert from one system to another through the anchor ratio. Some conversions
    // * aren't ratio based or require more than a simple shift. We can provide a custom
    // * transform here to provide the direct result

    // if(this.origin.system != this.target.system) {
    // transform = measures[this.origin.measure]._anchors[this.origin.system].transform;
    // if (typeof transform === 'function') {
    // result = transform(result)
    // }
    // else {
    // result *= measures[this.origin.measure]._anchors[this.origin.system].ratio;
    // }
    // }

    // /**
    // * This shift has to be done after the system conversion business
    // */
    // if (this.target.unit.anchor_shift) {
    // result += this.target.unit.anchor_shift;
    // }

    // /**
    // * Convert to another unit inside the target system
    // */
    // return result / this.target.unit.to_anchor;
  }
}

export const convert = <M extends Measure>(measure: M, value: Decimal, exponent: Decimal = decimal(1)) => {
  return new Converter<M>(measure, value, exponent);
}
