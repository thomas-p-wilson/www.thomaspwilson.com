import { getCalculator } from '@/pages/calculators/list';
import { Suspense, useEffect, useMemo } from 'react';
import { Namespace } from '../Namespace/Namespace';
import { useCalculatorContext } from '../CalculatorContext/CalculatorContext';

export type NestedCalculatorProps = {
  name: string
  namespace?: string
  title: string
}

export const NestedCalculator = ({ name, namespace, title }: NestedCalculatorProps) => {
  const ns = namespace ?? name;
  const calculator = useMemo(() => getCalculator(name), [name]);
  const controller = useCalculatorContext();
  useEffect(() => {
    if (calculator && controller?.registerNestedCalculator) {
      calculator.state.then((state) => (controller.registerNestedCalculator(ns, state)));
    }
  }, [controller?.registerNestedCalculator, calculator, ns]);

  return (
    <div className="nested-calculator">
      <Namespace namespace={ns}>
        <Suspense fallback={<div>Loading...</div>}>
          <h3>{title}</h3>
          <calculator.Component />
        </Suspense>
      </Namespace>
    </div>
  );
}
