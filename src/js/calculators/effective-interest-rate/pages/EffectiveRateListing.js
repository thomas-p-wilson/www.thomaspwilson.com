import React from 'react';
import clsx from 'clsx';
import get from 'lodash/get';
import MathJax from 'react-mathjax-preview';
import {
	compounding_frequencies,
	getCompoundingFrequencyIds,
	getCompoundingFrequencyOptions,
	getCompoundingFrequencyName,
	getCompoundingFrequencyAbbr,
	payment_frequencies,
	getPaymentFrequencyIds,
	getPaymentFrequencyOptions,
	getPaymentFrequencyName,
	getPaymentFrequencyAbbr
} from '../constants';
import { effective_rate, periodic_rate } from '../functions';

const get_rate = (rate, compounding_id) => {
	const r = effective_rate(rate, compounding_id);
	return r.toFixed(4);
}

const highlight = (data, payment_id, compounding_id) => {
	const is_payment = get(data, 'effective-interest-rate.frequency') === payment_id;
	const is_compounding = get(data, 'effective-interest-rate.compounding') === compounding_id;
	return {
		highlight: is_payment && is_compounding,
		'highlight-mute': is_payment || is_compounding
	};
}

export default ({ data }) => {
	const rate = isNaN((data['effective-interest-rate'] || {}).nominal) ? .05 : (data['effective-interest-rate'] || {}).nominal;

	return (
		<section>
			<title>Effective Annual Rate</title>
			<p>The <em>Effective Annual Rate</em> is the interest rate that applies after compounding is taken into effect.</p>
			<MathJax math={ String.raw`
			$$
			R_e = (1 + \dfrac{R_a}{n}) ^ n - 1
			$$
			` } />

			<table>
				<tbody>
					{
						getCompoundingFrequencyIds().map((id) => (
							<tr>
								<td>{ getCompoundingFrequencyName(id) }</td>
								<td>{ get_rate(rate, id) }</td>
							</tr>
						))
					}	
				</tbody>
			</table>
		</section>
	);
}
