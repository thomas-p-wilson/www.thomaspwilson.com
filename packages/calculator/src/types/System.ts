import * as Decimal from 'decimal.js';

export type MeasureName = 'length';

/**
 * A unit of measurement is a definite magnitude of a quantity that is used by
 * a system of measure for the same kind of quantity.
 */
export interface Unit {
  /**
   * Optional symbol to use when displaying the unit
   */
  symbol?: string
  /**
   * The singular name of the unit
   */
  singular: string
  /**
   * The plural name of the unit
   */
  plural: string
  /**
   * If true, this unit is considered the base unit of the measure
   */
  base?: boolean
  /**
   * The multiplier by which the corresponding value in metres is determined.
   * All conversions between verious systems of measure are made by converting
   * to the metre.
   */
  multiplier: Decimal
}

/**
 * The Measure represents a quantity defined by a system of measure. For
 * example: length, mass, volume, etc. The Measure contains one or more
 * units by which that quantity is measured.
 */
export type Measure = Map<string, Unit>;

/**
 * A system of measurement is a collection of units of measurement and rules
 * relating them to each other.
 */
export interface System {
  /**
   * Name of the system
   */
  name: string
  /**
   * Description of the system
   */
  description?: string
  /**
   * Set of measures belonging to the system, each of which represent a
   * quantity or meaningful composition of quantities.
   */
  measures: {
    [k in MeasureName]: Measure
  }
}
