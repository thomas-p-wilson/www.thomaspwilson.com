import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';

export default new Calculator({
    slug: 'circlular-segment',
    title: 'Circlular Segment'
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
        id: 'arc',
        title: 'Arc Length (L)',
        unit: 'length-metric-centimetre',
        calculate: all(
            ['radius', 'angle'],
            functions.arcLengthFromRadiusAndAngle
        )
    },
    {
        id: 'angle',
        title: 'Central Angle (α)',
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
            ['radius', 'angle'],
            functions.areaFromRadiusAndAngle
        )
    }
]);
