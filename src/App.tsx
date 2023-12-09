import React from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import './css/bootstrap.scss';
import { Layout } from './components/Layout/Layout';
import { Component as Home } from './pages/Home';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route Component={Layout}>
      <Route path="/" Component={Home} />
      <Route path="/cv" lazy={() => import('./pages/Resume')} />
      <Route path="/calculators/" lazy={() => import('./pages/CalculatorList')} />
      <Route path="/calculators/*" lazy={() => import('./pages/Calculator')} />
    </Route>
  )
)

export default () => (
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
