import { Unit } from './Unit'

export type Measure = {
  [k: string]: Unit
}

export type GroupedMeasure = {
  [k: string]: Measure
}
