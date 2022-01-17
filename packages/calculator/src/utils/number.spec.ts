// @ts-nocheck

import { isValidNumber, normalizeValue } from './number';

describe('Utilities', () => {
  it('isValidNumber', () => {
    expect(isValidNumber(undefined)).toBe(false);
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber('true')).toBe(false);
    expect(isValidNumber('false')).toBe(false);
    expect(isValidNumber(true)).toBe(false);
    expect(isValidNumber(false)).toBe(false);
    expect(isValidNumber('10')).toBe(true);
    expect(isValidNumber('-10')).toBe(true);
    expect(isValidNumber('10.01')).toBe(true);
    expect(isValidNumber('-10.01')).toBe(true);
    expect(isValidNumber('.01')).toBe(true);
    expect(isValidNumber('10.')).toBe(true);
    expect(isValidNumber('10.0')).toBe(true);
    expect(isValidNumber('0.01')).toBe(true);
    expect(isValidNumber('10.a')).toBe(false);
    expect(isValidNumber('a.01')).toBe(false);
    expect(isValidNumber('a01')).toBe(false);
    expect(isValidNumber('01a')).toBe(false);
  });

  it('normalizeValue', () => {
    expect(normalizeValue(undefined).valueOf()).toEqual('0');
    expect(normalizeValue(null).valueOf()).toEqual('0');
    expect(normalizeValue('true').valueOf()).toEqual('0');
    expect(normalizeValue('false').valueOf()).toEqual('0');
    expect(normalizeValue(true).valueOf()).toEqual('0');
    expect(normalizeValue(false).valueOf()).toEqual('0');
    expect(normalizeValue('10').valueOf()).toEqual('10');
    expect(normalizeValue('-10').valueOf()).toEqual('-10');
    expect(normalizeValue('10.01').valueOf()).toEqual('10.01');
    expect(normalizeValue('-10.01').valueOf()).toEqual('-10.01');
    expect(normalizeValue('.01').valueOf()).toEqual('0.01');
    expect(normalizeValue('10.').valueOf()).toEqual('10');
    expect(normalizeValue('10.0').valueOf()).toEqual('10');
    expect(normalizeValue('0.01').valueOf()).toEqual('0.01');
    expect(normalizeValue('10.a').valueOf()).toEqual('0');
    expect(normalizeValue('a.01').valueOf()).toEqual('0');
    expect(normalizeValue('a01').valueOf()).toEqual('0');
    expect(normalizeValue('01a').valueOf()).toEqual('0');
  });
});
