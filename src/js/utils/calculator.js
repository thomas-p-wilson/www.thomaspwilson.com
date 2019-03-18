import get from 'lodash/get';

export const hide = (condition) => ({
    ...(condition ? { className: 'hidden' } : {})
});

export const getRawValue = (state, field, explicit, defaultValue) => {
    return explicit || get(state, field) || defaultValue;
}