import { render } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  test('defaults to primary', async () => {
    const { container } = render(<Card />);
    const card = container.getElementsByClassName('card');
    expect(card[0]!.classList).toContain('card');
  });

  test.each`
  classNames
  ${['modal']}
  ${['floating']}
  ${['unpadded']}
  `('adds $classNames to card', ({ classNames }) => {
    const classes = classNames.reduce((acc: any, name: string) => ({ ...acc, [name]: true }), {});
    const { container } = render(<Card {...classes} />);
    const card = container.getElementsByClassName('card');
    expect(classNames.every((c: string) => (card[0]!.classList.contains(c)))).toBe(true);
  });
});
