import Calculator from '../Calculator';
import { any, first } from '../helpers';
import * as functions from './functions';

export default new Calculator({
    exclusive: true,
    slug: 'circle-area',
    title: 'Circle'
}, [
    {
        id: 'radius',
        title: 'Radius (r)',
        symbol: 'r',
        unit: 'length-metric-centimetre',
        calculate: any(
            ['diameter', 'circumference', 'area'],
            first(
                functions.radiusFromDiameter,
                functions.radiusFromCircumference,
                functions.radiusFromArea
            )
        )
    },
    {
        id: 'diameter',
        title: 'Diameter (d)',
        symbol: 'd',
        unit: 'length-metric-centimetre',
        calculate: any('radius', functions.diameterFromRadius)
    },
    {
        id: 'circumference',
        title: 'Circumference (c)',
        symbol: 'c',
        unit: 'length-metric-centimetre',
        calculate: any('radius', functions.circumferenceFromRadius)
    },
    {
        id: 'area',
        title: 'Area (A)',
        symbol: 'A',
        unit: 'length-metric-centimetre',
        exponent: 2,
        calculate: any('radius', functions.areaFromRadius)
    }
]);
