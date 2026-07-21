import { Route, Routes } from 'react-router-dom';
import { descriptors, getCalculator } from './calculators/list';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { CalculatorContextProvider } from '@/components/CalculatorContext/CalculatorContext';
import { CalculatorSettings } from '@/components/CalculatorSettings/CalculatorSettings';
import './Calculator.scss';

type LoaderProps = {
  dir: string
  title: string
}

const Loader = ({ dir, title }: LoaderProps): JSX.Element => {
  const calculator = useMemo(() => getCalculator(dir), []);
  const [state, setState] = useState<any>();
  useEffect(() => {
    calculator.state.then(setState);
  }, []);

  if (!state) {
    <Suspense fallback={<p>Loading...</p>}>
      {null}
    </Suspense>
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CalculatorContextProvider initialState={state as any}>
        <CalculatorSettings />
        <h1>{title}</h1>

        <calculator.Component />
      </CalculatorContextProvider>
    </Suspense>
  );
}

const Loaders = descriptors.map((descriptor) => () => (<Loader {...descriptor} />));

export const Component = () => {
  return (
    <div className="calculators-page">
      <div className="container">
        <Routes>
          {
            descriptors.map((descriptor, i) => (
              <Route path={descriptor.path} element={React.createElement(Loaders[i]!)} key={descriptor.dir} />
            ))
          }
        </Routes>
      </div>
    </div>
  );
}
