import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import { units } from '../../converter';
import { getPaymentFrequencyOptions, getCompoundingFrequencyOptions } from './constants';

export default new Calculator({
    slug: 'loan-payment',
    title: 'Loan Payment'
}, [
    {
        id: 'principal',
        title: 'Principal',
        suffix: '$'
    },
    {
        id: 'rate',
        title: 'Rate',
        suffix: '%'
    },
    {
        id: 'amortization_period',
        title: 'Amortization Period',
        suffix: 'years'
    },
    {
        id: 'frequency',
        title: 'Frequency',
        options: getPaymentFrequencyOptions(),
        default: 'monthly'
    },
    {
        id: 'payments',
        title: 'Number of Payments',
        readonly: true,
        calculate: all(
            ['amortization_period', 'frequency'],
            functions.payments
        )
    },
    {
        id: 'compounding',
        title: 'Compounding',
        options: getCompoundingFrequencyOptions(),
    },
    {
        id: 'effective_rate',
        title: 'Effective Rate',
        readonly: true,
        calculate: all(
            ['rate', 'compounding'],
            functions.effective_rate
        )
    },
    {
        id: 'periodic_rate',
        title: 'Periodic Rate',
        suffix: '%',
        readonly: true,
        calculate: all(
            // ['rate', 'frequency', 'compounding'],
            ['effective_rate', 'frequency', 'amortization_period'],
            functions.periodic_rate
        )
    },
    {
        id: 'pv_factor',
        title: 'PV Factor',
        readonly: true,
        calculate: all(
            // ['principal', 'rate', 'amortization_period', 'frequency', 'compounding'],
            ['periodic_rate', 'amortization_period', 'frequency'],
            functions.pv_factor
        )
    },
    {
        id: 'payment',
        title: 'Payment',
        suffix: '$',
        readonly: true,
        calculate: all(
            // ['principal', 'rate', 'amortization_period', 'frequency', 'compounding'],
            ['principal', 'periodic_rate', 'amortization_period', 'frequency'],
            functions.payment
        )
    },
    {
        id: 'total',
        title: 'Total Payment',
        suffix: '$',
        readonly: true,
        calculate: all(
            ['frequency', 'amortization_period', 'payment'],
            functions.total
        )
    },
    {
        id: 'interest',
        title: 'Total Interest',
        suffix: '$',
        readonly: true,
        calculate: all(
            ['principal', 'rate', 'amortization_period', 'compounding'],
            functions.interest
        )
    },
    {
        id: 'payments',
        title: 'Payments',
        readonly: true,
        calculate: all(
            ['amortization_period', 'frequency'],
            functions.payments
        )
    },
    // {
    //     id: 'schedule',
    //     title: 'Schedule',
    //     readonly: true,
    //     calculate: all(
    //         ['principal', 'rate', 'amortization_period', 'frequency', 'compounding'],
    //         functions.schedule
    //     )
    // }
]);
