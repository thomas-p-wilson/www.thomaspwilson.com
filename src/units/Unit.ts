import { Decimal } from '@/types/Decimal'

export type Unit = {
  /**
   * The short symbol used to denote the unit
   */
  symbol?: string
  /**
   * The singular unit name
   */
  singular: string
  /**
   * The plural unit name
   */
  plural: string
  /**
   * The system of measure, ex metric, british imperial, etc
   */
  system: 'Metric'
    | 'British Imperial Units'
    | 'U.S. Customary Units'
    | 'English Units - Pre 1826'
    | 'Gunter\'s Survey Units'
    | 'Myanmar/Burmese Units'
    | 'Tower Weights - Pre 1527'
    | 'Troy Weights - c. 1414'
    | 'Avoirdupois - c. 1300'
    | 'Avoirdupois - post-1588'
    | 'Hanseatic League'
    | 'British Apothecaries\' weights and conversions pre-1864'
    | 'British Apothecaries\' weights and conversions 1864-1971'
    | 'Mint Weights - c. 1649'
    | 'Scottish - c. 1681'
    | 'Dutch'
    | 'Other'
  /**
   * An optional list of synonymous names for the unit
   */
  synonyms?: Array<{
    singular: string,
    plural: string
  }>

  //
  // Conversion
  //
  /**
   * The amount to multiply by to get to the base unit
   */
  multiplier: Decimal
}
