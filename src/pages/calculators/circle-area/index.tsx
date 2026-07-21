import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import * as length from '@/units/length';
import { decimal, pi } from '@/utils/decimal';

export const state: Partial<CalculatorStateShape> = {
  values: {
    radius: decimal('0.5'),
  },
  calculations: {
    circumference: ({ radius }: any) => {
      if (radius) {
        return radius.times(pi).times(2);
      }
    },
  }
}

export const render = () => (
  <>
    <ContextualInputWithDimension
      name="radius"
      label="Radius"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="circumference"
      label="Circumference"
      units={length}
      unit="metric-metre"
    />
  </>
);
