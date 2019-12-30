import {
    call, put, takeLatest
} from 'redux-saga/effects';
import * as calculatorService from '../services/calculator';

export const actions = {
    fetchCalculator: (dispatch, getState, props, request = {}) => {
        const state = getState().calculator || {};
        const { loading, loaded, failed, slug } = state;
        if (loading) {
            console.log('Currently trying to load')
            return;
        }

        if (slug === props.match.params.calculator) {
            console.log('slug {} is the same as param {}', slug, props.match.params.calculator);
            return;
        }

        // Check for existing calculator implementation
        if (calculatorService.getCalculators()[props.match.params.calculator]) {
            console.log('Calculator {} is pre-loaded', props.match.params.calculator);
            return dispatch({
                type: 'FETCH_CALCULATOR_SUCCESS',
                slug: props.match.params.calculator,
                time: Date.now(),
                preloaded: true
            });
        }

        if (!loading) {
            console.log('Load the calculator')
            return dispatch({
                type: 'FETCH_CALCULATOR_REQUEST',
                request: {
                    request,
                    params: props.match.params
                }
            });
        }
    }
};

export const reducers = (initial_state) => ({
    calculator(state = initial_state || null, { type, ...rest }) {
        switch (type) {
            case 'FETCH_CALCULATOR_REQUEST':
            case 'FETCH_CALCULATOR_FAILURE':
            case 'FETCH_CALCULATOR_SUCCESS':
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
    function* fetchCalculator() {
        yield takeLatest('FETCH_CALCULATOR_REQUEST', function* fetchCalculator({ request }) {
            try {
                if (!request || !request.params || !request.params.calculator) {
                    throw new Error('Need calculator parameter');
                }
                yield call(calculatorService.fetchCalculator, request);
                yield put({
                    type: 'FETCH_CALCULATOR_SUCCESS',
                    slug: request.params.calculator,
                    time: Date.now()
                });
            } catch (err) {
                console.error(err);
                yield put({
                    type: 'FETCH_CALCULATOR_FAILURE',
                    slug: request.params.calculator,
                    failed: true,
                    time: Date.now(),
                    ...err
                });
            }
        });
    }
];
