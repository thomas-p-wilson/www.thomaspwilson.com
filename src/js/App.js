import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from './pages/Home';
import Resume from './pages/Resume';
import Calculators from './pages/Calculators';

export default () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={ Home } />
            <Route path="/resume" component={ Resume } />
            <Route path="/calculators" component={ Calculators } />
        </Switch>
    </BrowserRouter>
);
