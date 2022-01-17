import { Decimal } from 'decimal.js';

Decimal.set({ precision: 40, rounding: 4, toExpPos: 40, exponential:{lower:1e-100,upper:1e100} });

export { Decimal };
