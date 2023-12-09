import { UnitSelector, UnitSelectorProps } from '@/components/controls/UnitSelector/UnitSelector';
import * as length from '@/units/length';

export type ContextualUnitSelectorProps = {
  name: UnitSelectorProps['name']
  disabled: UnitSelectorProps['disabled']
}

export const ContextualUnitSelector = ({
  name,
}: ContextualUnitSelectorProps) => (
  <UnitSelector
    name={name}
    value={'metric-centimetre'}
    units={length}
  />
)
