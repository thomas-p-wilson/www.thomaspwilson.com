import { useCalculatorContext } from '@/components/CalculatorContext/CalculatorContext';
import { Input } from '@/components/controls/Input/Input';
import { Decimal } from '@/types/Decimal';
import { useCallback, useMemo, useState } from 'react';
import BigDecimal from 'decimal.js';
import { decimal } from '@/utils/decimal';
import { convert } from '@/utils/convert';
import { WithUnit } from '@/types/WithUnit';
import { WithDimension } from '@/types/WithDimension';

export type NumberInputProps<N extends boolean> = WithUnit & WithDimension & {
  name: string
  onChange: (name: string, value: N extends true ? number : Decimal) => void
  value?: N extends true ? number : Decimal
  placeholder?: string
  scale?: number
  significantDigits?: number
  number?: N
  disabled?: boolean
}

export const NumberInput = <N extends boolean>({
  name,
  onChange,
  value,
  placeholder,
  units,
  unit,
  unitExponent = decimal('1'),
  dimensions,
  dimension,
  dimensionExponent = decimal('1'),
  scale: _scale,
  significantDigits: _significantDigits,
  number,
  disabled,
}: NumberInputProps<N>) => {
  const controller = useCalculatorContext();
  const [display, setDisplay] = useState<string>('');
  const [focused, setFocused] = useState<boolean>(false);

  const _onChange = useCallback((ev: any) => {
    setDisplay(ev.target.value);
    setFocused(true);
    if (ev.target.value === '') {
      onChange(name, undefined!);
    }

    try {
      let num = new BigDecimal(ev.target.value);
      if (unit && units && unit !== units.reference) {
        num = convert(units.measure, num, unitExponent, unit, units.reference);
      }
      if (number) {
        onChange(name, num.toNumber() as any);
      } else {
        onChange(name, num as any);
      }
    } catch (err) {
      // Ignore
      console.log('Error: ', err);
    }
  }, [unit, units])

  const onBlur = useCallback(() => {
    setDisplay('');
    setFocused(false);
  }, [setDisplay]);

  const _value: string = useMemo(() => {
    if (display || focused || !value) {
      return display;
    }

    if (number || typeof value === 'number') {
      return String(value);
    }

    // @ts-expect-error Edge case where we return and display 'err' in the input element
    if (value === 'err') {
      return value;
    }

    let result = value as Decimal;

    if (unit && units && unit !== units.reference) {
      result = convert(units.measure, value, unitExponent, units.reference, unit);
    }

    if (dimension && dimensions && dimension !== dimensions.reference) {
      console.log('Convert dimension: ', name, `(${result.toString()})`, ' from: ', dimensions.reference, ' to: ', dimension)
      result = convert(dimensions.measure, result, dimensionExponent, dimensions.reference, dimension as any);
    }

    if (number) {
      return result.toString();
    }

    const significantDigits = _significantDigits ?? controller.significantDigits[name] ?? controller.globalSignificantDigits;
    const scale = _scale ?? controller.scales[name] ?? controller.globalScale;
    if (result && result.lessThanOrEqualTo(1 / Math.pow(10, scale))) {
      return result.toSignificantDigits(significantDigits).toExponential(scale)
    }

    return result.toSignificantDigits(significantDigits).toFixed(scale);
  }, [
    controller.values,
    display,
    _significantDigits,
    _scale,
    controller.significantDigits[name],
    controller.globalSignificantDigits,
    controller.scales[name],
    controller.globalScale,
    controller.dimensions[name],
    unit,
    units,
    unitExponent,
    dimension,
    dimensions,
    dimensionExponent,
  ]);

  return (
    <Input
      name={name}
      value={_value}
      onChange={_onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
