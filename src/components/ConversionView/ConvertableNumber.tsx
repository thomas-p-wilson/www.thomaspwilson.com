import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { Decimal } from '@/types/Decimal';
import { MeasureFile } from '@/units/MeasureFile';
import { useCallback, useMemo } from 'react';
import { NumberInput, NumberInputProps } from '../controls/NumberInput/NumberInput';
import { decimal } from '@/utils/decimal';
import { convert } from '@/utils/convert';

const name = 'value';

export type ConvertibleNumberProps = {
  unit: string
  base: string
  measure: MeasureFile
  placeholder: NumberInputProps<any>['placeholder']
}

/**
 * The convertible number input is used in the ConversionView, where all fields
 * have the same name, and thus the state has only a single value. When a field
 * is updated, the state value is set to that value converted to metres, such
 * that all other fields can derive their values.
 */
export const ConvertibleNumber = ({
  unit,
  base,
  measure,
  placeholder,
}: ConvertibleNumberProps) => {
  const controller = useCalculatorContext();

  const onChange = useCallback((name: string, value: Decimal) => {
    controller.setValue(name, typeof value !== 'undefined' ? convert(measure.measure, value, decimal(1), unit, base) : value);
  }, [])

  const _value: Decimal | undefined = useMemo(() => {
    let result: Decimal | undefined = controller.getValue(name);

    if (!result) {
      return undefined;
    }

    // @ts-expect-error
    if (result === 'err') {
      return result;
    }

    if (base !== unit) {
      result = convert(measure.measure, result, decimal(1), base, unit);
    }

    return result;
  }, [controller.values, controller.significantDigits[name], controller.globalSignificantDigits, controller.scales[name], controller.globalScale]);

  return (
    <NumberInput
      name={name}
      value={_value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
