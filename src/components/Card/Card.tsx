import clsx from 'clsx';
import React from 'react';
import './card.scss';

export type CardProps = React.ComponentPropsWithoutRef<'div'> & {
  modal?: boolean
  floating?: boolean
  unpadded?: boolean
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  modal,
  floating,
  unpadded,
  ...props
}: CardProps, ref?) => (
  <div
    className={clsx('card', className, {
      modal,
      floating,
      unpadded,
    })}
    {...props}
    ref={ref}
  />
));

Card.displayName = 'Card';
