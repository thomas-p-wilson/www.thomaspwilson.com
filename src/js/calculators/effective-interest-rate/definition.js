import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import { units } from '../../converter';
import { getPaymentFrequencyOptions, getCompoundingFrequencyOptions } from './constants';

export default new Calculator({
    slug: 'effective-interest-rate',
    title: 'Effective Interest Rate'
}, [
    {
        id: 'nominal',
        title: 'Nominal Rate',
        suffix: '%'
    },
    {
        id: 'compounding',
        title: 'Compounding',
        options: getCompoundingFrequencyOptions(),
    },
    {
        id: 'effective',
        title: 'Effective Rate',
        readonly: true,
        calculate: all(
            ['nominal', 'compounding'],
            functions.effective_rate
        )
    },
    {
        id: 'frequency',
        title: 'Frequency',
        options: getPaymentFrequencyOptions(),
        default: 'monthly'
    },
    {
        id: 'periodic',
        title: 'Periodic Rate',
        suffix: '%',
        readonly: true,
        calculate: all(
            ['effective', 'frequency'],
            functions.periodic_rate
        )
    }
]);
