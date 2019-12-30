import {
    call, put, takeLatest
} from 'redux-saga/effects';

export const actions = {
    setSettings: (settings) => {
        return {
            type: 'SET_SETTINGS',
            ...settings
        }
    }
};

export const reducers = (initial_state) => ({
    settings(state = initial_state || null, { type, ...settings }) {
        switch (type) {
            case 'SET_SETTINGS':
                return {
                    ...settings
                };
            default:
                return state;
        }
    }
});
