import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as mass from '../../../units/mass';

export const render = () => (
  <ConversionView measure={mass} base="metric-gram" />
)
