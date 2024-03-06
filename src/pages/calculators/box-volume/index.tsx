import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import * as length from '@/units/length';
import { decimal } from '@/utils/decimal';

export const state: Partial<CalculatorStateShape> = {
  values: {
    length: decimal('0.5'),
    width: decimal('0.75'),
    depth: decimal('0.25'),
  },
  calculations: {
    volume: ({ length, width, depth }: any) => {
      if (length && width && depth) {
        return length.times(width).times(depth);
      }
    },
  }
}

export const render = () => {
  return (
    <>
      <ContextualInputWithDimension
        name="length"
        label="Length"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="width"
        label="Width"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="depth"
        label="Depth"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="volume"
        label="Volume"
        units={length}
        unit="metric-metre"
        disabled
      />
    </>
  );
}
