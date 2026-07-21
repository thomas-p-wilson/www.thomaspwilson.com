import { CalculatorContextProvider, CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import { CalculatorSettings } from '@/components/CalculatorSettings/CalculatorSettings'
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import * as length from '@/units/length';
import { decimal } from '@/utils/decimal';

export const state: Partial<CalculatorStateShape> = {
  values: {
    length: decimal('1'),
    coil_diameter: decimal('.012'),
    turn_space: decimal('.003')
  },
  units: {
    coil_diameter: 'metric-millimetre',
    radius: 'metric-millimetre',
    area: 'metric-millimetre',
  },
  calculations: {
    length: ({ resistance, resistivity }: any) => {
      if (resistance && resistivity) {
        return resistance.div(resistivity);
      }
    },
    coil_diameter: ({ diameter }: any) => {
      if (diameter) {
        return diameter.times(12);
      }
    },
    turn_space: ({ diameter }: any) => {
      if (diameter) {
        return diameter.times(4);
      }
    },
    turn_circumference: ({ coil_diameter }: any) => {
      if (coil_diameter) {
        return coil_diameter.times(Math.PI);
      }
    },
    turn_length: ({ turn_space, turn_circumference }: any) => {
      if (turn_space && turn_circumference) {
        return turn_space.pow(2).add(turn_circumference.pow(2)).sqrt();
      }
    },
    turns: ({ length, turn_length }: any) => {
      if (length && turn_length) {
        return length.div(turn_length);
      }
    },
    coil_length: ({ turn_space, turns }: any) => {
      if (turn_space && turns) {
        return turn_space.times(turns);
      }
    }
  }
}

export const render = () => (
  <>
    <ContextualInputWithDimension
      name="length"
      label="Total wire length"
      units={length}
      unit="metric-metre"
      disabled
    />
    <ContextualInputWithDimension
      name="coil_diameter"
      label="Coil diameter"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="turn_space"
      label="Turn spacing"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="turn_circumference"
      label="Turn circumference"
      units={length}
      unit="metric-metre"
      disabled
    />
    <ContextualInputWithDimension
      name="turn_length"
      label="Turn length"
      units={length}
      unit="metric-metre"
      disabled
    />
    <InputGroup disabled>
      <label htmlFor="turns">Turns</label>
      <ContextualInput
        name="turns"
        disabled
      />
    </InputGroup>
    <ContextualInputWithDimension
      name="coil_length"
      label="Coil length"
      units={length}
      unit="metric-metre"
      disabled
    />
  </>
);
