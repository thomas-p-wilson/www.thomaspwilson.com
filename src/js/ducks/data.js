import {
    call, put, takeLatest
} from 'redux-saga/effects';

export const actions = {
    setData: (data) => {
        return {
            type: 'SET_DATA',
            ...data
        }
    }
};

export const reducers = (initial_state) => ({
    data(state = initial_state || null, { type, ...data }) {
        switch (type) {
            case 'SET_DATA':
                return {
                    ...data
                };
            default:
                return state;
        }
    }
});
