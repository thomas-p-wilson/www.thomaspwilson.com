import { convert } from './convert';
import * as numbers from '../utils/number';

describe('Conversion', () => {
  let normalizeValue;
  beforeEach(() => {
    normalizeValue = jest.spyOn(numbers, 'normalizeValue');
  })
  it('Fails if invalid source unit given', () => {
    expect(() => {
      convert(1, 'invalid', 'm');
    }).toThrow('Unrecognized unit invalid');
  });
  it('Fails if invalid target unit given', () => {
    expect(() => {
      convert(1, 'km', 'invalid');
    }).toThrow('Unrecognized unit invalid');
  });
  it('Short-circuits on identical units', () => {
    expect(convert(1, 'km', 'km').valueOf()).toEqual('1');
    expect(normalizeValue).not.toHaveBeenCalled();
  });
  it('Convert to base', () => {
    expect(convert(1, 'km', 'm').valueOf()).toEqual('1000');
  });
  it('Convert from base', () => {
    expect(convert(1, 'm', 'cm').valueOf()).toEqual('100');
  });
  it('Convert from non-base to non-base', () => {
    expect(convert(1, 'km', 'cm').valueOf()).toEqual('100000');
  });
  it('Convert exponents', () => {
    expect(convert(50, 'cm', 'mm', 2).toSignificantDigits(30).valueOf()).toEqual('5000');
  })
});
