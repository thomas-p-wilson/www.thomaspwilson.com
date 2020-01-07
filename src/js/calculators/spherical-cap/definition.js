import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';

export default new Calculator({
    slug: 'spherical-cap',
    title: 'Spherical Cap'
}, [
    {
        id: 'radius',
        title: 'Radius (r)',
        unit: 'length-metric-centimetre',
        calculate: all(
            ['sagitta', 'chord'],
            functions.radiusFromSagittaAndChord
        )
    },
    {
        id: 'sagitta',
        title: 'Sagitta (s)',
        unit: 'length-metric-centimetre',
        calculate: all(
            ['radius', 'chord'],
            functions.sagittaFromRadiusAndChord
        )
    },
    {
        id: 'chord',
        title: 'Chord (ℓ)',
        unit: 'length-metric-centimetre',
        calculate: all(
            ['radius', 'sagitta'],
            functions.chordFromRadiusAndSagitta
        )
    },
    {
        id: 'polar-angle',
        title: 'Polar Angle (θ)',
        unit: 'angle-other-rad',
        calculate: all(
            ['radius', 'chord'],
            functions.angleFromRadiusAndChord
        )
    },
    {
        id: 'area',
        title: 'Area (A)',
        unit: 'length-metric-centimetre',
        exponent: 2,
        calculate: all(
            ['radius', 'sagitta'],
            functions.areaFromRadiusAndSagitta
        )
    },
    {
        id: 'volume',
        title: 'Volume (V)',
        unit: 'length-metric-centimetre',
        exponent: 3,
        calculate: all(
            ['radius', 'sagitta'],
            functions.volumeFromRadiusAndSagitta
        )
    }
]);
