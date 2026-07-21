import React, { useContext } from 'react';
import SimpleCalculator from '../../components/redone/SimpleCalculator';
import calculator from './definition';
import {
	compounding_frequencies,
	getCompoundingFrequencyIds,
	getCompoundingFrequencyOptions,
	getCompoundingFrequencyName,
	payment_frequencies,
	getPaymentFrequencyIds,
	getPaymentFrequencyOptions,
	getPaymentFrequencyName
} from './constants';
import { periodic_rate } from './functions';
import { DataContext } from '../helpers';

const get_rate = (rate, payment_id, compounding_id) => {
	try {
		return periodic_rate(rate, payment_id, compounding_id).mul(100).toFixed(3);
	} catch (err) {
		console.log(err);
	}
}

export default () => {
	const { data = {} } = useContext(DataContext);
	const rate = isNaN((data['loan-payment'] || {}).rate) ? .05 : (data['loan-payment'] || {}).rate;

	return (
		<div className="calculator calc-circle-area">
			<div className="calc-column">
				<SimpleCalculator calculator={ calculator } />
			</div>
			<div className="desc-column">
				<section>
					yo yo yo
				</section>
				<section>
					<title>Periodic Interest</title>
					<p>Periodic compounding interest may be determined in a number of different ways. The following table shows the periodic interest rates used to calculate the amount of interest paid in a given period based on the balance of loan.</p>
					<table>
						<thead>
							<tr>
								<th colSpan={ Object.keys(compounding_frequencies).length + 1 }>
									Compounding Frequency Options
								</th>
							</tr>
							<tr>
								<th></th>
								{
									getCompoundingFrequencyIds().map((id) => (
										<th>{ getCompoundingFrequencyName(id) }</th>
									))
								}
							</tr>
						</thead>
						<tbody>
							{
								getPaymentFrequencyIds().map((payment_id) => (
									<tr>
										<th>{ getPaymentFrequencyName(payment_id) }</th>
										{
											getCompoundingFrequencyIds().map((compounding_id) => (
												<td>
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
			</div>
		</div>
	);
}
