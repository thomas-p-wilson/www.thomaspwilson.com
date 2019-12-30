export function specificHeat(state) {
	return 4.18; // J/g*C - water
}

export function boilingPoint(state) {
	//ln(P₁/P₂) = -L/R * (1/T₁ - 1/T₂)
	const t1 = 373.15; // *K - boiling point at 1 atm
	const p1 = 14.696; // psi - 1atm
	const L = 40660; // J/mol^-1
	const R = 8.314; // J/(K * mol)
	const p2 = state.pressure;

	// return (L * t1) / (L + (R * t1 * Math.log(p1 / state.pressure)));
	return 1 / ( -((Math.log(p1 / p2) / (-L / R)) - (1 / t1)) );
}

export function storedEnergy(state) {
	return 4.18 * (boilingPoint(state) - state.depleted);
}

export function mass(state) {
	return state.capacity / storedEnergy(state);
}

export function volume(state) {
	return mass(state) / 1000;
}

export function burst(state) {
	return ((mass(state) / 18) * 8.314 * boilingPoint(state)) / (volume(state) * 0.001);
}