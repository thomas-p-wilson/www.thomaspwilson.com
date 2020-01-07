import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import materials, { getName, getDensity } from '../../measures/other/materials';
import { configurations, getName as getConfigurationName } from '../mass-moment-of-inertia/constants';
import { inertiaZ } from '../mass-moment-of-inertia/functions';

export default new Calculator({
    slug: 'flywheel',
    title: 'Flywheel'
}, [
    {
        id: 'material',
        title: 'Material',
        options: Object.keys(materials).reduce((result, material) => {
            result[material] = `${ getName(material) } (${ getDensity(material) })`;
            return result;
        }, {}),
        default: 'iron'
    },
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
        unit: 'mass-metric-gram',
        readonly: true,
        calculate: all(
            ['material', 'configuration', 'radius', 'height'],
            functions.mass
        )
    },
    {
        id: 'inertia',
        title: 'Moment of Inertia',
        // unit: '', TODO g*cm^2
        readonly: true,
        calculate: all(
            ['configuration', 'mass', 'radius'],
            inertiaZ
        )
    },
    {
        id: 'rotation',
        title: 'Rotation / s',
        unit: 'angle-other-rad' // TODO per second
    },
    {
        id: 'energy',
        title: 'Energy',
        unit: 'energy-metric-J',
        readonly: true,
        calculate: all(
            ['configuration', 'inertia', 'rotation'],
            functions.energy
        )
    }
]);
