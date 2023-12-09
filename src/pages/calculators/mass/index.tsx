import { ConversionView } from '../../../components/ConversionView/ConversionView';
import * as mass from '../../../units/mass';

export default () => (
  <ConversionView measure={mass} base="metric-gram" />
)
