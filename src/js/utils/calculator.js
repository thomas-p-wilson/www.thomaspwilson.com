// import { get } from 'lodash/es6';

export const hide = (condition) => ({
    ...(condition ? { className: 'hidden' } : {})
});

export const getRawValue = (state, field, explicit, defaultValue) => {
    console.log('Field: ', field);
    return explicit || state[field] || defaultValue;
}