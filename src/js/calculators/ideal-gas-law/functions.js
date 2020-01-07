import Decimal from 'decimal.js';

export const R = new Decimal('8.31446261815324'); // J⋅K−1⋅mol−1, the ideal gas constant

// PV = nRT

export function pressureFromVolumeTemperatureMoles(volume, temperature, moles) {
	// P = nRT / V
	return (moles * R * temperature) / volume;
}

export function volumeFromPressureTemperatureMoles(pressure, temperature, moles) {
	// V = nRT / P
	return (moles * R * temperature) / pressure;
}

export function temperatureFromPressureVolumeMoles(pressure, volume, moles) {
	// T = PV / nR
	return (pressure * volume) / (moles * R);
}

export function molesFromPressureVolumeTemperature(pressure, volume, temperature) {
	// PV = nRT
	// PV / RT = n

	console.log('Pressure: ', pressure); // Pascals
	console.log('Volume: ', volume); // m^3
	console.log('Temperature: ', temperature); // *K
	return (pressure * volume) / (R * temperature);
}
