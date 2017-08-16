import React from 'react';
import ReactDOM from 'react-dom';
import CalculatorSwitcher from './calculators/CalculatorSwitcher';

import telescopyCalculator from './calculators/definitions/telescopy';
import greenCalculator from './calculators/definitions/green-energy';





// render an instance of Clock into <body>:
ReactDOM.render(<CalculatorSwitcher calculators={[telescopyCalculator, greenCalculator]} />, document.getElementById('calculators'));