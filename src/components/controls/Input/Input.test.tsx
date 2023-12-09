import {
  render,
  screen,
} from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  test('basic', async () => {
    render(<Input name="test" />);
    const box = await screen.findByRole('textbox');
    expect(box.classList).toContain('input-container');
    const input = await screen.findByRole('text');
    expect(input.classList).toContain('input');
  });
});
