import React from 'react';
import './input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
}

/**
 * An interactive control that accepts data, typically textual or numeric, from
 * the user.
 */
export const Input = ({
  ...props
}: InputProps) => (
  <input type="text" className="input" autoComplete="off" {...props} />
);
