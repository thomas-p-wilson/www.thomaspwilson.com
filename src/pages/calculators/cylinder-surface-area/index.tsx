import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import * as length from '@/units/length';
import { decimal, pi } from '@/utils/decimal';
import { Decimal } from '@/types/Decimal';
import { NestedCalculator } from '@/components/NestedCalculator/NestedCalculator';

// REFERENCE:
// https://knifedogs.com/threads/heat-treat-oven-how-to-design-and-calculate-the-heating-elements.21072/

/**
 * Calculate the surface area of a cylinder. Note that the inputs should have
 * the same unit of measure (ex metres, centimetres, etc).
 * @param r The radius
 * @param h The height
 */
const cylinderSurfaceArea = (circumference: Decimal, r: Decimal, h: Decimal): Decimal => (
  circumference.times(h).add(pi.times(2).times(r.pow(2)))
);

export const state: Partial<CalculatorStateShape> = {
  values: {
    height: decimal('1'),
  },
  calculations: {
    surface_area: ({ circumference, height }: any) => {
      console.log('Circumference: ', circumference);
      console.log('Circumference value: ', circumference?.circumference);
      console.log('Radius value: ', circumference?.radius);
      if (circumference?.circumference && circumference?.radius && height) {
        return cylinderSurfaceArea(circumference.circumference, circumference.radius, height);
      }
      return undefined;
    },
  }
}

export const render = () => (
  <>
    <NestedCalculator
      name="circumference"
      title="Circumference"
    />
    <ContextualInputWithDimension
      name="height"
      label="Height"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="surface_area"
      label="Surface area"
      units={length}
      unit="metric-metre"
      unitExponent={decimal(2)}
      disabled
    />
  </>
);
