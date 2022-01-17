import get from 'lodash/get';

export const hide = (condition) => ({
    ...(condition ? { className: 'hidden' } : {})
});
