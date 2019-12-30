import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router-dom';

import Calculators from './pages/Calculators';
import CalculatorPage from './pages/CalculatorPage';

export default ({
    store, history
}) => (
    <Provider store={ store }>
        <ConnectedRouter history={ history }>
            <Switch>
                <Route path="/" exact component={ Calculators } />
                <Route path="/:calculator" component={ CalculatorPage } />
            </Switch>
        </ConnectedRouter>
    </Provider>
);
