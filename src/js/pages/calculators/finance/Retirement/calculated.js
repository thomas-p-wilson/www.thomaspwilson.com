import memoize from 'lodash/memoize';

export function yearsUntilDeath(state) {
	return Math.floor(82.3 - state.age);
}

export function savingsRateNumeric(state) {
	return state.net - state.expenses;
}

export function savingsRatePercent(state) {
	return savingsRateNumeric(state) / state.net;
}

let lastKey = null;
let lastValue = null;
export function chartData(state) {
    const key = JSON.stringify(arguments);
    if (lastKey === key && lastValue) {
      	return lastValue;
 	}
 	lastKey = key;

 	// These get adjusted for inflation on every iteration
 	let net = Number(state.net);
 	let expenses = Number(state.expenses);
 	let retired = false;
 	let retiredNoInflation = false;

 	const netMatchInflation = Boolean(state.netMatchInflation);
 	const expensesMatchInflation = Boolean(state.expensesMatchInflation);
 	const interest = Number(state.interest);
 	const inflation = Number(state.inflation);
 	const safety = Number(state.safety) || 0;
 	const fv = expenses / interest;

 	const result = {
 		unspent: [state.savings || 0],
 		retirement: [state.savings || 0],
 		retirementNoInflation: [state.savings || 0],
 		retirementYear: null,
 		retirementNoInflationYear: null
 	};

    for (let i = 0; i < yearsUntilDeath(state); i++) {
    	let noInflationSpent = (result.retirementNoInflation[i] + (net - expenses)) * (1 + interest);
    	if (retiredNoInflation || ((result.retirementNoInflation[i] * interest - state.expenses) / result.retirementNoInflation[i] >= inflation + safety)) {
    		retiredNoInflation = true;
    		result.retirementNoInflationYear = result.retirementNoInflationYear || i;
    		noInflationSpent = result.retirementNoInflation[i] + (result.retirementNoInflation[i] * interest - state.expenses);
    	}

    	net = (netMatchInflation ? net * (1 + inflation) : net);
    	expenses = (expensesMatchInflation ? expenses * (1 + inflation) : expenses);
 		const savingsRate = (net - expenses);

    	// Calculate the earnings based on a savings-rate deposit, and interest
    	const unspent = (Number(result.unspent[i]) + savingsRate) * (1 + interest);
    	let spent = unspent;
    	const retirementInterest = result.retirement[i] * interest;
    	const increase = (retirementInterest - expenses) / retirementInterest;

    	if (retired || (retirementInterest - expenses) / result.retirement[i] >= inflation + safety) {
    		retired = true;
    		result.retirementYear = result.retirementYear || i;
    		spent = result.retirement[i] + (retirementInterest - expenses);
    	}
    	result.unspent.push(unspent);
    	result.retirement.push(spent);
    	result.retirementNoInflation.push(noInflationSpent);
    }

    result.unspent = result.unspent.map((n) => (Number(n).toFixed(2)));
    result.retirement = result.retirement.map((n) => (Number(n).toFixed(2)));
    result.retirementNoInflation = result.retirementNoInflation.map((n) => (Number(n).toFixed(2)));
    return lastValue = result;
}
