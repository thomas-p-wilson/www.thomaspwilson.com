export function radiusFromDiameter(diameter) {
	return diameter / 2;
}

export function diameterFromRadius(radius) {
	return radius * 2;
}

export function radiusFromCircumference(circumference) {
	return circumference / Math.PI / 2;
}

export function circumferenceFromRadius(radius) {
	return 2 * Math.PI * radius;
}

export function radiusFromArea(area) {
	return Math.sqrt(area / Math.PI);
}

export function areaFromRadius(radius) {
    return Math.PI * Math.pow(radius, 2);
}
