import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { Decimal } from '@/types/Decimal';
import { useMemo } from 'react';
import { InputWithDimension, InputWithDimensionProps } from '@/components/controls/InputWithDimension/InputWithDimension';
import { WithUnit } from '@/types/WithUnit';
import { WithDimension } from '@/types/WithDimension';

export type ContextualInputWithDimensionProps = WithUnit & WithDimension & {
  name: InputWithDimensionProps['name']
  label: InputWithDimensionProps['label']
  defaultValue?: Decimal,
  disabled?: InputWithDimensionProps['disabled']
}

export const ContextualInputWithDimension = ({
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
}: ContextualInputWithDimensionProps) => {
  const controller = useCalculatorContext();

  const _unit = controller.units[name] ?? unit;
  const _dimension = controller.dimensions[name] ?? dimension;
  const _value = useMemo(() => (
    controller.getValue(name) ?? defaultValue
  ), [controller.values, controller.calculations]);

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
      onChange={controller.setValue}
      onChangeUnit={controller.setUnit}
      onChangeDimension={controller.setDimension}
      disabled={disabled}
    />
  );
}
