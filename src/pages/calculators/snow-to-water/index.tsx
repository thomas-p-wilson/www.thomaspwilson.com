import { CalculatorStateShape } from '@/components/CalculatorContext/CalculatorContext'
import { NestedCalculator } from '@/components/NestedCalculator/NestedCalculator';
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

export const render = () => {
  return (
    <>
      <NestedCalculator
        name="box-volume"
        title="Snow volume"
      />
    </>
  );
}
