import BigDecimal from 'decimal.js';

export const decimal = (n: BigDecimal.Value) => (new BigDecimal(n));

export const pi = decimal(Math.PI);
