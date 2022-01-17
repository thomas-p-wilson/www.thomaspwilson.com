import React from 'react';

export const Textarea = ({ onChange, ...rest }: React.HTMLAttributes<HTMLTextAreaElement>) => (
  <textarea onChange={ onChange } { ...rest } />
);
