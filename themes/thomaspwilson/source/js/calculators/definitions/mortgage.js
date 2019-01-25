import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Calculator from '../Calculator';

const G = 9.80665; // m/s^2

export default new Calculator({
    'title': 'Mortgage',
    'slug': 'mortgage',
    'description': 'General mortgage calculations.',
    'default': {
        'principal': 300000,
        'interest': 0.0267,
        'period': 25,
        'frequency': 26
    },
    'compute': {
        'periodic_payments': function() {
            return this.frequency * this.period;
        },
        'periodic_interest': function() {
            return this.interest / this.frequency;
        },
        'discount_factor': function() {
            let i = this.periodic_interest;
            let n = this.periodic_payments;
            return (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
            // {[(1 + i) ^n] - 1} / [i(1 + i)^n]


            // return (Math.pow(1 + this.periodic_interest, this.periodic_payments) - 1) / Math.pow(this.periodic_interest * (1 + this.periodic_interest), this.periodic_payments);
        },
        'payment': function() {
            return this.principal / this.discount_factor;
        }
    },
    'watch': {},
    'sections': [{
        'title': 'Basic',
        'fields': ['principal', 'interest', 'period', 'frequency', 'periodic_payments', 'periodic_interest', 'discount_factor', 'payment']
    }],
    'fields': {
        'principal': {
            'title': 'Original Amount',
            'addon': '$',
            'info': 'The original amount of the mortgage.'
        },
        'interest': {
            'title': 'Annual Interest Rate',
            'addon': '%',
            'info': 'The annual interest rate, expressed as a real number (e.g. 5.25)'
        },
        'period': {
            'title': 'Payment Period',
            'addon': 'year(s)',
            'info': 'The duration of the mortgage, in years'
        },
        'frequency': {
            'title': 'Payment Frequency',
            'addon': '/yr',
            'info': 'The number of payments made per year. 12 - monthly, 26 - bi-weekly, 52 - weekly'
        },
        'periodic_payments': {
            'title': 'Periodic Payments',
            'info': 'The total number of payments made during the life of the mortgage',
            'output': true
        },
        'periodic_interest': {
            'title': 'Periodic Interest'
        },
        'discount_factor': {
            'title': 'Discount Factor'
        },
        'payment': {
            'title': 'Payment Value',
            'addon': '$',
            'info': 'The dollar value of each payment',
            'output': true
        }
    }
});