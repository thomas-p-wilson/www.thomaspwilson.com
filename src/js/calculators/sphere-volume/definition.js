import Calculator from '../Calculator';
import * as functions from './functions';
import { all, any, first } from '../helpers';

export default new Calculator({
    exclusive: true,
    slug: 'sphere',
    title: 'Sphere Calculator'
}, [
    {
        id: 'radius',
        title: 'Radius (r)',
        symbol: 'r',
        unit: 'length-metric-centimetre',
        calculate: any(
            ['diameter', 'surface-area', 'volume'],
            first(
                functions.radiusFromDiameter,
                functions.radiusFromSurfaceArea,
                functions.radiusFromVolume
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
        id: 'surface-area',
        title: 'Surface Area (A)',
        symbol: 'A',
        unit: 'length-metric-centimetre',
        exponent: 2,
        calculate: any('radius', functions.surfaceAreaFromRadius)
    },
    {
        id: 'volume',
        title: 'Volume (v)',
        symbol: 'v',
        unit: 'length-metric-centimetre',
        exponent: 3,
        calculate: any('radius', functions.volumeFromRadius)
    },
    {
        id: 'sv-ratio',
        title: 'Surface-Volume Ratio (A / V)',
        calculate: all(
            ['surface-area', 'volume'],
            functions.svRatioFromSurfaceAreaAndVolume
        ),
        readonly: true
    }
]);
