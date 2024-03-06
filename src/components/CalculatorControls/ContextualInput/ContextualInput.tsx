import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { useCallback, useContext, useMemo } from 'react';
import { NumberInput, NumberInputProps } from '@/components/controls/NumberInput/NumberInput';
import { UnitSelectorProps } from '@/components/controls/UnitSelector/UnitSelector';
import { NamespaceContext } from '@/components/Namespace/Namespace';
import { Decimal } from '@/types/Decimal';

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
  const namespace = useContext(NamespaceContext);

  const _value = useMemo(() => (
    controller.getValue(name, namespace)
  ), [controller.getValue]);

  const setValue = useCallback((name: string, value: Decimal) => {
    controller.setValue(name, value, namespace);
  }, [controller.setValue, namespace]);

  return (
    <NumberInput
      name={name}
      value={_value}
      units={units}
      unit={unit}
      onChange={setValue}
      disabled={disabled}
    />
  );
}
