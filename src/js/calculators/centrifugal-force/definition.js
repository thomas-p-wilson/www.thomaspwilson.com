import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import { configurations, getName as getConfigurationName } from '../mass-moment-of-inertia/constants';
import { inertiaZ } from '../mass-moment-of-inertia/functions';

export default new Calculator({
    slug: 'centrifugal-force',
    title: 'Centrifugal Force'
}, [
    {
        id: 'mass',
        title: 'Mass',
        unit: 'mass-metric-gram',
    },
    {
        id: 'radius',
        title: 'Radius',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'rotation',
        title: 'Angular Velocity',
        unit: 'angle-other-rad' // TODO per second
    },
    {
        id: 'surface',
        title: 'Surface Speed',
        unit: 'length-metric-centimetre', // TODO per second
        readonly: true,
        calculate: all(
            ['rotation', 'radius'],
            functions.surfaceSpeed
        )
    },
    {
        id: 'force',
        title: 'Centrifugal Force',
        //unit: '', TODO g * cm^2 * s
        readonly: true,
        calculate: all(
            ['mass', 'surface', 'radius'],
            functions.centrifugalForce
        )
    },
    {
        id: 'acceleration',
        title: 'Centripetal Acceleration',
        // unit: '', TODO cm/s^2
        readonly: true,
        calculate: all(
            ['surface', 'radius'],
            functions.centripetalAcceleration
        )
    }
]);
