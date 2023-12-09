import { MeasureFile } from '@/units/MeasureFile'
import { Decimal } from './Decimal'

export type WithDimension = {
  dimensions?: MeasureFile
  dimension?: string
  dimensionExponent?: Decimal
}
