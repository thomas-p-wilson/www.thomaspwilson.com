import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import * as length from '@/units/length';
import * as energy from '@/units/energy';
import { decimal, pi } from '@/utils/decimal';

export const state: Partial<CalculatorStateShape> = {
  values: {
    chamber_height: decimal('0.21'),
    chamber_diameter: decimal('0.71'),
    watts_per_unit_area: decimal('8500'),
  },
  calculations: {
    chamber_radius: ({ chamber_diameter }: any) => {
      if (chamber_diameter) {
        return chamber_diameter.div(2);
      }
    },
    chamber_circumference: ({ chamber_height, chamber_radius }: any) => {
      if (chamber_height && chamber_radius) {
        return chamber_radius.times(pi).times(2);
      }
    },
    chamber_surface_area: ({ chamber_radius, chamber_height }: any) => {
      if (chamber_radius && chamber_height) {
        return pi.times(2).times(chamber_radius).times(chamber_height).add(pi.times(2).times(chamber_radius.pow(2)));
      }
      return undefined;
    },
    total_wattage: ({ chamber_surface_area, watts_per_unit_area }: any) => {
      if (chamber_surface_area && watts_per_unit_area) {
        return chamber_surface_area.times(watts_per_unit_area);
      }
    }
  }
}

export const render = () => (
  <>
    <ContextualInputWithDimension
      name="chamber_height"
      label="Firing chamber height"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="chamber_diameter"
      label="Firing chamber diameter"
      units={length}
      unit="metric-metre"
    />
    <ContextualInputWithDimension
      name="chamber_circumference"
      label="Firing chamber circumference"
      units={length}
      unit="metric-metre"
      disabled
    />
    <ContextualInputWithDimension
      name="chamber_surface_area"
      label="Firing chamber surface area"
      units={length}
      unit="metric-metre"
      unitExponent={decimal(2)}
      disabled
    />

    <h2>Electrical Info</h2>
    <ContextualInputWithDimension
      name="watts_per_unit_area"
      label="Watts per unit area"
      units={energy}
      unit="metric-watt"
      dimensions={length}
      dimension="metric-centimetre"
      dimensionExponent={decimal(2)}
      disabled
    />
    <ContextualInputWithDimension
      name="total_wattage"
      label="Total wattage"
      units={energy}
      unit="metric-watt"
      disabled
    />
  </>
);
