import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Suspense } from 'preact/compat';

import Header from './components/layout/Header';

import Home from './pages/Home';
import Resume from './pages/Resume';
const Calculators = React.lazy(() => import('./pages/Calculators'));

export default () => (
    <BrowserRouter>
        <Header />
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                    <Route path="/" exact component={ Home } />
                    <Route path="/cv" component={ Resume } />
                    <Route path="/calculators" component={ Calculators } />
                </Switch>
            </Suspense>
        </main>
    </BrowserRouter>
);
