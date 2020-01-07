import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import materials, { getName, getDensity } from '../../measures/other/materials';
import { configurations, getName as getConfigurationName } from './constants';

export default new Calculator({
    slug: 'mass-moment-of-inertia',
    title: 'Mass Moment of Inertia'
}, [
    {
        id: 'configuration',
        title: 'Configuration',
        options: Object.keys(configurations).reduce((obj, configuration) => {
            obj[configuration] = getConfigurationName(configuration);
            return obj;
        }, {}),
        default: 'solid_cylinder'
    },
    {
        id: 'inertial-constant',
        title: 'Inertial Constant',
        readonly: true,
        calculate: any('configuration', functions.inertialConstantFromConfiguration)
    },
    {
        id: 'radius',
        title: 'Radius',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'height',
        title: 'Height',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'mass',
        title: 'Mass',
        unit: 'mass-metric-gram'
    },
    {
        id: 'inertia-xy',
        title: 'Moment of Inertia (x, y)',
        // unit: '', TODO g*cm^2
        readonly: true,
        calculate: all(
            ['configuration', 'mass', 'radius', 'height'],
            functions.inertiaXY
        )
    },
    {
        id: 'inertia-z',
        title: 'Moment of Inertia (z)',
        // unit: '', TODO g*cm^2
        readonly: true,
        calculate: all(
            ['configuration', 'mass', 'radius'],
            functions.inertiaZ
        )
    },
]);
