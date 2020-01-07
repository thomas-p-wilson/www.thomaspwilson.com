import materials from '../../measures/other/materials';

const clean = (fn) => (...args) => {
	const result = fn(...args);
	if (!isNaN(result)) {
		return result;
	}
}

export const specificHeat = clean((material) => {
	const result = materials.find((m) => (m[0] === material));
	if (result) {
		return result[1];
	}
});

export const boilingPoint = clean((material, pressure) => {
	//ln(P₁/P₂) = -L/R * (1/T₁ - 1/T₂)
	// T₁ - Known boiling temperature, in degrees Kelvin
	// P₁ - Pressure where the corresponding T₁ is known, in PSI
	// T₂ - The boiling point at the pressure of interest, in degrees Kelvin
	// P₂ - The vapour pressure of the liquid at the pressure of interest
	// R  - The ideal gas constant, in J/(K * mol)
	// L  - The heat vaporization of the liquid, in J/mol

	const t1 = 373.15; // *K - boiling point at 1 atm
	const p1 = 14.696; // 1 atmosphere in psi
	const L = 40660; // J/mol^-1
	const R = 8.314; // J/(K * mol)
	const p2 = pressure;

	// return (L * t1) / (L + (R * t1 * Math.log(p1 / pressure)));
	return 1 / ( -((Math.log(p1 / p2) / (-L / R)) - (1 / t1)) );
});

export const storedEnergy = clean((material, pressure, depleted) => {
	return specificHeat(material) * (boilingPoint(material, pressure) - (depleted && depleted.toNumber && depleted.toNumber() || depleted));
});

export const mass = clean((capacity, material, pressure, depleted) => {
	return capacity / storedEnergy(material, pressure, depleted);
});

export const volume = clean((capacity, material, pressure, depleted) => {
	return mass(capacity, material, pressure, depleted) / 1000;
});

export function burst(state) {
	return ((mass(state) / 18) * 8.314 * boilingPoint(state)) / (volume(state) * 0.001);
}