export const assign = (err, ...objects) => {
    Object.assign(err, ...objects);
    return err;
};

export const normalize = (err) => {
    if (typeof err === 'string') {
        return { message: err };
    }
    if (err instanceof Error) {
        return {
            message: err.message
        };
    }
    return err;
};

export const rejectWith = (...objects) => {
    return Promise.reject(assign(new Error(), objects));
};

export const addContext = (err, context = {}) => {
    if (!(err instanceof Error)) {
        throw new TypeError('Not a real error!');
    }

    err.context = context;
    return err;
};
