import {
	radiusFromSagittaAndChord,
	sagittaFromRadiusAndChord,
	chordFromRadiusAndSagitta,
	angleFromRadiusAndChord
} from '../circular-segment/functions';

export {
	radiusFromSagittaAndChord,
	sagittaFromRadiusAndChord,
	chordFromRadiusAndSagitta,
	angleFromRadiusAndChord
}

export function areaFromRadiusAndSagitta(radius, sagitta) {
	// A = 2 * pi * r * h
	return 2 * Math.PI * radius * sagitta;
}

export function volumeFromRadiusAndSagitta(radius, sagitta) {
	// V = ((pi * h^2) / 3) * (3r - h)
	return ((Math.PI * Math.pow(sagitta, 2)) / 3) * (3 * radius - sagitta);
}