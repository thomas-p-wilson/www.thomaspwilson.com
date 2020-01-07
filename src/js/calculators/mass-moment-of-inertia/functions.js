import { getDensity } from '../../measures/other/materials';
import {
	getInertialConstant,
	getMomentOfInertiaXY,
	getMomentOfInertiaZ
} from './constants';

export const inertialConstantFromConfiguration = getInertialConstant;

export function inertiaXY(configuration, mass, radius, height) {
	return getMomentOfInertiaXY(configuration)(mass, radius, height);
}

export function inertiaZ(configuration, mass, radius) {
	return getMomentOfInertiaZ(configuration)(mass, radius);
}
