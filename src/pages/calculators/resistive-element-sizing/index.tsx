import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import { ContextualPresetChooser } from '@/components/ContextualPresetChooser/ContextualPresetChooser';
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import * as length from '@/units/length';
import * as energy from '@/units/energy';
import { decimal, pi } from '@/utils/decimal';
import BigDecimal from 'decimal.js';
import { Decimal } from '@/types/Decimal';

// REFERENCE:
// https://knifedogs.com/threads/heat-treat-oven-how-to-design-and-calculate-the-heating-elements.21072/

/**
 * Calculate the surface area of a cylinder. Note that the inputs should have
 * the same unit of measure (ex metres, centimetres, etc).
 * @param r The radius
 * @param h The height
 */
const cylinderSurfaceArea = (r: Decimal, h: Decimal): Decimal => (
  pi.times(2).times(r).times(h).add(pi.times(2).times(r.pow(2)))
);

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
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 18ga',
    values: {
      resistivity: decimal('1.8'), // Ohm/m
      diameter: decimal('0.001'), // m
    },
  },
  {
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 20ga',
    values: {
      resistivity: decimal('2.9'), // Ohm/m
      diameter: decimal('0.0008'), // m
    },
  },
  {
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 22ga',
    values: {
      resistivity: decimal('5.1'), // Ohm/m
      diameter: decimal('0.0006'), // m
    },
  },
  {
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 24ga',
    values: {
      resistivity: decimal('7.4'), // Ohm/m
      diameter: decimal('0.0005'), // m
    },
  },
  {
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 26ga',
    values: {
      resistivity: decimal('11.5'), // Ohm/m
      diameter: decimal('0.0004'), // m
    },
  },
  {
    // https://www.intaste.de/Kanthal-A1-resistance-wire-02mm-10mm-040-mm-26AWG
    name: 'Kanthal A-1 28ga',
    values: {
      resistivity: decimal('20.5'), // Ohm/m
      diameter: decimal('0.00032'), // m
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
    surface_area: ({ radius, length }: any) => {
      if (radius && length) {
        return cylinderSurfaceArea(radius, length);
      }
      return undefined;
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
    wire_surface_load: ({ wattage, radius, length }: any) => {
      if (wattage && radius && length) {
        const surfaceArea = cylinderSurfaceArea(radius, length);
        return wattage.div(surfaceArea);
      }
    }
  }
}

export const render = () => {
  return (
    <>
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
        <ContextualPresetChooser
          choices={resistanceWirePresets}
          name="resistanceWirePreset"
        />
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
      <ContextualInputWithDimension
        name="surface_area"
        label="Wire surface area"
        units={length}
        unit="metric-metre"
        unitExponent={decimal(2)}
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
        dimension="metric-centimetre"
        dimensionExponent={decimal(2)}
      />
    </>
  );
}
