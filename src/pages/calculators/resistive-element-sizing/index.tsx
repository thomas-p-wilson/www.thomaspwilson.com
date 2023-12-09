import { CalculatorContextProvider, CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import { CalculatorSettings } from '@/components/CalculatorSettings/CalculatorSettings'
import { ContextualPresetChooser } from '@/components/ContextualPresetChooser/ContextualPresetChooser';
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import * as length from '@/units/length';
import * as energy from '@/units/energy';
import { decimal, pi } from '@/utils/decimal';
import BigDecimal from 'decimal.js';

export const resistanceWirePresets = [
  {
    name: 'Kanthal A-1 13ga',
    values: {
      resistivity: decimal('0.548885'),
      diameter: decimal('0.0018288'),
    },
  },
  {
    name: 'Kanthal A-1 14ga',
    values: {
      resistivity: decimal('0.696522'),
      diameter: decimal('0.0016256'),
    },
  },
  {
    name: 'Kanthal A-1 15ga',
    values: {
      resistivity: decimal('0.865813'),
      diameter: decimal('0.0014478'),
    },
  },
  {
    name: 'Kanthal A-1 16ga',
    values: {
      resistivity: decimal('1.086614'),
      diameter: decimal('0.00129032'),
    },
  },
  {
    name: 'Kanthal A-1 20ga',
    values: {
      resistivity: decimal('2.841535'),
      diameter: decimal('0.000811784'),
    },
  },
  {
    name: 'Kanthal A-1 22ga',
    values: {
      resistivity: decimal('4.533136'),
      diameter: decimal('0.00064262'),
    },
  },
  {
    name: 'Kanthal A-1 24ga',
    values: {
      resistivity: decimal('7.063648'),
      diameter: decimal('0.00051054'),
    },
  },
  {
    name: 'Kanthal A-1 26ga',
    values: {
      resistivity: decimal('11.463254'),
      diameter: decimal('0.00040386'),
    },
  },
  {
    // https://www.masterwiresupply.com/mws-50-ft-28-gauge-kanthal-a1-round-wire/
    name: 'Kanthal A-1 28ga',
    values: {
      resistivity: decimal('17.2900268'),
      diameter: decimal('0.00032'),
    },
  },
]

export const ResistiveElementSizingInitialState: Partial<CalculatorStateShape> = {
  values: {
    voltage: new BigDecimal('230'), // V
    wattage: new BigDecimal('1000'), // W
    resistivity: new BigDecimal('4.53313'), // ohm/m (22ga Kanthal A-1)
    diameter: new BigDecimal('.00064262'), // metres
  },
  units: {
    diameter: 'metric-millimetre',
    radius: 'metric-millimetre',
    area: 'metric-millimetre',
  },
  calculations: {
    current: ({ voltage, wattage }: any) => {
      if (voltage && wattage) {
        return wattage.div(voltage);
      }
    },
    radius: (state: any) => {
      if (state.diameter) {
        return state.diameter.div(2);
      }
    },
    area: (state: any) => {
      if (state.diameter) {
        return state.diameter.div(2).pow(2).times(Math.PI);
      }
    },
    resistance: ({ voltage, wattage }: any) => {
      if (voltage && wattage) {
        return voltage.pow(2).div(wattage);
      }
    },
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
    },
    wire_surface_load: ({ wattage, diameter, length }: any) => {
      if (wattage && diameter && length) {
        const wattage_in_joules = wattage.times(3600);
        return wattage_in_joules.div(diameter.times(pi).times(length)); // W/m^2
      }
    }
  }
}

export default () => {
  return (
    <CalculatorContextProvider initialState={ResistiveElementSizingInitialState}>
      <CalculatorSettings />

      <h1>Resistive Element Sizing</h1>


      <h3>Electrical Service</h3>
      <InputGroup>
        <label htmlFor="voltage">Voltage</label>
        <ContextualInput
          name="voltage"
        />
        <span>V</span>
      </InputGroup>
      <InputGroup>
        <label htmlFor="wattage">Wattage</label>
        <ContextualInput
          name="wattage"
        />
        <span>W</span>
      </InputGroup>
      <InputGroup disabled>
        <label htmlFor="current">Current</label>
        <ContextualInput
          name="current"
          disabled
        />
        <span>A</span>
      </InputGroup>
      <InputGroup disabled>
        <label htmlFor="resistance">Resistance</label>
        <ContextualInput
          name="resistance"
          disabled
        />
        <span>Ohm</span>
      </InputGroup>

      <h3>Resistance Wire Properties</h3>
      <InputGroup>
        <label htmlFor="resistivity">Wire resistivity</label>
        <ContextualPresetChooser choices={resistanceWirePresets} />
        <ContextualInput
          name="resistivity"
        />
        <span>Ohm/m</span>
      </InputGroup>
      <ContextualInputWithDimension
        name="diameter"
        label="Wire diameter"
        units={length}
        unit="metric-metre"
      />
      <ContextualInputWithDimension
        name="radius"
        label="Wire radius"
        units={length}
        unit="metric-metre"
        disabled
      />
      <ContextualInputWithDimension
        name="area"
        label="Cross-sectional area"
        units={length}
        unit="metric-metre"
        unitExponent={decimal(2)}
        disabled
      />
      <ContextualInputWithDimension
        name="length"
        label="Wire length"
        units={length}
        unit="metric-metre"
        disabled
      />

      <h3>Coiling</h3>
      {/* Mean diameter is total diameter - wire diameter */}
      <ContextualInputWithDimension
        name="coil_diameter"
        label="Mean coil diameter"
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

      <h3>Surface Loading</h3>
      <ContextualInputWithDimension
        name="wire_surface_load"
        label="Wire surface load"
        units={energy}
        unit="metric-watt"
        dimensions={length}
        dimension="metric-metre"
        dimensionExponent={decimal(2)}
      />
    </CalculatorContextProvider>
  );
}
