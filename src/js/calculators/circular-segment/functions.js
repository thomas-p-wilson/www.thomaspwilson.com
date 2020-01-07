// r^2 = l^2 + (r - s)^2 ; where l is half the chord length

export function radiusFromSagittaAndChord(sagitta, chord) {
	// r = (l^2 + s^2) / 2s
	return (Math.pow(chord / 2, 2) + Math.pow(sagitta, 2)) / (2 * sagitta);
}

export function sagittaFromRadiusAndChord(radius, chord) {
	// - sqrt(r^2 - l^2) + r
	return -Math.sqrt(Math.pow(radius, 2) - Math.pow(chord / 2, 2)) + radius;
}

export function chordFromRadiusAndSagitta(radius, sagitta) {
	// l = sqrt(2rs - s^2)
	return 2 * Math.sqrt((2 * radius * sagitta) - Math.pow(sagitta, 2))
}

export function arcLengthFromRadiusAndAngle(radius, angle) {
	console.log('Radius: ', radius);
	console.log('Angle: ', angle);
	return radius * angle;
}

export function angleFromRadiusAndChord(radius, chord) {
	// 2 sin-1[c/(2r)]
	return 2 * Math.asin(chord / (2 * radius));
}

export function areaFromRadiusAndAngle(radius, angle) {
	// A = (1/2) * R^2 * (θ - sin θ)
	return .5 * Math.pow(radius, 2) * (angle - Math.sin(angle));
}
