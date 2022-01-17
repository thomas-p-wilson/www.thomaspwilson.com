import React from 'react';

export const Input = ({ onChange, ...rest }: React.HTMLAttributes<HTMLInputElement>) => (
  <input onChange={ onChange } { ...rest } />
);
