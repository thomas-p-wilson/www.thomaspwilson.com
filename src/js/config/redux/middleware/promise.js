/* eslint-disable require-jsdoc, valid-jsdoc */

export function isPromise(value) {
    return value !== null && typeof value === 'object' && typeof value.then === 'function';
}

export default function promiseMiddleware(ref) {
    const { dispatch } = ref;

    return (next) => (action) => {
        const {
            type,
            promise,
            data,
            meta
        } = action;

        // Have we been given a promise?
        if (!promise || !isPromise(promise)) {
            return next(action);
        }

        // Deal with the promise
        const REQUEST = `${ type }_START`;
        const SUCCESS = `${ type }_SUCCESS`;
        const FAILURE = `${ type }_FAILURE`;

        /**
         * Function: getAction
         * Description: This function constructs and returns a rejected
         * or fulfilled action object. The action object is based off the Flux
         * Standard Action (FSA).
         *
         * Given an original action with the type FOO:
         *
         * The rejected object model will be:
         * {
         *   error: true,
         *   type: 'FOO_REJECTED',
         *   payload: ...,
         *   meta: ... (optional)
         * }
         *
         * The fulfilled object model will be:
         * {
         *   type: 'FOO_FULFILLED',
         *   payload: ...,
         *   meta: ... (optional)
         * }
         */
        const getAction = (newPayload, isRejected) => ({
            type: isRejected ? FAILURE : SUCCESS,

            // Include the payload property.
            ...((newPayload === null || typeof newPayload === 'undefined') ? {} : { res: newPayload }),

            // If the action is rejected, include an error property.
            ...(isRejected ? { error: newPayload } : {})
        });

        /**
         * Function: handleReject
         * Calls: getAction to construct the rejected action
         * Description: This function dispatches the rejected action and returns
         * the original Error object. Please note the developer is responsible
         * for constructing and throwing an Error object. The middleware does not
         * construct any Errors.
         */
        const handleReject = (reason) => {
            const localAction = getAction(reason, true);
            dispatch(localAction);
            if (reason && reason.status && reason.status === 401) {
                dispatch({ type: 'RESET' });
            }

            return Promise.reject(new Error({
                reason,
                action: localAction
            }));
        };

        /**
         * Function: handleFulfill
         * Calls: getAction to construct the fullfilled action
         * Description: This function dispatches the fulfilled action and
         * returns the success object. The success object should
         * contain the value and the dispatched action.
         */
        const handleFulfill = (value = null) => {
            const localAction = getAction(value, false);
            dispatch(localAction);

            return {
                value,
                action: localAction
            };
        };

        /**
         * First, dispatch the pending action:
         * This object describes the pending state of a promise and will include
         * any data (for optimistic updates) and/or meta from the original action.
         */
        next({
            // Concatentate the type string.
            type: REQUEST,

            // Include payload (for optimistic updates) if it is defined.
            ...(data !== undefined ? { res: data } : {}),

            // Include meta data if it is defined.
            ...(meta !== undefined ? { meta } : {})
        });

        /**
         * Second, dispatch a rejected or fulfilled action and move on to the
         * next middleware.
         */
        return promise.then(handleFulfill).catch(handleReject);
    };
}
