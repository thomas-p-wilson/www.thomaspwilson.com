import { getDensity } from '../../measures/other/materials';
import { getInertialConstant } from '../mass-moment-of-inertia/constants';
import { sq } from '../helpers';

export function volume(configuration, radius, height) {
	return Math.PI * Math.pow(radius, 2) * height;
}

export function mass(material, configuration, radius, height) {
	return getDensity(material) / 1000 * volume(configuration, radius, height);
}

export function energy(configuration, inertia, rotation) {
	return getInertialConstant(configuration) * (inertia / 1000 / sq(100)) * Math.pow(rotation, 2);
}
