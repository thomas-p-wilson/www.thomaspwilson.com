import {
    areaFromRadius,
    diameterFromRadius
} from '../circle-area/functions';

export {
    areaFromRadius,
    diameterFromRadius
};

export function focalRatio(focalLength, diameter) {
    console.log('Focal length: ', focalLength);
    console.log('Diameter: ', diameter);
    return focalLength / diameter;
}

export function sagitta(type, focalLength, radius) {
    console.log('Type: ', type);
    console.log('Focal Length: ', focalLength);
    console.log('Radius: ', radius);
    if (type === 'spherical') {
        // h = height of the cap
        // R = radius of the sphere (focal point)
        // a = radius of the cap
        // h = R - \sqrt{R^2 - a^2}
        return focalLength - Math.sqrt(Math.pow(focalLength, 2) - Math.pow(radius, 2));
    }
    if (type === 'paraboloidal') {
        return Math.pow(radius, 2) / (4 * focalLength);
    }
    return NaN;
}

export function area(type, focalLength, radius) {
    var a = sagitta(type, focalLength, radius);
    var b = radius;

    if (type === 'spherical') {
        // A = 2 \pi r h
        return 2 * Math.PI * focalLength * a;
    }

    if (type === 'paraboloidal') {
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

export function dishVolume(type, focalLength, radius) {
    var r = radius;
    var d = sagitta(type, focalLength, radius);
    if (type === 'spherical') {
        return ((Math.PI * d) / 6) * (3 * Math.pow(r, 2) + Math.pow(d, 2));
    }
    if (type === 'paraboloidal') { // We know the exact formula for paraboloidal volume
        return (Math.PI * Math.pow(r, 2) * d) / 2;
    }
    return NaN;
}

/**
 * @param {Number} radius - The radius of the mirror
 * @param {Number} thickness - The thickness of the mirror at the outer edge
 */
export function materialVolume(type, focalLength, radius, thickness) {
    var r = radius;
    var t = thickness;
    var v = dishVolume(type, focalLength, radius);
    return (Math.PI * Math.pow(r, 2) * t) - v;
}

// export function primaryMass(state, decimalPlaces = DEFAULT_SCALE) {
//     return primaryMaterialVolume(state) * 28; // Glass, for now
// }
// primaryMass.title = 'Mass';
// primaryMass.info = 'A rough estimate of the mass of the material required to construct the primary mirror.';
// primaryMass.unit = 'g';

export function castingRotation(state) {
    // var rad = Math.sqrt(convert(G, 'm', state.unit_of_length) / (state.primary_focal_length * 2));
    // if ('rpm' === state.unit_of_rotation) {
    //     return 0.159155 * rad * 60;
    // }
    // return convert(rad, 'rad', state.unit_of_rotation);
}

export function cylinderVolumeFromRadiusAndHeight(radius, height) {
    return Math.PI * Math.pow(radius, 2) * height;
}

/**
 * Assumes glass. TODO add support for other materials.
 */
export function cylinderMassFromRadiusAndHeight(radius, height) {
    return cylinderVolumeFromRadiusAndHeight(radius, height) * 2.579; // g/cm^3
}