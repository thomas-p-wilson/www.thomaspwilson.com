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
 * Determine the effective interest rate applied to a periodic payment.
 * @param {Number} rate - The annual interest rate
 * @param {String} frequency - The id of the payment frequency (e.g. 'weekly')
 * @param {String} compounding - The id of the interest compounding frequency
 * @return {Decimal} - The rate applied during the period
 */
// export function periodic_rate(rate, frequency, compounding) {
export function periodic_rate(effective_rate, frequency) {
    return one.add(effective_rate).pow(one.div(getPaymentsPerYear(frequency))).sub(1);
}

/**
 * Determine the number of payments to be made over the amortization lifetime of
 * the loan, foregoing any adjustments, pre-payments, etc.
 * @param {Number} amortization_period - The amortization period of the loan
 * @param {String} frequency - The id of the payment frequency (e.g. 'weekly')
 * @return {Number} - The number of payments to be made
 */
export function payments(amortization_period, frequency) {
    return getPaymentsPerYear(frequency) * amortization_period;
}

export function pv_factor(periodic_rate, amortization_period, frequency) {
    return one.add(periodic_rate).pow(amortization_period * getPaymentsPerYear(frequency)).sub(1);
}

export function payment(principal, periodic_rate, amortization_period, frequency) {
    const payments_per_year = getPaymentsPerYear(frequency);
    const num_payments = amortization_period * payments_per_year;
    const pv_factor = one.add(periodic_rate).pow(num_payments);

    // debug && console.log('Number of payments: ', num_payments);
    // const result = dec(principal).mul(pv_factor).mul(periodic_rate).div(pv_factor.sub(1));
    // return result;


    // F_p = (1 + .005)^360
    // D = (F_p - 1) / (.005 * F_p)
    // P = A / D
    // debug && console.log('PV Factor: ', pv_factor);
    // const d = pv_factor.sub(1).div(pv_factor.mul(periodic_rate))
    // debug && console.log('D: ', d);
    // return dec(principal).div(d);


    // c = (P * r) / (1 - 1 / (1 + r) ^ n)
    // where
    // c = monthly payment
    // P = principal
    // r = monthly interest rate
    // n = number of payment periods
    return dec(principal).mul(periodic_rate).div(one.sub(one.div(pv_factor)));
}

export function total(frequency, amortization_period, payment) {
    const num_payments = getPaymentsPerYear(frequency) * amortization_period;
    console.log('Num payments: ', num_payments);
    return dec(payment).mul(num_payments);
}

export function interest(principal, periodic_rate, amortization_period, frequency) {
    // A = P (1 + r/n)^nt
    // where
    // - A = the future value of the investment/loan, including interest
    // - P = the principal investment amount (the initial deposit or loan amount)
    // - r = the interest rate per unit t
    // - n = the number of times that interest is compounded per unit t
    // - t = the time the money is invested or borrowed for
    const freq = getPaymentsPerYear(frequency);
    const num_payments = amortization_period * freq;
    const pv_factor = one.add(periodic_rate).pow(num_payments);
    return dec(principal).mul(pv_factor).sub(principal);
}


// export function schedule(principal, rate, amortization_period, frequency, compounding) {
//     const payments_per_year = getPaymentsPerYear(frequency);
//     const compounding_per_year = getPaymentsPerYear(compounding);

//     return (rate / payments_per_year) * principal;
// }