import { DEFAULT_SCALE, constants } from '../constants';

export function apertureRadius(state, decimalPlaces = DEFAULT_SCALE) {
    return state.apertureDiameter / 2;
};

export function apertureArea(state, decimalPlaces = DEFAULT_SCALE) {
    return Math.PI * Math.pow(state.apertureDiameter / 2, 2);
};

// export function systemFocalLength(state) {
//     return state.apertureDiameter * 3;
// }

export function systemFocalRatio(state, decimalPlaces = DEFAULT_SCALE) {
    return (state.systemFocalLength / state.apertureDiameter).toFixed(decimalPlaces);
}

// export function primaryFocalLength(state) {
//     return state.apertureDiameter * 2;
// }

export function primaryFocalRatio(state, decimalPlaces = DEFAULT_SCALE) {
    return state.primaryFocalLength / state.apertureDiameter;
}

export function primaryCenterDepth(state, decimalPlaces = DEFAULT_SCALE) {
    if (state.primaryType === 'spherical') {
        // h = height of the cap
        // R = radius of the sphere (focal point)
        // a = radius of the cap
        // h = R - \sqrt{R^2 - a^2}
        return state.primaryFocalLength - Math.sqrt(Math.pow(state.primaryFocalLength, 2) - Math.pow(apertureRadius(state), 2));
    }
    if (state.primaryType === 'paraboloidal') {
        return Math.pow(radius(state.apertureDiameter), 2) / (4 * state.primaryFocalLength);
    }
    return NaN;
}

export function primaryDishArea(state, decimalPlaces = DEFAULT_SCALE) {
    var a = primaryCenterDepth(state);
    var b = radius(state.apertureDiameter);

    if (state.primaryType === 'spherical') {
        // A = 2 \pi r h
        return 2 * Math.PI * state.primaryFocalLength * a;
    }

    if (state.primaryType === 'paraboloidal') {
        return Math.PI * Math.pow(b, 2) + ((Math.PI * b) / (6 * Math.pow(a, 2))) * (Math.pow((Math.pow(b, 2) + (4 * Math.pow(a, 2))), 3/2) - Math.pow(b, 3));
    }



    // var a = apertureRadius(state);
    // var a2 = Math.pow(a, 2);
    // var h = primaryCenterDepth(state);

    // if (state.primaryType === 'spherical') {
    //     return 2 * Math.PI * a * h;
    // }
    // if (state.primaryType === 'paraboloidal') {
    //     return (Math.PI * Math.pow(a, 2)) * ((Math.PI * a) / (6 * Math.pow(h, 2))) * (Math.pow(Math.pow(a, 2) + (4 * Math.pow(h, 2)), 3/2) - Math.pow(a, 3));
    //     // return ((Math.PI * a) / (6 * Math.pow(h, 2))) * (Math.pow((a2 + (4 * Math.pow(h, 2))), 3/2) - Math.pow(a, 3));
    // }
    return NaN;
}

export function primaryDishVolume(state, decimalPlaces = DEFAULT_SCALE) {
    var r = apertureRadius(state);
    var d = primaryCenterDepth(state);
    if (state.primaryType === 'spherical') {
        return ((Math.PI * d) / 6) * (3 * Math.pow(r, 2) + Math.pow(d, 2));
    }
    if (state.primaryType === 'paraboloidal') { // We know the exact formula for paraboloidal volume
        return (Math.PI * Math.pow(r, 2) * d) / 2;
    }
    return NaN;
}

export function primaryMaterialVolume(state, decimalPlaces = DEFAULT_SCALE) {
    var r = apertureRadius(state);
    var t = state.primaryEdgeThickness;
    var v = primaryDishVolume(state);
    return (Math.PI * Math.pow(r, 2) * t) - v;
}

// export function primaryMass(state, decimalPlaces = DEFAULT_SCALE) {
//     return primaryMaterialVolume(state) * 28; // Glass, for now
// }
// primaryMass.title = 'Mass';
// primaryMass.info = 'A rough estimate of the mass of the material required to construct the primary mirror.';
// primaryMass.unit = 'g';

export function primaryCastRotation(state, decimalPlaces = DEFAULT_SCALE) {
    var rad = Math.sqrt(convert(G, 'm', state.unit_of_length) / (state.primary_focal_length * 2));
    if ('rpm' === state.unit_of_rotation) {
        return 0.159155 * rad * 60;
    }
    return convert(rad, 'rad', state.unit_of_rotation);
}

export function radius(diameter) {
    return diameter / 2;
}

export function volume(diameter, height) {
    return Math.PI * Math.pow(radius(diameter), 2) * height;
}

export function mass(volume) {
    return volume * 2.579; // g/cm^3;
}

/**
 * Determine the furnace rotation required to parabolize a liquid to the given
 * focal length.
 *
 * w = sqrt(g / (2 * f))
 * where
 * f is the focal length (m)
 * w is the rotation speed (rad / s)
 * g is the acceleration due to gravity (m/s^2)
 */
export function rotation(focalLength) {
    return Math.sqrt((constants.G.value * 100) / (2 * focalLength));
}