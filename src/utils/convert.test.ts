import * as length from '../units/length';
import * as energy from '../units/energy';
import { convert } from './convert';
import { decimal } from './decimal';

describe('convert', () => {
  test('m > cm', () => {
    const result = convert(length.measure, decimal(5), decimal(1), 'metric-metre', 'metric-centimetre');
    expect(result.toNumber()).toEqual(500);
  });

  test('cm > m', () => {
    const result = convert(length.measure, decimal(5), decimal(1), 'metric-centimetre', 'metric-metre');
    expect(result.toNumber()).toEqual(0.05);
  });

  test('m^2 to cm^2', () => {
    const result = convert(length.measure, decimal(5), decimal(2), 'metric-metre', 'metric-centimetre');
    expect(result.toNumber()).toEqual(50000);
  });

  test('cm^2 to m^2', () => {
    const result = convert(length.measure, decimal(5), decimal(2), 'metric-centimetre', 'metric-metre');
    expect(result.toNumber()).toEqual(.0005);
  });

  test('J/m^2 to W/m^2', () => {
    let result = decimal(5);
    result = convert(energy.measure, result, decimal(2), 'metric-joule', 'metric-watt');
    expect(result.toNumber()).toEqual(5);
  });

  test('J/m^2 to J/cm^2', () => {
    let result = decimal(5);
    result = convert(length.measure, result, decimal(2), 'metric-metre', 'metric-centimetre', true);
    expect(result.toNumber()).toEqual(.0005);
  });
});
