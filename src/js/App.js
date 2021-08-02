import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Header from './components/layout/Header';

import Home from './pages/Home';
import Resume from './pages/Resume';
import Calculators from './pages/Calculators';

export default () => (
    <BrowserRouter>
        <Header />
        <main>
            <Switch>
                <Route path="/" exact component={ Home } />
                <Route path="/cv" component={ Resume } />
                <Route path="/calculators" component={ Calculators } />
            </Switch>
        </main>
    </BrowserRouter>
);
