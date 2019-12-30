let calculators = {};

export function getCalculators() {
    return calculators;
}
global.getCalculators = getCalculators

export async function fetchCalculator(request) {
    if (!request || !request.params || !request.params.calculator) {
        return Promise.reject('Need the calculator parameter');
    }
    const module = await import(`../calculators/${ request.params.calculator }/Calculator.js`);
    Object.assign(calculators, { [`${ request.params.calculator }`]: module });
    return request.params.calculator;
}
