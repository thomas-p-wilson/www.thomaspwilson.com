export function specificHeat(state) {
	return 4.18; // J/g*C - water
}

export function boilingPoint(state) {
	//ln(P₁/P₂) = -L/R * (1/T₁ - 1/T₂)
	const t1 = 373.15; // *K - boiling point at 1 atm
	const p1 = 14.696; // psi - 1atm
	const L = 40660; // J/mol^-1
	const R = 8.314; // J/(K * mol)
	const p2 = state.absolutePressure;

	// return (L * t1) / (L + (R * t1 * Math.log(p1 / state.absolutePressure)));
	return 1 / ( -((Math.log(p1 / p2) / (-L / R)) - (1 / t1)) );
}

export function storedEnergy(state) {
	return 4.18 * (boilingPoint(state) - state.depletedTemperature);
}

export function massRequired(state) {
	return state.capacity / storedEnergy(state);
}

export function volume(state) {
	return massRequired(state) / 1000;
}

export function burstPressure(state) {
	return ((massRequired(state) / 18) * 8.314 * boilingPoint(state)) / (volume(state) * 0.001);
}

export default {
    capacity: {
        type: 'number',
        title: 'Capacity',
        unit: 'energy-metric-J',
        default: 720000000,
    },
    material: {
        type: 'select',
        title: 'Storage Material',
        options: {
            water: 'Water',
        },
        readonly: true,
        default: 'water',
    },
    specificHeat: {
        type: 'number',
        title: 'Specific Heat',
        calculate: specificHeat,
        readonly: true,
    },
    absolutePressure: {
        type: 'number',
        title: 'Absolute Pressure',
        unit: 'pressure-other-psi',
        default: 14.696, // psi (sea-level, 1atm)
    },
    boilingPoint: {
        type: 'number',
        title: 'Boiling Point',
        unit: 'temperature-metric-kelvin',
        calculate: boilingPoint,
        readonly: true,
    },
    depletedTemperature: {
        type: 'number',
        title: 'Depleted Temperature',
        unit: 'temperature-metric-kelvin',
        default: 308.15,
    },
    storedEnergy: {
        type: 'number',
        title: 'Stored Energy / Gram',
        unit: 'energy-metric-J',
        calculate: storedEnergy,
        readonly: true,
    },
    massRequired: {
        type: 'number',
        title: 'Mass Required',
        unit: 'mass-metric-gram',
        calculate: massRequired,
        readonly: true,
    },
    volumeRequired: {
        type: 'number',
        title: 'Volume Required',
        unit: 'volume-metric-litre',
        calculate: volume,
        readonly: true,
    },
    burstPressure: {
        type: 'number',
        title: 'Burst Pressure',
        unit: 'pressure-metric-pascal',
        calculate: burstPressure,
        readonly: true,
    }
}