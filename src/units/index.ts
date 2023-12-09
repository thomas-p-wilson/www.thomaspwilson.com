import { MeasureFile } from './MeasureFile';
import * as angle from './angle';
import * as energy from './energy';
// import * as frequency from './frequency';
import * as length from './length';
import * as mass from './mass';
// import * as power from './power';
// import * as pressure from './pressure';
// import * as temperature from './temperature';
// import * as time from './time';
// import * as volume from './volume';

export const measures: { [k: string]: MeasureFile } = {
  angle,
  energy,
  // frequency,
  length,
  mass,
  // power,
  // pressure,
  // temperature,
  // time,
  // volume
}
