//~~~~
// Payment Frequencies
//~~~~
export const payment_frequencies = {
	// Title, Payments Per Year
	annually: ['Yearly', 'Yearly', 1],
	semiannually: ['Semi-Annually', 'S.A.', 2],
	quarterly: ['Quarterly', 'Qr.', 4],
	monthly: ['Monthly', 'Mth.', 12],
	semimonthly: ['Semi-Monthly', 'S.M.', 24],
	biweekly: ['Bi-Weekly', 'Bi.W.', 26],
	weekly: ['Weekly', 'Wkly', 52],
	daily: ['Daily', 'Daily', 365] // TODO We should really calculate exactly how many days in the year
}

export const getPaymentFrequencyIds = () => (Object.keys(payment_frequencies));

export const getPaymentFrequencyOptions = () => (
	getPaymentFrequencyIds()
		.reduce((result, id) => {
			result[id] = `${ getPaymentFrequencyName(id) } (${ getPaymentsPerYear(id) })`;
			return result;
		}, {})
)

export const getPaymentFrequencyName = (id) => (payment_frequencies[id][0]);

export const getPaymentFrequencyAbbr = (id) => (payment_frequencies[id][1]);

export const getPaymentsPerYear = (id) => (payment_frequencies[id][2]);

//~~~~
// Compounding Frequencies
//~~~~
export const compounding_frequencies = {
	// Title, Payments Per Year
	annually: ['Yearly', 'Yearly', 1],
	semiannually: ['Semi-Annually', 'S.A.', 2],
	quarterly: ['Quarterly', 'Qr.', 4],
	monthly: ['Monthly', 'Mth.', 12],
	semimonthly: ['Semi-Monthly', 'S.M.', 24],
	biweekly: ['Bi-Weekly', 'Bi.W.', 26],
	weekly: ['Weekly', 'Wkly', 52],
	threesixty: ['360', '360', 360],
	daily: ['Daily', 'Daily', 365] // TODO We should really calculate exactly how many days in the year,
}

export const getCompoundingFrequencyIds = () => (Object.keys(compounding_frequencies));

export const getCompoundingFrequencyOptions = () => (
	getCompoundingFrequencyIds()
		.reduce((result, id) => {
			result[id] = `${ getCompoundingFrequencyName(id) } (${ getCompoundsPerYear(id) } / year)`;
			return result;
		}, {})
)

export const getCompoundingFrequencyName = (id) => (compounding_frequencies[id][0]);

export const getCompoundingFrequencyAbbr = (id) => (compounding_frequencies[id][1]);

export const getCompoundsPerYear = (id) => (compounding_frequencies[id][2]);