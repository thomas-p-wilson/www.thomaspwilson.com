import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { useCallback, useContext, useMemo } from 'react';
import { NumberInput } from '@/components/controls/NumberInput/NumberInput';
import { NamespaceContext } from '@/components/Namespace/Namespace';
import { Decimal } from '@/types/Decimal';
import { FieldProps } from '@/components/controls/Field/Field';
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import { UnitSelector } from '@/components/controls/UnitSelector/UnitSelector';

export type ContextualFieldProps = Omit<FieldProps, 'value' | 'scale' | 'onChange'>

export const ContextualField = ({
  type,
  name,
  label,
  disabled,
  ...props
}: ContextualFieldProps) => {
  const controller = useCalculatorContext();
  const namespace = useContext(NamespaceContext);

  const _value = useMemo(() => (
    controller.getValue(name, namespace)
  ), [controller.getValue]);

  const setValue = useCallback((name: string, value: Decimal) => {
    controller.setValue(name, value, namespace);
  }, [controller.setValue, namespace]);

  return (
    <InputGroup disabled={disabled}>
      {label && (<label htmlFor={name}>{label}</label>)}
      {
        type === 'number' && (
          <NumberInput
            name={name}
            value={_value}
            units={props.units}
            unit={props.unit}
            onChange={setValue}
            disabled={disabled}
          />
        )
      }
      {
        (props.unit && props.units) && (
          <UnitSelector
            name={name}
            value={props.unit}
            units={props.units}
            exponent={props.unitExponent}
            onChange={props.onChangeUnit}
          />
        )
      }
      {
        (props.dimension && props.dimensions) && (
          <UnitSelector
            name={name}
            value={props.dimension}
            units={props.dimensions}
            exponent={props.dimensionExponent}
            onChange={props.onChangeDimension}
          />
        )
      }
    </InputGroup>
  );
}
