import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';

import CalculatorList from './CalculatorList';

// Conversions
import Length from './calculators/conversion/Length';
import Mass from './calculators/conversion/Mass';

// Finance
import Mortgage from './calculators/finance/Mortgage';
import Retirement from './calculators/finance/Retirement';

// Other
import Telescopy from './calculators/telescopy/Telescopy';
import Photovoltaic from './calculators/renewables/photovoltaic/Photovoltaic';
import ThermalMassStorage from './calculators/renewables/thermal-mass-storage/ThermalMassStorage';

export default ({ match }) => (
	<div id="calculator">
		<Switch>
			<Route path={ match.path } exact component={ CalculatorList } />

			{/* CONVERSIONS */}
			<Route path={ match.path + '/length' } component={ Length } />
			<Route path={ match.path + '/mass' } component={ Mass } />

			{/* FINANCE */}
			<Route path={ match.path + '/finance/mortgage' } component={ Mortgage } />
			<Route path={ match.path + '/finance/retirement' } component={ Retirement } />


			{/* OTHER */}
			<Route path={ match.path + '/telescopy' } component={ Telescopy } />
			<Route path={ match.path + '/photovoltaic' } component={ Photovoltaic } />
			<Route path={ match.path + '/thermal-mass' } component={ ThermalMassStorage } />
		</Switch>
	</div>
);