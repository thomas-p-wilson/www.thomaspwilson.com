import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { Decimal } from '@/types/Decimal';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { InputWithDimension, InputWithDimensionProps } from '@/components/controls/InputWithDimension/InputWithDimension';
import { WithUnit } from '@/types/WithUnit';
import { WithDimension } from '@/types/WithDimension';
import { NamespaceContext } from '@/components/Namespace/Namespace';

export type ContextualInputWithDimensionProps = WithUnit & WithDimension & {
  name: InputWithDimensionProps['name']
  label: InputWithDimensionProps['label']
  defaultValue?: Decimal,
  disabled?: InputWithDimensionProps['disabled']
}

export const ContextualInputWithDimension = (props: ContextualInputWithDimensionProps) => {
  const {
    name,
    label,
    units,
    unit,
    unitExponent,
    dimensions,
    dimension,
    dimensionExponent,
    defaultValue,
    disabled,
  } = props;
  const controller = useCalculatorContext();
  const namespace = useContext(NamespaceContext);

  const _unit = controller.units[name] ?? unit;
  const _dimension = controller.dimensions[name] ?? dimension;

  const _value = useMemo(() => (
    controller.getValue(name, namespace) ?? defaultValue
  ), [controller.getValue]);

  const setValue = useCallback((name: string, value: Decimal) => {
    controller.setValue(name, value, namespace);
  }, [controller.setValue, namespace]);

  return (
    <InputWithDimension
      name={name}
      label={label}
      value={_value}

      units={units}
      unit={_unit}
      unitExponent={unitExponent}
      dimensions={dimensions}
      dimension={_dimension}
      dimensionExponent={dimensionExponent}
      onChange={setValue}
      onChangeUnit={controller.setUnit}
      onChangeDimension={controller.setDimension}
      disabled={disabled}
    />
  );
}
