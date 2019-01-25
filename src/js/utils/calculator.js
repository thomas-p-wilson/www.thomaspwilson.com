export const hide = (condition) => ({
    ...(condition ? { className: 'hidden' } : {})
});

export const getRawValue = (state, field, explicit) => {
    return explicit || state[field];
}