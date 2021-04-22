export const functionOrValue = (o, ...args) => {
    if (typeof o === 'function') {
        return o(...args);
    }
    return o;
}