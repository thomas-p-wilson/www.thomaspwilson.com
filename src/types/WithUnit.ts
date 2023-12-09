import { MeasureFile } from '@/units/MeasureFile'
import { Decimal } from './Decimal'

export type WithUnit = {
  units?: MeasureFile
  unit?: string
  unitExponent?: Decimal
}
