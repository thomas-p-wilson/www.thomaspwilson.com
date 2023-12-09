import { GroupedMeasure, Measure } from './Measure'

export type MeasureFile = {
  measure: Measure
  grouped: GroupedMeasure
  reference: string
}
