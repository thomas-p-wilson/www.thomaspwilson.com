import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as energy from '../../../units/energy';

export const render = () => (
  <ConversionView measure={energy} base="metric-joule" />
)
