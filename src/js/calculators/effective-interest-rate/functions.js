import Decimal from 'decimal.js';
import { getPaymentsPerYear, getCompoundsPerYear } from './constants';

// Decimal.set({ precision: 9, rounding: 4 });

export const dec = (val) => (new Decimal(val));
const year = 365;
export const one = dec(1);

// https://www.investopedia.com/terms/p/periodic_interest_rate.asp

/**
 * Determine the effective annual interest rate. The effective annual interest
 * rate is the posted annual rate divided by the compounding frequency, to the
 * power of the compounding frequency. If the compounding frequency is greater
 * than once per year, the effective annual interest rate will be greater than
 * the posted rate.
 * @param {Number} rate - The annual interest rate
 * @param {String} compounding - The id of the interest compounding frequency
 * @return {Decimal} - The effective annual interest rate
 */
export function effective_rate(rate, compounding) {
    if (isNaN(rate)) {
        return;
    }

    // E = (1 + i / n) ^ n - 1
    // where:
    // - E = Effective interest rate
    // - i = Nominal (advertised) interest rate
    // - n = Number of periods
    const compounds = getCompoundsPerYear(compounding);
    return one.add(dec(rate).div(compounds)).pow(compounds).sub(1);   

    // return (dec(rate)).div(compounds).add(1).pow(compounds).sub(1);
}

/**
 * Determine the effective interest rate applied to a periodic payment. If the
 * compounding and payment frequencies are the same, then the periodic rate
 * should be a pure division of the nominal rate.
 * @param {Number} rate - The annual interest rate
 * @param {String} frequency - The id of the payment frequency (e.g. 'weekly')
 * @param {String} compounding - The id of the interest compounding frequency
 * @return {Decimal} - The rate applied during the period
 */
// export function periodic_rate(rate, frequency, compounding) {
export function periodic_rate(effective_rate, frequency) {
    return one.add(effective_rate).pow(one.div(getPaymentsPerYear(frequency))).sub(1);
}
