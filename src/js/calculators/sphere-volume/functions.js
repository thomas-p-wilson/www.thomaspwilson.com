export function diameterFromRadius(radius) {
	return radius * 2;
}

export function radiusFromDiameter(diameter) {
	return diameter / 2;
}

export function surfaceAreaFromRadius(radius) {
	return 4 * Math.PI * Math.pow(radius, 2);
}

export function radiusFromSurfaceArea(surfaceArea) {
	return Math.sqrt(surfaceArea / (4 * Math.PI));
}

export function volumeFromRadius(radius) {
	return (4 / 3) * Math.PI * Math.pow(radius, 3);
}

export function radiusFromVolume(volume) {
	return Math.cbrt(volume / ((4 / 3) * Math.PI));
}

export function svRatioFromSurfaceAreaAndVolume(surfaceArea, volume) {
    return surfaceArea / volume;
}
