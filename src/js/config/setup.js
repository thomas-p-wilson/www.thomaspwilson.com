import React from 'react';
import { useRef } from 'preact/hooks';
import history from './redux/history';
import store from './redux/store';

React.useRef = useRef;

export { history, store };
