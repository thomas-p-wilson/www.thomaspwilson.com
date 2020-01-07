import Calculator from '../Calculator';
import * as functions from './functions';
import { all, any, first } from '../helpers';

export default new Calculator({
    slug: 'reflective-telescopy',
    title: 'Reflective Telescopy'
}, [
    {
        id: 'primary-shape',
        title: 'Priimary Shape',
        options: {
            spherical: 'Spherical',
            paraboloidal: 'Paraboloidal'
        },
        default: 'spherical'
    },
    {
        id: 'primary-process',
        title: 'Primary Process',
        options: {
            ground: 'Ground Blank',
            meniscus: 'Meniscus'
        },
        default: 'ground'
    },
    {
        id: 'primary-radius',
        title: 'Primary Radius',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'primary-diameter',
        title: 'Primary Diameter',
        unit: 'length-metric-centimetre',
        readonly: true,
        calculate: any('primary-radius', functions.diameterFromRadius)
    },
    {
        id: 'primary-focal-length',
        title: 'Primary Focal Length',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'primary-focal-ratio',
        title: 'Primary Focal Ratio',
        readonly: true,
        calculate: all(
            ['primary-focal-length', 'primary-diameter'],
            functions.focalRatio
        )
    },
    {
        id: 'primary-thickness',
        title: 'Primary Thickness',
        unit: 'length-metric-centimetre'
    },
    {
        id: 'primary-blank-volume',
        title: 'Primary Blank Volume',
        unit: 'length-metric-centimetre',
        exponent: '3',
        readonly: true,
        calculate: all(
            ['primary-radius', 'primary-thickness'],
            functions.cylinderVolumeFromRadiusAndHeight
        )
    },
    {
        id: 'primary-blank-mass',
        title: 'Primary Blank Mass',
        unit: 'mass-metric-gram',
        readonly: true,
        calculate: all(
            ['primary-radius', 'primary-thickness'],
            functions.cylinderMassFromRadiusAndHeight
        )
    },
    {
        id: 'primary-sagitta',
        title: 'Primary Sagitta',
        unit: 'length-metric-centimetre',
        readonly: true,
        // calculate(data) {
        //     console.log('Shape: ', this['primary-shape'].get(data))
        // }
        calculate: any(
            ['primary-shape', 'primary-focal-length', 'primary-radius'],
            functions.sagitta
        )
    }
]);








                            //     <dt><Info field="primaryDishArea" onClick={ this.onInfo } /> Dish Area</dt>
                            //     <dd>
                            //         <NumberField field="primaryDishArea"
                            //                 value={ output.primaryDishArea(this.state) }
                            //                 state={ this.state }
                            //                 unit="length-metric-centimetre"
                            //                 exponent="2"
                            //                 readonly
                            //                 onChange={ this.onChange } />
                            //     </dd>
                            //     <InfoSection show={ this.state.info === 'primaryDishArea' }>
                            //         <strong>Spherical Mirrors</strong>

                            //         <table>
                            //             <tr>
                            //                 <td>
                            //                     <MathJax math={ String.raw`
                            //                         $$
                            //                         A = 2 \pi r h
                            //                         $$
                            //                     ` } />
                            //                 </td>
                            //                 <td>
                            //                     <ul>
                            //                         <li><MJ>$A$ = The area of the curved surface</MJ></li>
                            //                         <li><MJ>$r$ = The radius of the sphere (focal length)</MJ></li>
                            //                         <li><MJ>$h$ = The height of the dish</MJ></li>
                            //                     </ul>
                            //                 </td>
                            //             </tr>
                            //         </table>

                            //         <strong>Parabolic Mirrors</strong>

                            //         <table>
                            //             <tr>
                            //                 <td>
                            //                     <MathJax math={ String.raw`
                            //                         $$
                            //                         A = \pi a^2 + \dfrac{\pi a}{6h^2} [(a^2 + 4h^2)^{3/2} - a^3]
                            //                         $$
                            //                     ` } />
                            //                 </td>
                            //                 <td>
                            //                     <ul>
                            //                         <li><MJ>$A$ = The area of the curved surface</MJ></li>
                            //                         <li><MJ>$h$ = The height of the dish</MJ></li>
                            //                         <li><MJ>$a$ = The radius of the dish</MJ></li>
                            //                     </ul>
                            //                 </td>
                            //             </tr>
                            //         </table>
                            //     </InfoSection>

                            //     <dt><Info field="primaryDishVolume" onClick={ this.onInfo } /> Dish Volume</dt>
                            //     <dd>
                            //         <NumberField field="primaryDishVolume"
                            //                 value={ output.primaryDishVolume(this.state) }
                            //                 state={ this.state }
                            //                 unit="length-metric-centimetre"
                            //                 exponent="3"
                            //                 readonly
                            //                 onChange={ this.onChange } />
                            //     </dd>
                            //     <InfoSection show={ this.state.info === 'primaryDishVolume' }>
                            //         <strong>Spherical Mirrors</strong>

                            //         <table>
                            //             <tr>
                            //                 <td>
                            //                     <MathJax math={ String.raw`
                            //                         $$
                            //                         V = \dfrac{\pi h}{6} (3a^2 + h^2)
                            //                         $$
                            //                     ` } />
                            //                 </td>
                            //                 <td>
                            //                     <ul>
                            //                         <li><MJ>$V$ = The volume of the dish</MJ></li>
                            //                         <li><MJ>$a$ = The radius of the dish</MJ></li>
                            //                         <li><MJ>$h$ = The height of the dish</MJ></li>
                            //                     </ul>
                            //                 </td>
                            //             </tr>
                            //         </table>

                            //         <strong>Parabolic Mirrors</strong>

                            //         <table>
                            //             <tr>
                            //                 <td>
                            //                     <MathJax math={ String.raw`
                            //                         $$
                            //                         V = \dfrac{1}{2} \pi a^2 h
                            //                         $$
                            //                     ` } />
                            //                 </td>
                            //                 <td>
                            //                     <ul>
                            //                         <li><MJ>$V$ = The volume of the dish</MJ></li>
                            //                         <li><MJ>$a$ = The radius of the dish</MJ></li>
                            //                         <li><MJ>$h$ = The height of the dish</MJ></li>
                            //                     </ul>
                            //                 </td>
                            //             </tr>
                            //         </table>
                            //     </InfoSection>

                            //     <dt { ...hide(this.state.primaryConstruction === 'meniscus') }><Info field="primaryMaterialVolume" onClick={ this.onInfo } /> Material Volume</dt>
                            //     <dd { ...hide(this.state.primaryConstruction === 'meniscus') }>
                            //         <NumberField field="primaryMaterialVolume"
                            //                 value={ output.primaryMaterialVolume(this.state) }
                            //                 state={ this.state }
                            //                 unit="length-metric-centimetre"
                            //                 exponent="3"
                            //                 readonly
                            //                 onChange={ this.onChange } />
                            //     </dd>
                            //     <InfoSection show={ this.state.info === 'primaryMaterialVolume' } { ...hide(this.state.primaryConstruction === 'meniscus') }>A rough estimate of the volume of the material used to create the mirror.</InfoSection>

                            //     <dt { ...hide(this.state.primaryConstruction === 'meniscus') }>Mass</dt>
                            //     <dd { ...hide(this.state.primaryConstruction === 'meniscus') }>
                            //         <NumberField field="primaryMass"
                            //                 value={ output.mass(output.primaryMaterialVolume(this.state)) }
                            //                 state={ this.state }
                            //                 unit="mass-metric-gram"
                            //                 readonly
                            //                 onChange={ this.onChange } />
                            //     </dd>

                            //     <dt { ...hide(this.state.primaryType !== 'paraboloidal') }><Info field="primaryRotation" onClick={ this.onInfo } /> Cast Rotation</dt>
                            //     <dd { ...hide(this.state.primaryType !== 'paraboloidal') }>
                            //         <NumberField field="primaryRotation"
                            //                 value={ output.rotation(this.state.primaryFocalLength) }
                            //                 state={ this.state }
                            //                 unit="angle-other-rad"
                            //                 time="time-metric-second"
                            //                 readonly
                            //                 onChange={ this.onChange } />
                            //     </dd>
                            //     <InfoSection show={ this.state.info === 'primaryRotation' } { ...hide(this.state.primaryType !== 'paraboloidal') }>
                            //         The angular velocity with which the mirror must be rotated in order to achieve the desired focal length during spin-casting.

                            //         <table>
                            //             <tr>
                            //                 <td>
                            //                     <MathJax math={ String.raw`
                            //                         $$
                            //                         w = \sqrt{\dfrac{g}{2f}}
                            //                         $$
                            //                     `} />

                            //                     { /* h = \dfrac{1}{2g}w^2r^2 ??? WHERES THIS FROM???? */ }
                            //                 </td>
                            //                 <td>
                            //                     <ul>
                            //                         <li><MJ>$w$ represent the angular velocity of the liquid's rotation, in radians per second</MJ></li>
                            //                         <li><MJ>$g$ represent the acceleration due to gravity</MJ></li>
                            //                         <li><MJ>$f$ represent the focal length of the mirror</MJ></li>
                            //                     </ul>
                            //                 </td>
                            //             </tr>
                            //         </table>
                            //     </InfoSection>
                            // </dl>