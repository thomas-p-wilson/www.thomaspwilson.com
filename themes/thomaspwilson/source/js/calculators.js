import React from 'react';
import ReactDOM from 'react-dom';
import CalculatorPage from './calculators/CalculatorPage';

import telescopyCalculator from './calculators/definitions/telescopy';
import greenCalculator from './calculators/definitions/green-energy';
import mortgageCalculator from './calculators/definitions/mortgage';





// render an instance of Clock into <body>:
ReactDOM.render(<CalculatorPage calculators={[telescopyCalculator, greenCalculator, mortgageCalculator]} />, document.getElementById('calculators'));