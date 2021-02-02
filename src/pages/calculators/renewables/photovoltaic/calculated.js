export function demandPerLightHour(state) {
	return state.dailyDemand / state.dailyLightHours;
}

export function panelRealRating(state) {
	return state.panelRating * state.panelEfficiencyModifier;
}

export function panelCostPerWatt(state) {
	return state.panelCost / panelRealRating(state);
}

export function panelsRequired(state) {
	return Math.ceil(demandPerLightHour(state) / panelRealRating(state));
}

export function panelTotalCost(state) {
	return panelsRequired(state) * state.panelCost;
}