import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as energy from '../../../units/energy';

export default () => (
  <ConversionView measure={energy} base="metric-joule" />
)
