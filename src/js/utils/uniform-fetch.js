import { addContext } from './errors';

export const authenticated = (o) => {
    if (!o.ok) {
        return Promise.reject(o);
    }
    return o;
};

export const getContentType = (o) => {
    if (!o.headers) {
        return 'text/plain';
    }

    const headers = Array.from(o.headers.entries());
    return headers.find((h) => (h[0] === 'content-type'))[1] || 'text/plain';
};

export const extractBody = async (response) => {
    const text = await response.text();
    const contentType = getContentType(response);
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return [JSON.parse(text), response];
    }
    return [text, response];
};

export const handleError = async (response) => {
    const [body] = await extractBody(response);
    throw addContext(new Error(), {
        error: {
            status: response.status,
            ok: response.ok,
            body
        }
    });
};

export default (uri, opts = {}) => fetch(uri, {
    ...opts,
    credentials: 'include'
})
    .then(authenticated)
    .then(extractBody, handleError);
