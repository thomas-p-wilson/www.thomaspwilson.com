import { sq } from '../helpers';

export const configurations = {
	// | Name | Inertial Constant | Moment of Inertia |
	thin_wall_cylinder: [ // Thin-walled, hollow cylinder
		'Thin Wall Cylinder',
		1,
		(mass, height) => {},
		(mass, radius) => ( // g, cm
			mass * sq(radius)
		)
	],
	hollow_cylinder: [
		'Hollow Cylinder',
		.5,
		(mass, height) => {},
		(mass, inside_radius, outside_radius) => ( // g, cm, cm
			.5 * (mass * (sq(inside_radius) + sq(outside_radius)))
		)
	],
	solid_cylinder: [
		'Solid Cylinder',
		.5,
		(mass, radius, height) => (
			0.25 * mass * sq(radius) - (-1) * (mass) * sq(height) / 12
		),
		(mass, radius) => ( // g, cm
			.5 * (mass * sq(radius))
		)
	],
	thin_wall_sphere: [ // Thin-walled, hollow sphere
		'Thin Wall Sphere',
		2 / 3,
		(mass, height) => {},
		(mass, radius) => ( // g, cm
			2 / 3 * mass * sq(radius)
		)
	],
	solid_sphere: [
		'Solid Sphere',
		2 / 5,
		(mass, height) => {},
		(mass, radius) => ( // g, cm
			2 / 5 * (mass * sq(radius))
		)
	]
}

export function getName(configuration) {
	return configurations[configuration][0];
}

export function getInertialConstant(configuration) {
	return configurations[configuration][1];
}

export function getMomentOfInertiaXY(configuration) {
	return configurations[configuration][2];
}

export function getMomentOfInertiaZ(configuration) {
	return configurations[configuration][3];
}


// function sq(x) {
// 	return x*x;
// }
// function ical() {
// 	fh = document.forms[0];
// 	mass = fh.m.value; // mass (kg)
// 	radius = fh.R.value * .01; // radius (cm)
// 	length = fh.L.value; // length (cm)
// 	fh.i1.value = 0.5 * mass * sq(radius); // Iz
// 	fh.i2.value = 0.25 * mass * sq(radius) - (-1) * mass * sq(length) / 12; // Ix
// 	fh.i3.value = 0.25 * mass * sq(radius) - (-1) * mass * sq(length) / 3; // Ix(end)
// 	fh.i4.value = 0.25 * mass * sq(radius); // I_thin_disk_diameter
// 	fh.i5.value = mass * sq(length) / 3; // I_thin_rod_end
// }