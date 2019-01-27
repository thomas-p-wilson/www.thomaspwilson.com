import React from 'react';
import classnames from 'classnames';
import MathJax from 'react-mathjax-preview'
import { measures } from '../../../utils/conversion';
import DimensionlessNumberField from '../../../components/calculator/DimensionlessNumberField';
import Info from '../../../components/calculator/Info';
import InfoSection from '../../../components/calculator/InfoSection';
import MJ from '../../../components/calculator/MJ';
import NumberField from '../../../components/calculator/NumberField';
import SelectField from '../../../components/calculator/SelectField';
import { hide } from '../../../utils/calculator';
import * as output from './calculated.js';
import { onChange } from '../common';

export default class Telescopy extends React.Component {
    //
    // React Lifecycle
    //
    constructor(props) {
        super(props);

        this.state = {
            // Variables
            apertureDiameter: 60.96, // cm
            systemFocalLength: 182.88, // 3x the aperture diameter
            primaryType: 'paraboloidal',
            primaryConstruction: 'ground',
            primaryFocalLength: 121.92,
            primaryEdgeThickness: 5, // cm

            displayUnits: {},
            info: {}
        };

        this.onChange = onChange().bind(this);
        this.onInfo = this.onInfo.bind(this);
    }

    onInfo(ev) {
        let field = ev.target.getAttribute('data-field');
        if (!field) {
            field = ev.target.parentElement.getAttribute('data-field');
        }
        this.setState((state) => {
            if (state.info === field) {
                return { info: null };
            }
            return { info: field };
        });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Telescope Design Parameters</h1>
                    <p>The telescope design parameters calculator is designed to aid me when I'm building telescope components. I intend to expand the feature set of this calculator as time permits and as I find the need...or desire.</p>
                    <p>Currently, the calculator supports telescope designs with the following properties:</p>
                    <ul>
                        <li>Single-mirror configurations (Newtonian). Double-mirror configurations in the works.</li>
                        <li>Spherical or paraboloidal mirrors (where acceptable)</li>
                        <li>Ground blank and meniscus construction. Hex-backed construction in the works.</li>
                        <li>Spin casting calculation</li>
                    </ul>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>System Info</h2>
                            <dl className="table">
                                <dt>
                                    <Info field="apertureDiameter" onClick={ this.onInfo } />&nbsp;
                                    Aperture Diameter
                                </dt>
                                <dd>
                                    <NumberField field="apertureDiameter"
                                            state={ this.state }
                                            unit="centimetre"
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'apertureDiameter' }>The diameter of the objective aperture determines the amount of light allowed to enter the telescope. Larger apertures allow more light to enter the telescope.</InfoSection>

                                <dt>Aperture Area</dt>
                                <dd>
                                    <NumberField field="apertureArea"
                                            value={ output.apertureArea(this.state) }
                                            state={ this.state }
                                            unit="centimetre"
                                            exponent="2"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Focal Length</dt>
                                <dd>
                                    <NumberField field="systemFocalLength"
                                            state={ this.state }
                                            unit="centimetre"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt><Info field="systemFocalRatio" onClick={ this.onInfo } /> Focal Ratio</dt>
                                <dd>
                                    <DimensionlessNumberField value={ output.systemFocalRatio(this.state) }
                                            readonly />
                                </dd>
                                <InfoSection show={ this.state.info === 'systemFocalRatio' }>
                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    N = \dfrac{f}{D}
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$N$ = the f-number, aka f-stop, f-ratio, or focal ratio</MJ></li>
                                                    <li><MJ>$f$ = focal length</MJ></li>
                                                    <li><MJ>$D$ = diameter of entrance pupil (effective aperture)</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>
                            </dl>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>Primary Mirror Info</h2>
                            <dl class="table">
                                <dt>Type</dt>
                                <dd>
                                    <SelectField field="primaryType"
                                            onChange={ this.onChange }
                                            options={{
                                                spherical: 'Spherical',
                                                paraboloidal: 'Paraboloidal'
                                            }}
                                            state={ this.state } />
                                </dd>

                                <dt>Construction</dt>
                                <dd>
                                    <SelectField field="primaryConstruction"
                                            onChange={ this.onChange }
                                            options={{
                                                ground: 'Ground Blank',
                                                meniscus: 'Meniscus'
                                            }}
                                            state={ this.state } />
                                </dd>

                                <dt><Info field="primaryFocalLength" onClick={ this.onInfo } /> Focal Length</dt> {/* If single-mirror design, focal length is same as system focal length */ }
                                <dd>
                                    <NumberField field="primaryFocalLength"
                                            state={ this.state }
                                            unit="centimetre"
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryFocalLength' }>The focal length of the primary mirror. Typcially twice the primary diameter.</InfoSection>

                                <dt>Focal Ratio</dt> { /* If single-mirror design, focal ratio is same as system focal ratio */ }
                                <dd>
                                    <DimensionlessNumberField value={ output.primaryFocalRatio(this.state) }
                                            readonly />
                                </dd>

                                <dt>Edge Thickness</dt>
                                <dd>
                                    <NumberField field="primaryEdgeThickness"
                                            state={ this.state }
                                            unit="centimetre"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>{ this.state.primaryConstruction === 'meniscus' ? 'Material' : 'Blank' } Volume</dt>
                                <dd>
                                    <NumberField field="blankVolume"
                                            value={ output.volume(this.state.apertureDiameter, this.state.primaryEdgeThickness) }
                                            state={ this.state }
                                            unit="centimetre"
                                            exponent="3"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>{ this.state.primaryConstruction === 'meniscus' ? 'Material' : 'Blank' } Mass</dt>
                                <dd>
                                    <NumberField field="blankMass"
                                            value={ output.mass(output.volume(this.state.apertureDiameter, this.state.primaryEdgeThickness)) }
                                            state={ this.state }
                                            unit="gram"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt><Info field="primaryCenterDepth" onClick={ this.onInfo } /> Dish Depth</dt>
                                <dd>
                                    <NumberField field="primaryCenterDepth"
                                            value={ output.primaryCenterDepth(this.state) }
                                            state={ this.state }
                                            unit="centimetre"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryCenterDepth' }>
                                    <strong>Spherical Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    h = R - \sqrt{R^2 - a^2}
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$h$ = the depth of the spherical cap</MJ></li>
                                                    <li><MJ>$a$ = the radius of the dish</MJ></li>
                                                    <li><MJ>$R$ = the radius of the sphere, equivalent to the focal length of the mirror</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>

                                    <strong>Paraboloidal Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    h = \dfrac{a^2}{4f}
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$h$ = the height of the dish</MJ></li>
                                                    <li><MJ>$a$ = the radius of the dish</MJ></li>
                                                    <li><MJ>$f$ = the focal length of the mirror</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>

                                <dt><Info field="primaryDishArea" onClick={ this.onInfo } /> Dish Area</dt>
                                <dd>
                                    <NumberField field="primaryDishArea"
                                            value={ output.primaryDishArea(this.state) }
                                            state={ this.state }
                                            unit="centimetre"
                                            exponent="2"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryDishArea' }>
                                    <strong>Spherical Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    A = 2 \pi r h
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$A$ = The area of the curved surface</MJ></li>
                                                    <li><MJ>$r$ = The radius of the sphere (focal length)</MJ></li>
                                                    <li><MJ>$h$ = The height of the dish</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>

                                    <strong>Parabolic Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    A = \pi a^2 + \dfrac{\pi a}{6h^2} [(a^2 + 4h^2)^{3/2} - a^3]
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$A$ = The area of the curved surface</MJ></li>
                                                    <li><MJ>$h$ = The height of the dish</MJ></li>
                                                    <li><MJ>$a$ = The radius of the dish</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>

                                <dt><Info field="primaryDishVolume" onClick={ this.onInfo } /> Dish Volume</dt>
                                <dd>
                                    <NumberField field="primaryDishVolume"
                                            value={ output.primaryDishVolume(this.state) }
                                            state={ this.state }
                                            unit="centimetre"
                                            exponent="3"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryDishVolume' }>
                                    <strong>Spherical Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    V = \dfrac{\pi h}{6} (3a^2 + h^2)
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$V$ = The volume of the dish</MJ></li>
                                                    <li><MJ>$a$ = The radius of the dish</MJ></li>
                                                    <li><MJ>$h$ = The height of the dish</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>

                                    <strong>Parabolic Mirrors</strong>

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    V = \dfrac{1}{2} \pi a^2 h
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$V$ = The volume of the dish</MJ></li>
                                                    <li><MJ>$a$ = The radius of the dish</MJ></li>
                                                    <li><MJ>$h$ = The height of the dish</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>

                                <dt { ...hide(this.state.primaryConstruction === 'meniscus') }><Info field="primaryMaterialVolume" onClick={ this.onInfo } /> Material Volume</dt>
                                <dd { ...hide(this.state.primaryConstruction === 'meniscus') }>
                                    <NumberField field="primaryMaterialVolume"
                                            value={ output.primaryMaterialVolume(this.state) }
                                            state={ this.state }
                                            unit="centimetre"
                                            exponent="3"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryMaterialVolume' } { ...hide(this.state.primaryConstruction === 'meniscus') }>A rough estimate of the volume of the material used to create the mirror.</InfoSection>

                                <dt { ...hide(this.state.primaryConstruction === 'meniscus') }>Mass</dt>
                                <dd { ...hide(this.state.primaryConstruction === 'meniscus') }>
                                    <NumberField field="primaryMass"
                                            value={ output.mass(output.primaryMaterialVolume(this.state)) }
                                            state={ this.state }
                                            unit="gram"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt { ...hide(this.state.primaryType !== 'paraboloidal') }><Info field="primaryRotation" onClick={ this.onInfo } /> Cast Rotation</dt>
                                <dd { ...hide(this.state.primaryType !== 'paraboloidal') }>
                                    <NumberField field="primaryRotation"
                                            value={ output.rotation(this.state.primaryFocalLength) }
                                            state={ this.state }
                                            unit="rad"
                                            time="second"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'primaryRotation' } { ...hide(this.state.primaryType !== 'paraboloidal') }>
                                    The angular velocity with which the mirror must be rotated in order to achieve the desired focal length during spin-casting.

                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    w = \sqrt{\dfrac{g}{2f}}
                                                    $$
                                                `} />

                                                { /* h = \dfrac{1}{2g}w^2r^2 ??? WHERES THIS FROM???? */ }
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$w$ represent the angular velocity of the liquid's rotation, in radians per second</MJ></li>
                                                    <li><MJ>$g$ represent the acceleration due to gravity</MJ></li>
                                                    <li><MJ>$f$ represent the focal length of the mirror</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>
                            </dl>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
