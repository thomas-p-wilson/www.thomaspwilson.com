import React from 'react';
import MathJax from 'react-mathjax-preview';

export default ({ children }) => (
    <MathJax math={ children } />
);
