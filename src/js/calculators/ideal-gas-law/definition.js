import Calculator from '../Calculator';
import { all, any, first } from '../helpers';
import * as functions from './functions';
import { units } from '../../converter';

export default new Calculator({
    slug: 'ideal-gas-law',
    title: 'Ideal Gas Law'
}, [
    {
        id: 'pressure',
        title: 'Pressure (P)',
        unit: 'pressure-metric-pascal',
        calculate: all(
            ['volume', 'temperature', 'moles'],
            functions.pressureFromVolumeTemperatureMoles
        )
    },
    {
        id: 'volume',
        title: 'Volume (V)',
        unit: 'length-metric-metre',
        exponent: 3,
        calculate: all(
            ['pressure', 'temperature', 'moles'],
            functions.volumeFromPressureTemperatureMoles
        )
    },
    {
        id: 'temperature',
        title: 'Temperature (T)',
        unit: 'temperature-metric-kelvin',
        calculate: all(
            ['pressure', 'volume', 'moles'],
            functions.temperatureFromPressureVolumeMoles
        )
    },
    {
        id: 'moles',
        title: 'Moles (n)',
        calculate: all(
            ['pressure', 'volume', 'temperature'],
            functions.molesFromPressureVolumeTemperature
        )
    }
]);
