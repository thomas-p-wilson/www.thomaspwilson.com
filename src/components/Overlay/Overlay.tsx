import clsx from 'clsx';
import React from 'react';
import './Overlay.scss';

export type OverlayProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Overlay = ({ className, ...props }: OverlayProps) => (
  <div className={clsx('overlay', className)} {...props} />
);
