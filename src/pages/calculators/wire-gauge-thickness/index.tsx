import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { ContextualInput } from '@/components/CalculatorControls/ContextualInput/ContextualInput';
import { ContextualInputWithDimension } from '@/components/CalculatorControls/ContextualInputWithDimension/ContextualInputWithDimension'
import { InputGroup } from '@/components/controls/InputGroup/InputGroup';
import * as length from '@/units/length';
import { decimal, pi } from '@/utils/decimal';

export const state: Partial<CalculatorStateShape> = {
  values: {
    gauge: decimal('16'),
  },
  calculations: {
    diameter: ({ gauge }: any) => {
      if (gauge) {
        return decimal('0.127').times(decimal('92').pow((decimal('36').sub(decimal(gauge))).div(decimal('39')))).div(1000); // m^2
      }
      return undefined;
    },
    area: ({ diameter }: any) => {
      if (diameter) {
        return diameter.div(2).pow(2).times(pi);
      }
    },
    cmil: ({ area }: any) => {
      if (area) {
        console.log('Area: ', area.toNumber());
        return area.div(decimal('0.0000000005067074790975'));
      }
    }
  }
}

export const render = () => {
  return (
    <>
      <h1>Wire gauge diameter</h1>
      <InputGroup>
        <label htmlFor="gauge">AWG Gauge</label>
        <ContextualInput name="gauge" />
        <span>ga</span>
      </InputGroup>

      <ContextualInputWithDimension
        name="diameter"
        label="Diameter"
        units={length}
        unit="metric-millimetre"
      />
      <ContextualInputWithDimension
        name="area"
        label="Area"
        units={length}
        unit="metric-millimetre"
        unitExponent={decimal(2)}
      />
      <InputGroup>
        <label htmlFor="cmil">CMil</label>
        <ContextualInput name="cmil" />
        <span>cmil</span>
      </InputGroup>
    </>
  );
}
