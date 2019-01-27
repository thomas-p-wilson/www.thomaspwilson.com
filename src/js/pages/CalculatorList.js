import React from 'react';
import { Link, Switch, Route, NavLink } from 'react-router-dom';

export default ({ match }) => (
	<div className="calculators-page">
		<div className="container">
			<h2>Conversions</h2>
			<ul className="calculator-list">
				<li><Link to={ `${ match.path }/length` }>Length <small>Convert between units of length in several systems</small></Link></li>
			</ul>

			<h2>Other</h2>
			<ul className="calculator-list">
				<li><Link to={ `${ match.path }/telescopy` }>Telescopy <small>Telescope design and fabrication parameters</small></Link></li>
				<li><Link to={ `${ match.path }/photovoltaic-sizing` }>Photovoltaic Bank Sizing <small>Determine how many solar panels you need</small></Link></li>
				<li><Link to={ `${ match.path }/thermal-mass-storage` }>Thermal Mass Storage <small>Discover how much water you need to store energy</small></Link></li>
			</ul>

			<p>This list is really small at the moment. But I have plans! Maybe it'll take a day. Maybe it'll take a year. But I have plans:</p>
			<ul>
				<li>Unit of measure conversions</li>
				<li>Financial calculators</li>
				<li>Physics calculators</li>
				<li>Chemistry calculators</li>
				<li>Other categories</li>
				<li>Visualizations</li>
				<li>Detailed explanations of how the calculations work</li>
				<li>Android + iOS applications</li>
			</ul>
        </div>
	</div>
);