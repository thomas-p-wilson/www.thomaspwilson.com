import {
    call, put, takeLatest
} from 'redux-saga/effects';
import * as initService from '../services/init';

export const reducers = (initial_state) => ({
    manifest(state = initial_state || null, { type, ...rest }) {
        switch (type) {
            case 'FETCH_MANIFEST_FAILURE':
            case 'FETCH_MANIFEST_SUCCESS':
                return {
                    ...state,
                    ...rest,
                    loading: type.endsWith('REQUEST'),
                    loaded: type.endsWith('SUCCESS')
                };
            default:
                return state;
        }
    }
});

export const sagas = [
    function* fetchManifest() {
        try {
            const result = yield call(initService.fetchManifest);
            yield put({
                type: 'FETCH_MANIFEST_SUCCESS',
                ...result,
                time: Date.now()
            });
        } catch (err) {
            console.error(err);
            yield put({
                type: 'FETCH_MANIFEST_FAILURE',
                failed: true,
                time: Date.now(),
                ...err
            });
        }
    }
];
