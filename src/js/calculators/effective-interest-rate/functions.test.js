import Decimal from 'decimal.js';
import { expect } from 'chai';
import pick from 'lodash/pick';
import * as functions from './functions';
import { one, dec } from './functions';
import * as constants from './constants';

// - We calculate the effective rate based on the number of compounding periods
//   in a year
// - We calculate the periodic rate based on the effective rate and the number
//   of payments in a year

// https://www.calculatorsoup.com/calculators/financial/loan-calculator-advanced.php
// Tested based on https://www.investopedia.com/terms/e/effectiveinterest.asp

// Use the same test cases across the board
// NOTE: we have a problem where compounding is more frequent than payment. According to https://financial-calculators.com/loan-calculator, we're off in that case. But every source I've checked says my numbers are correct. Until I verify this, I'm commenting out the tests.
const original_principal = 100000;
const amortization_period = 30;
const test_cases = [
    // nominal | compounding   | effective rate         | frequency     | periodic rate          | pv factor              | payment                | total                  | interest
    [ '.06',     'annually',     '0.06',                  'annually',     '0.06',                 ],
    [ '.06',     'annually',     '0.06',                  'semiannually', '0.0295630140987000316' ],
    [ '.06',     'annually',     '0.06',                  'monthly',      '0.0048675505653430375' ],
    [ '.06',     'semiannually', '0.0609',                'annually',     '0.0609' ],
    [ '.06',     'semiannually', '0.0609',                'semiannually', '0.03' ],
    [ '.06',     'semiannually', '0.0609',                'monthly',      '0.0049386220311969784' ],
    [ '.06',     'monthly',      '0.0616778118644995688', 'annually',     '0.0616778118644995688' ],
    [ '.06',     'monthly',      '0.0616778118644995688', 'semiannually', '0.030377509393765625' ],
    [ '.06',     'monthly',      '0.0616778118644995688', 'monthly',      '0.005' ],
    [ '.1',      'semiannually', '0.1025',                'annually',     '0.1025' ],
    [ '.1',      'monthly',      '0.1047130674412972412', 'annually',     '0.1047130674412972412' ]
]


describe.only('Loan Payment Functions', () => {

    it.each(test_cases)(
        'Produces correct effective rate (%#)',
        (nominal_rate, compounding_frequency, effective_rate) => {
            const result = functions.effective_rate(nominal_rate, compounding_frequency);
            expect(result.toString()).to.equal(effective_rate);
        }
    );

    it.each(test_cases)(
        'Produces correct periodic rate (%#)',
        (nominal_rate, compounding_frequency, effective_rate, frequency, periodic_rate) => {
            const result = functions.periodic_rate(effective_rate, frequency);
            expect(result.toString()).to.equal(periodic_rate);
        }
    );

    it.each(test_cases)(
        'Periodic rate produces effective rate (%#)',
        (nominal_rate, compounding_frequency, effective_rate, frequency, periodic_rate) => {
            const result = one.add(periodic_rate).pow(constants.getPaymentsPerYear(frequency)).sub(1);
            expect(result.toString()).to.equal(effective_rate);
        }
    );

});
