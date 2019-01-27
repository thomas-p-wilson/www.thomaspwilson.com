import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';

import CalculatorList from './CalculatorList';

// Conversions
import Length from './calculators/conversion/Length';

// Other
import Telescopy from './calculators/telescopy/Telescopy';
import Photovoltaic from './calculators/renewables/photovoltaic/Photovoltaic';
import ThermalMassStorage from './calculators/renewables/thermal-mass-storage/ThermalMassStorage';

export default ({ match }) => (
	<div className="calculators-page">
		<div className="container">
	        <Switch>
	        	<Route path={ match.path } exact component={ CalculatorList } />

	        	{/* CONVERSIONS */}
	        	<Route path={ match.path + '/length' } component={ Length } />


	        	{/* OTHER */}
	        	<Route path={ match.path + '/telescopy' } component={ Telescopy } />
	        	<Route path={ match.path + '/photovoltaic-sizing' } component={ Photovoltaic } />
	        	<Route path={ match.path + '/thermal-mass-storage' } component={ ThermalMassStorage } />
	        </Switch>
        </div>
	</div>
);