import {
    combineReducers, createStore, applyMiddleware, compose
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {
    connectRouter, routerMiddleware
} from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import promiseMiddleware from './middleware/promise';
import fetchMiddleware from './middleware/fetch';
import {
    reducers,
    sagas
} from '../../ducks';
import history from './history';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const state = {
    ...global.state || window.state || {}
};

// Build the middleware for intercepting and dispatching navigation actions
const router = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

// Build the store
const router_reducer = connectRouter(history);
const reducer = combineReducers({
    ...reducers.getRegistered(),
    router: router_reducer
});
const store = createStore(
    reducer,
    state,
    composeEnhancers(applyMiddleware(
        fetchMiddleware,
        promiseMiddleware,
        thunkMiddleware,
        sagaMiddleware,
        router
    ))
);

reducers.addListener((reducers) => {
    store.replaceReducer(combineReducers({
        ...reducers,
        router: router_reducer
    }));
    store.dispatch({ type: '@@REDUCER_INJECTED' });
});

sagas.getRegistered().forEach(sagaMiddleware.run);

sagas.addListener((sagas, new_sagas) => {
    new_sagas.forEach(sagaMiddleware.run);
});

export default store;
