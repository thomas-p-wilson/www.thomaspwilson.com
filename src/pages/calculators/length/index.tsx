import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as length from '../../../units/length';

export const render = () => (
  <ConversionView measure={length} base="metric-metre" />
)
