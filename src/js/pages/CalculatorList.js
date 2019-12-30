import React from 'react';
import { Link, Switch, Route, NavLink } from 'react-router-dom';
import ProgressiveImage from '../components/ProgressiveImage';

const calculators = {
	'Conversions': [
		{
			title: 'Units of Length',
			path: 'length',
			description: 'Convert between units of length in several systems.',
			image: {
				small: '/assets/img/calculators/length-sm.jpg',
				large: '/assets/img/calculators/length-lg.jpg',
				author: {
					handle: '@sernarial',
					name: 'Patricia Serna'
				}
			}
		},
		{
			title: 'Units of Mass',
			path: 'mass',
			description: 'Convert between units of mass in several systems.',
			image: {
				small: '/assets/img/calculators/mass-sm.jpg',
				large: '/assets/img/calculators/mass-lg.jpg',
				author: {
					handle: '@victorfreitas',
					name: 'Victor Freitas'
				}
			}
		}
	],
	'Finance': [
		{
			title: 'Mortgage',
			path: 'finance/mortgage',
			description: 'Calculate mortgage specifics.',
			image: {
				small: '/assets/img/calculators/mortgage-sm.jpg',
				large: '/assets/img/calculators/mortgage-lg.jpg',
				author: {
					handle: '@f7photo',
					name: 'Michael Longmire'
				}
			}
		},
		{
			title: 'Retirement',
			path: 'finance/retirement',
			description: 'Calculate savings rate and expected retirement date.',
			image: {
				small: '/assets/img/calculators/retirement-sm.jpg',
				large: '/assets/img/calculators/retirement-lg.jpg',
				author: {
					handle: '@aaronburden',
					name: 'Aaron Burden'
				}
			}
		}
	],
	'Other': [
		{
			title: 'Telescopy',
			path: 'telescopy',
			description: 'Telescope design and fabrication parameters.',
			image: {
				small: '/assets/img/calculators/telescope-sm.jpg',
				large: '/assets/img/calculators/telescope-lg.jpg',
				author: {
					handle: '@anniespratt',
					name: 'Annie Spratt'
				}
			}
		},
		{
			title: 'Photovoltaic Bank Sizing',
			path: 'photovoltaic',
			description: 'Determine how many solar panels you need.',
			image: {
				small: '/assets/img/calculators/photovoltaic-sm.jpg',
				large: '/assets/img/calculators/photovoltaic-lg.jpg',
				author: {
					handle: '@nasa',
					name: 'NASA'
				}
			}
		},
		{
			title: 'Thermal Mass Storage',
			path: 'thermal-mass',
			description: 'Discover how much water you need to store energy.',
			image: {
				small: '/assets/img/calculators/thermal-mass-sm.jpg',
				large: '/assets/img/calculators/thermal-mass-lg.jpg',
				author: {
					handle: '@schackowshots',
					name: 'Casey Schackow'
				}
			}
		}
	]
}

export default ({ match }) => (
	<div className="calculators-page">
		<div className="container">
			{
				Object.keys(calculators)
					.reduce((result, category) => (
						result
							.concat(<h2>{ category }</h2>)
							.concat(
								<ul className="calculator-list">
									{
										calculators[category].map((inner) => (
											<li>
										        <ProgressiveImage name={ inner.title }
										                smallSrc={ inner.image.small }
										                largeSrc={ inner.image.large }
										                aspect={ 63 }
										                caption={(
										                	<figcaption>
										                		<a href={ `https://unsplash.com/${ inner.image.author.handle }?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge` }
										                				target="_blank"
										                				rel="noopener noreferrer"
										                				title={ `Image by ${ inner.image.author.name } on Unsplash` }
										                				className="btn btn-circle">
												       				<span style="display:inline-block;padding:2px 3px">
												       					<svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32">
												       						<title>{ `Image by ${ inner.image.author.name } on Unsplash` }</title>
												       						<path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z" />
											       						</svg>
										       						</span>
									       						</a>
										                	</figcaption>
									                	)}
									                	wrapper={ Link }
									                	wrapperProps={{
									                		to: `${ match.path }/${ inner.path }`
									                	}} />
							                	<Link to={ `${ match.path }/${ inner.path }` }>
													<h6>{ inner.title }</h6>
													<small>{ inner.description }</small>
												</Link>
											</li>
										))
									}
								</ul>
							)
					), [])
			}

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