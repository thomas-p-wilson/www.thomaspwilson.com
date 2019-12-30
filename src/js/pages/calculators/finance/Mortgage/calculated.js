const getTerm = (paymentsInYear) => (i, termLength) => (Math.floor((i - 1) / (termLength * paymentsInYear)) + 1);
const isNewTerm = (paymentsInYear) => (i, termLength) => (((i - 1) / (termLength * paymentsInYear)) % 1 === 0);
const getYear = (paymentsInYear) => (i) => (Math.floor((i - 1) / paymentsInYear) + 1);
const isNewYear = (paymentsInYear) => (i) => (((i - 1) / paymentsInYear) %1 === 0);
const getAmortizationTime = (paymentsInYear) => (payments) => {
	const years = Math.floor(payments / paymentsInYear);
	const remaining = payments - (years * paymentsInYear);
	const months = Math.floor((payments - (years * paymentsInYear)) / (paymentsInYear / 12));
	const weeks = remaining - Math.floor((months * (paymentsInYear / 12)));
	return years + ' Years, ' + months + ' Months, ' + weeks + ' Weeks';
}

export const handlers = {
	/*
	 * An accelerated weekly mortgage payment is when your monthly mortgage
	 * payment is divided by four and the amount is withdrawn from your bank
	 * account every week. With an accelerated weekly mortgage payment, you
	 * still make 52 payments per year but the payment amount is slightly more
	 * than a regular weekly mortgage payment.
	 */
	acceleratedWeekly: {
		title: 'Accelerated Weekly',
		/*
		 * The number of payments made in the amortization period
		 */
		payments: (years) => (years * 52),
		/*
		 * The monthly payment multiplier for calculating non-monthly payment
		 * values.
		 */
		multiplier: .25,
		/*
		 * Determine the term in which the given payment falls
		 */
		getTerm: getTerm(52),
		/*
		 * Determines whether or not the payment is the beginning of a new term
		 */
		isNewTerm: isNewTerm(52),
		getYear: getYear(52),
		isNewYear: isNewYear(52),
		getAmortizationTime: getAmortizationTime(52)
	},
	/*
	 * A weekly mortgage payment is when your monthly mortgage payment is
	 * multiplied by 12 months and divided by the 52 weeks in a year. With a
	 * weekly mortgage payment, you make 52 payments per year.
	 */
	weekly: {
		title: 'Weekly',
		payments: (years) => (years * 52),
		multiplier: 12 / 52,
		getTerm: getTerm(52),
		isNewTerm: isNewTerm(52),
		getYear: getYear(52),
		isNewYear: isNewYear(52),
		getAmortizationTime: getAmortizationTime(52)
	},
	/*
	 * An accelerated bi-weekly mortgage payment is when your monthly mortgage
	 * payment is divided by two and the amount is withdrawn from your bank
	 * account every two weeks. With an accelerated bi-weekly mortgage payment,
	 * you still make 26 payments per year but the payment amount is slightly
	 * more than a regular bi-weekly mortgage payment.
	 */
	acceleratedBiWeekly: {
		title: 'Accelerated Bi-Weekly',
		payments: (years) => (years * 26),
		multiplier: .5,
		getTerm: getTerm(26),
		isNewTerm: isNewTerm(26),
		getYear: getYear(26),
		isNewYear: isNewYear(26),
		getAmortizationTime: getAmortizationTime(26)
	},
	/*
	 * A bi-weekly mortgage payment is when your monthly mortgage payment is
	 * multiplied by 12 months and divided by the 26 pay periods in a year.
	 * With a bi-weekly mortgage payment, you make 26 payments per year.
	 */
	biWeekly: {
		title: 'Bi-Weekly (every two weeks)',
		payments: (years) => (years * 26),
		multiplier: 12 / 26,
		getTerm: getTerm(26),
		isNewTerm: isNewTerm(26),
		getYear: getYear(26),
		isNewYear: isNewYear(26),
		getAmortizationTime: getAmortizationTime(26)
	},
	semiMonthly: {
		title: 'Semi-Monthly (2x per month)',
		payments: (years) => (years * 24),
		multiplier: .5,
		getTerm: getTerm(24),
		isNewTerm: isNewTerm(24),
		getYear: getYear(24),
		isNewYear: isNewYear(24),
		getAmortizationTime: getAmortizationTime(24)
	},
	/*
	 * A monthly mortgage payment is when your mortgage payment is withdrawn
	 * from your bank account on the same day of every month (e.g. on the 1st).
	 * With a monthly mortgage payment, you make 12 payments per year.
	 */
	monthly: {
		title: 'Monthly (12x per year)',
		payments: (years) => (years * 12),
		multiplier: 1,
		getTerm: getTerm(12),
		isNewTerm: isNewTerm(12),
		getYear: getYear(12),
		isNewYear: isNewYear(12),
		getAmortizationTime: getAmortizationTime(12)
	}
}

export function downpaymentPercentage({ total, downpayment }) {
	return downpayment / total;
}

export function mortgageAmount({ total, downpayment }) {
	return total - downpayment;
}

export function freq({ frequency }) {
	if (frequency === 'semiMonthly') {
		return 24;
	}
	if (frequency === 'biWeekly') {
		return 26;
	}
	if (frequency === 'weekly') {
		return 52;
	}
	return 12;
}

export function rateForTerm(terms, term) {
	let i = term;
	do {
		if (terms[i] && terms[i].interest) {
			return terms[i].interest;
		}
		i--;
	} while (i >= 0);
}

/**
 *
 */
export function schedule(total, downpayment, period, terms, termLength) {
	const originalPrincipal = mortgageAmount({ total, downpayment }); // e.g. 350000

	return Object.keys(handlers)
		.reduce((result, key) => {
			result[key] = calculateSchedule(terms, originalPrincipal, period, termLength, key);
			return result;
		}, {})
}

/**
 * Calculates the payment schedule for a mortgage.
 * @param {Number} terms - The schedule of term interest rates
 * @param {Number} principal - The original principal of the mortgage
 * @param {Number} period - The amortization period, years
 * @param {Number} multiplier - When calculating non-monthly payments, this is
 *         the amount to multiply the monthly payment by
 * @param {Function} callback - A callback to execute for every record
 * @returns {Array} - A list of payment schedule records
 */
export function calculateSchedule(terms, balance, period, termLength, frequency) {
	// Calculate monthly payment info first. This gets divided down later on
	// when working out non-monthly payments. DO NOT CHANGE
	const monthlyPayments = period * 12;
	const multiplier = handlers[frequency].multiplier;


	const result = {
		cost: 0,
		interest: 0,
		principal: 0,
		amortization: 0,
		terms: {},
		schedule: []
	}

	// Let's figure out the basic info for each term (payment amount, etc)
	terms.forEach((term, i) => {
		if (!term) {
			result.terms[i] = result.terms[i - 1];
			return;
		}

		const r = term.interest / 12;
		const part = Math.pow(1 + r, monthlyPayments);
		const amount = (balance * ((r * part) / (part - 1))) * multiplier;

		result.terms[i] = {
			amount,
			rate: term.interest,
			interest: 0,
			principal: 0
		}
	})



	let last = {
		rate: 0,
		amount: 0,
		interest: 0,
		principal: 0,
		balance
	}
	result.schedule.push[last];

	let lastTermInfo = result.terms[0];
	let i = 0;
	while (last.balance > 0) {
		const term = handlers[frequency].getTerm(i + 1, termLength);
		if (!result.terms[term - 1]) {
			result.terms[term - 1] = { ...lastTermInfo };
		}
		const lastTermInfo = result.terms[term - 1];
		const { amount: monthlyPaymentAmount, rate } = lastTermInfo;
		const r = rate / 12;
		const interest = (last.balance * r) * multiplier;
		const amount = Math.min(monthlyPaymentAmount, interest + last.balance);
		const principal = amount - interest;
		const newBalance = last.balance - principal;

		last = {
			rate,
			amount,
			interest,
			principal,
			balance: newBalance
		};
		result.cost += amount;
		result.interest += interest;
		result.principal += principal;
		lastTermInfo.interest += interest;
		lastTermInfo.principal += principal;
		result.schedule.push(last);
		i++;
	}

	// Calculate adjusted amortization period
	result.amortization = handlers[frequency].getAmortizationTime(result.schedule.length - 1);

	return result;
}