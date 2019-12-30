import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import { history, store } from './config/setup';

import '../scss/main.scss';
import App from './App';

if (typeof document !== 'undefined') {
    ReactDOM.render(
        <App history={ history } store={ store } />,
        document.getElementById('content')
    );
}
