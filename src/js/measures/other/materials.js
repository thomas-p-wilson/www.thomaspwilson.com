const materials = {
    // | Name | Specific Heat (J/g/*K) | Grams per Mole | Melting Point (*K) | Boiling point (*K) | Density (kg/m^3) |
    iron: ['Iron', .449, 55.845, 1811, 3134, 7850],
    water: ['Water', 4.182, 18.01528, 273.15, 373.15, 1000]
};

export default materials;

export function getName(material) {
	return materials[material][0];
}

export function getSpecificHeat(material) {
	return materials[material][1];
}

export function getGramsPerMole(material) {
	return materials[material][2];
}

export function getMeltingPoint(material) {
	return materials[material][3];
}

export function getBoilingPoint(material) {
	return materials[material][4];
}

export function getDensity(material) {
	return materials[material][5];
}
