import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { useMemo } from 'react';
import { NumberInput, NumberInputProps } from '@/components/controls/NumberInput/NumberInput';
import { UnitSelectorProps } from '@/components/controls/UnitSelector/UnitSelector';

export type ContextualInputProps = {
  name: NumberInputProps<any>['name']
  units?: UnitSelectorProps['units']
  unit?: UnitSelectorProps['value']
  disabled?: boolean
}

export const ContextualInput = ({
  name,
  units,
  unit,
  disabled,
}: ContextualInputProps) => {
  const controller = useCalculatorContext();

  const _value = useMemo(() => (
    controller.getValue(name)
  ), [controller.values]);

  return (
    <NumberInput
      name={name}
      value={_value}
      units={units}
      unit={unit}
      onChange={controller.setValue}
      disabled={disabled}
    />
  );
}
