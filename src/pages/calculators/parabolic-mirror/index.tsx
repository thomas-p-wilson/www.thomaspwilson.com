import { CalculatorContextProvider, CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext';
import { decimal, pi } from '@/utils/decimal';
import { CalculatorSettings } from '@/components/CalculatorSettings/CalculatorSettings';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension';
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { ContextualSelect } from '@/components/CalculatorControls/ContextualSelect/ContextualSelect';
import * as length from '@/units/length';
import * as mass from '@/units/mass';

// https://www.bbastrodesigns.com/sagitta.html

export const SpinCastingParabolaInitialState: Partial<CalculatorStateShape> = {
  values: {
    diameter: decimal(0.4), // 40 cm
    focal_length: decimal(1.2), // 3x the diameter
    profile: 'paraboloidal' as any,
    construction: 'ground_blank' as any,
    edge_thickness: decimal(0.05), // 5 cm
  },
  calculations: {
    radius: ({ diameter }: any) => {
      if (diameter) {
        return diameter.div(2);
      }
    },
    area: ({ radius }: any) => {
      if (radius) {
        return radius.pow(2).times(Math.PI);
      }
    },
    focal_ratio: ({ focal_length, diameter }: any) => {
      if (focal_length && diameter) {
        return focal_length.div(diameter);
      }
    },
    radius_of_curvature: ({ diameter, focal_ratio }: any) => {
      if (diameter && focal_ratio) {
        return diameter.times(focal_ratio).times(2);
      }
    },
    starting_volume: ({ radius, edge_thickness }: any) => {
      if (radius && edge_thickness) {
        return radius.pow(2).times(Math.PI).times(edge_thickness);
      }
    },
    starting_mass: ({ starting_volume }: any) => {
      if (starting_volume) {
        return starting_volume.times(decimal('2579000')); // g/m^3; Defaulting to sodalime glass. Need to add selector for materials
      }
    },
    sagitta: ({ profile, radius, focal_length, radius_of_curvature }: any) => {
      if (!profile || !focal_length || !radius || !radius_of_curvature) {
        return;
      }

      if (profile === 'spherical') {
        return radius_of_curvature.sub(radius_of_curvature.pow(2).sub(radius.pow(2)).sqrt());
      }
      if (profile === 'paraboloidal') {
        return radius.pow(2).div(focal_length.times(4));
      }
    },
    sagittal_area: ({ profile, radius, focal_length, sagitta }) => {
      if (!profile || !radius || !sagitta || !focal_length) {
        return undefined;
      }

      // @ts-expect-error
      if (profile === 'spherical') {
        return sagitta.times(focal_length).times(Math.PI).times(2)
      }
      // @ts-expect-error
      if (profile === 'paraboloidal') {
        const r = radius;
        const r_squared = r.pow(2);
        const sag_squared = sagitta.pow(2);

        // https://www.vcalc.com/wiki/paraboloid-surface-area
        return pi.times(r_squared)
          .add(
            pi.times(r)
              .div(sag_squared.times(6))
              .times(
                r_squared.add(sag_squared.times(4)).pow(decimal(3).div(2))
                  .sub(r.pow(3))
              )
          )
      }
      return undefined;
    },
    sagittal_volume: ({ profile, radius, sagitta }: any) => {
      if (!profile || !radius || !sagitta) {
        return;
      }

      const r = radius;
      const r_squared = r.pow(2);
      if (profile === 'spherical') {
        return pi.times(sagitta).div(6).times(r_squared.times(3).add(sagitta.pow(2)));
      }
      if (profile === 'paraboloidal') {
        return pi.times(r_squared).times(sagitta).div(2);
      }
      return undefined;
    },
    remaining_volume: ({ construction, starting_volume, sagittal_volume }: any) => {
      if (construction === 'ground_blank' && starting_volume && sagittal_volume) {
        return starting_volume.sub(sagittal_volume);
      }
    },
    remaining_mass: ({ construction, remaining_volume }: any) => {
      if (construction === 'ground_blank' && remaining_volume) {
        return remaining_volume.times(decimal('2579000')); // g/m^3; Defaulting to sodalime glass. Need to add selector for materials
      }
    }
  }
}

export default () => {
  return (
    <CalculatorContextProvider initialState={SpinCastingParabolaInitialState}>
      <CalculatorSettings />

      <h1>Paraboloidal Mirror Design</h1>

      <p>Supports spherical or paraboloidal mirrors, ground blank and meniscus construction.</p>

      <InputGroup>
        <label htmlFor="profile">Profile</label>
        <ContextualSelect
          name="profile"
          items={[
            {
              text: 'Spherical',
              value: 'spherical',
            },
            {
              text: 'Paraboloidal',
              value: 'paraboloidal',
            },
          ]}
        />
      </InputGroup>
      <InputGroup>
        <label htmlFor="construction">Construction</label>
        <ContextualSelect
          name="construction"
          items={[
            {
              text: 'Ground blank',
              value: 'ground_blank',
            },
            {
              text: 'Meniscus',
              value: 'meniscus',
            },
          ]}
        />
      </InputGroup>
      <ContextualInputWithDimension
        name="diameter"
        label="Diameter"
        units={length}
        unit="metric-centimetre"
      />
      <ContextualInputWithDimension
        name="area"
        label="Area"
        units={length}
        unit="metric-centimetre"
        unitExponent={decimal(2)}
        disabled
      />
      <ContextualInputWithDimension
        name="focal_length"
        label="Focal length"
        units={length}
        unit="metric-centimetre"
      />
      <InputGroup>
        <label htmlFor="focal_ratio">Focal ratio</label>
        <ContextualInput
          name="focal_ratio"
          disabled
        />
      </InputGroup>
      <ContextualInputWithDimension
        name="edge_thickness"
        label="Edge thickness"
        units={length}
        unit="metric-centimetre"
      />
      <ContextualInputWithDimension
        name="starting_volume"
        label="Starting volume"
        units={length}
        unit="metric-centimetre"
        unitExponent={decimal(3)}
      />
      <ContextualInputWithDimension
        name="starting_mass"
        label="Starting mass"
        units={mass}
        unit="metric-kilogram"
      />

      <h3>Dish Info</h3>
      <ContextualInputWithDimension
        name="sagitta"
        label="Sagitta"
        units={length}
        unit="metric-millimetre"
      />
      <ContextualInputWithDimension
        name="sagittal_area"
        label="Sagittal area"
        units={length}
        unit="metric-centimetre"
        unitExponent={decimal(2)}
      />
      <ContextualInputWithDimension
        name="sagittal_volume"
        label="Sagittal volume"
        units={length}
        unit="metric-centimetre"
        unitExponent={decimal(3)}
      />

      <h3>Final Ground Blank Attributes</h3>
      <ContextualInputWithDimension
        name="remaining_volume"
        label="Remaining volume"
        units={length}
        unit="metric-centimetre"
        unitExponent={decimal(3)}
      />
      <ContextualInputWithDimension
        name="remaining_mass"
        label="Remaining mass"
        units={mass}
        unit="metric-kilogram"
      />
    </CalculatorContextProvider>
  )
}
