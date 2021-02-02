import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';

import App from './App';
import '../scss/style.scss';

if (typeof document !== 'undefined') {
    ReactDOM.render(
        <App />,
        document.getElementById('react-root')
    );
}
