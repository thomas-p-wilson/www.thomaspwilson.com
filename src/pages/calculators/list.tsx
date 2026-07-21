import React from 'react';
import { CalculatorDescriptor } from '@/types/CalculatorDescriptor';

const jsons = require.context(__dirname, true, /\.json$/);

export const descriptors: CalculatorDescriptor[] = jsons.keys()
  .map((key) => ({
    ...jsons(key),
    dir: key.substring(2, key.lastIndexOf('/'))
  } satisfies CalculatorDescriptor)) as CalculatorDescriptor[]

export const calculators = require.context('.', true, /\.tsx?$/, 'lazy');

export const getCalculator = (name: string): { render: Promise<any>, state: Promise<any>, Component: React.LazyExoticComponent<any> } => {
  const promise = calculators(`./${name}/index.tsx`) as Promise<{ render: any, state: any }>;

  return {
    render: promise.then(({ render }) => render).catch(() => (null)),
    state: promise.then(({ state }) => state).catch(() => ({})),
    Component: React.lazy(() => promise.then(({ render }) => ({ default: render })).catch((err) => ({ default: () => (<div>Not found</div>) }))),
  }
};
