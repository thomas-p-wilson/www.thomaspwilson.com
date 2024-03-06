import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext';
import { decimal } from '@/utils/decimal';
import { G } from '@/utils/constants';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension';
import * as angle from '@/units/angle';
import * as length from '@/units/length';
import * as time from '@/units/time';

export const state: Partial<CalculatorStateShape> = {
  values: {
    focal_length: decimal(1.5)
  },
  calculations: {
    angular_velocity: ({ focal_length }: any) => {
      if (focal_length) {
        // https://www.sfu.ca/~mbahrami/ENSC%20283/Suggested%20Problems/Chapter%202/White_P2_159.pdf
        return G.div(decimal(2).times(focal_length)).sqrt().times(180).div(Math.PI);
      }
      return undefined;
    }
  }
}

export const render = () => {
  return (
    <>
      <h1>Spin-Casting a Paraboloid</h1>

      <ContextualInputWithDimension
        name="focal_length"
        label="Focal length"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="angular_velocity"
        label="Angular velocity"
        units={angle}
        unit="rad"
        unitExponent={decimal(-1)}
        dimensions={time}
        dimension="metric-second"
        disabled
      />
    </>
  )
}
