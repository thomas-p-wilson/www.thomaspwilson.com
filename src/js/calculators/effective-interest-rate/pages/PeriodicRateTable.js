import React from 'react';
import clsx from 'clsx';
import get from 'lodash/get';
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

const get_rate = (rate, payment_id, compounding_id) => {
	const r = periodic_rate(effective_rate(rate, compounding_id), payment_id).mul(100);
	return (
		<abbr title={ r.toString() }>{ r.toFixed(3) }</abbr>
	);
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
			<title>Periodic Interest</title>
			<p>Periodic compounding interest may be determined in a number of different ways. The following table shows the periodic interest rates used to calculate the amount of interest paid in a given period based on the balance of loan.</p>
			<table className="table">
				<thead>
					<tr>
						<th colSpan={ Object.keys(compounding_frequencies).length + 1 }>
							<h3>Periodic Interest Rates</h3>
						</th>
					</tr>
					<tr>
						<th colSpan={ Object.keys(compounding_frequencies).length + 1 }>
							Compounding Frequency Options
						</th>
					</tr>
					<tr>
						<th></th>
						<th></th>
						{
							getCompoundingFrequencyIds().map((id) => (
								<th><abbr title={ getCompoundingFrequencyName(id) }>{ getCompoundingFrequencyAbbr(id) }</abbr></th>
							))
						}
					</tr>
				</thead>
				<tbody>
					{
						getPaymentFrequencyIds().map((payment_id, i) => (
							<tr>
								{ i === 0 ? (<th rowSpan={ getPaymentFrequencyIds().length }><div className="rotate-90">Payment Frequency</div></th>) : undefined }
								<th><abbr title={ getPaymentFrequencyName(payment_id) }>{ getPaymentFrequencyAbbr(payment_id) }</abbr></th>
								{
									getCompoundingFrequencyIds().map((compounding_id) => (
										<td className={ clsx(highlight(data, payment_id, compounding_id)) }>
											{
												get_rate(rate, payment_id, compounding_id)
											}
										</td>
									))
								}
							</tr>
						))
					}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={ Object.keys(compounding_frequencies).length + 1 }>
							Based on { rate }% nominal interest rate.
						</td>
					</tr>
				</tfoot>
			</table>
		</section>
	);
}
