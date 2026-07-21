import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as angle from '../../../units/angle';

export const render = () => (
  <ConversionView measure={angle} base="deg" />
)
