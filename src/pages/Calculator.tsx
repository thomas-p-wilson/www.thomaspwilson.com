import { Route, Routes } from 'react-router-dom';
import { descriptors } from './calculators/list';
import React from 'react';

const components = require.context('./calculators', true, /\.tsx?$/, 'lazy');

const load = async (dir: string) => {
  return components(`./${dir}/index.tsx`);
}

const Loaders = descriptors.map((descriptor) => (
  React.lazy(() => (load(descriptor.dir)))
));

export const Component = () => {
  return (
    <div className="calculators-page">
      <div className="container">
        <Routes>
          {
            descriptors.map((descriptor, i) => (
              <Route path={descriptor.path} element={React.createElement(Loaders[i]!)} />
            ))
          }
        </Routes>
      </div>
    </div>
  );
}
