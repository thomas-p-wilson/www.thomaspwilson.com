/* eslint-disable require-jsdoc, valid-jsdoc */
import fetchFn from '../../../utils/uniform-fetch';

export function isPromise(value) {
    return value !== null && typeof value === 'object' && typeof value.then === 'function';
}

export default ({
    dispatch, getState
}) => (next) => (action) => {
    const {
        type,
        fetch
    } = action;

    // Have we been given a fetch request?
    if (!fetch) {
        return next(action);
    }

    const {
        uri,
        headers = {},
        ...rest
    } = fetch;

    // Inject our auth token if available
    const { token } = getState().authentication || {};
    if (token) {
        headers.Authorization = `Bearer:${ token }`;
    }

    return next({
        type,
        promise: fetchFn(
            uri,
            {
                headers,
                ...rest
            }
        )
            .then((res) => {
                if (!getState().connected) {
                    dispatch({
                        type: 'CONNECTED',
                        res: true
                    });
                }
                return res;
            })
            .catch((err) => {
                if (getState().connected) {
                    dispatch({
                        type: 'CONNECTED',
                        res: false
                    });
                }
                return Promise.reject(err);
            })
    });
};
