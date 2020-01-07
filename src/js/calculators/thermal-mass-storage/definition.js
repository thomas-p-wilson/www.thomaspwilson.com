import Calculator from '../Calculator';
import materials from '../../measures/other/materials';
import * as functions from './functions';
import { all, any } from '../helpers';

export default new Calculator({
    title: 'Thermal Mass Storage',
    slug: 'thermal-mass-storage'
}, [
    {
        id: 'capacity',
        title: 'Capacity',
        unit: 'energy-metric-J',
        default: 720000000
    },
    {
        id: 'material',
        title: 'Material',
        options: materials.reduce((result, material) => {
            result[material[0]] = `${ material[0] } (${ material[1] })`;
            return result;
        }, {}),
        default: 'Water'
    },
    {
        id: 'specificHeat',
        title: 'Material Specific Heat',
        readonly: true,
        calculate: any('material', functions.specificHeat)
    },
    {
        id: 'pressure',
        title: 'Absolute Pressure',
        unit: 'pressure-other-psi',
        default: 600
    },
    {
        id: 'boilingPoint',
        title: 'Boiling Point',
        unit: 'temperature-metric-kelvin',
        readonly: true,
        calculate: all(
            ['material', 'pressure'],
            functions.boilingPoint
        )
    },
    {
        id: 'depleted',
        title: 'Depleted Temperature',
        unit: 'temperature-metric-kelvin',
        default: 308.15
    },
    {
        id: 'energy',
        title: 'Energy Per Gram',
        unit: 'energy-metric-J',
        readonly: true,
        calculate: all(
            ['material', 'pressure', 'depleted'],
            functions.storedEnergy
        )
    },
    {
        id: 'mass',
        title: 'Material Mass',
        unit: 'mass-metric-gram',
        readonly: true,
        calculate: all(
            ['capacity', 'material', 'pressure', 'depleted'],
            functions.mass
        )
    },
    {
        id: 'volume',
        title: 'Material Volume',
        unit: 'volume-metric-litre',
        readonly: true,
        calculate: all(
            ['capacity', 'material', 'pressure', 'depleted'],
            functions.volume
        )
    }
]);

                    //         </dl>
                    //     </div>
                    // </div>
                    // <div className="row">
                    //     <div className="col col100">
                    //         <p>Given the above volume, what pressure may be expected if the material flashes to steam, such as on sudden loss of compression?</p>
                    //         <dl className="table">
                    //             <dt><Info field="burst" onClick={ this.onInfo } /> Burst Presure</dt>
                    //             <dd>
                    //                 <NumberField field="burst"
                    //                         value={ output.burst(this.state) }
                    //                         state={ this.state }
                    //                         unit="pressure-metric-pascal"
                    //                         readonly
                    //                         onChange={ this.onChange } />