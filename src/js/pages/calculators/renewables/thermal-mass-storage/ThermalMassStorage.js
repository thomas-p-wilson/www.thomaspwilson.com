import React, { Component } from 'react';
import * as output from './calculated.js';
import MathJax from 'react-mathjax-preview'
import DimensionlessNumberField from '../../../../components/calculator/DimensionlessNumberField';
import Info from '../../../../components/calculator/Info';
import InfoSection from '../../../../components/calculator/InfoSection';
import MJ from '../../../../components/calculator/MJ';
import NumberField from '../../../../components/calculator/NumberField';
import SelectField from '../../../../components/calculator/SelectField';
import convert from '../../../../utils/conversion';
import { onChange } from '../../common';

export default class ThermalMassStorage extends Component {
    //
    // React Lifecycle
    //
    constructor(props) {
        super(props);

        this.state = {
            capacity: 720000000, // J
            material: 'water',
            pressure: 14.696, // psi (sea-level atm)
            depleted: 308.15,

            displayUnits: {},
            info: null
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
                        <li>Newtonian (single-mirror), Cassegrain (twin-mirror) types</li>
                        <li>Spherical or paraboloidal mirrors (where acceptable)</li>
                        <li>Spin casting calculation</li>
                    </ul>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>System Info</h2>
                            <dl className="table">
                                <dt>Capacity</dt>
                                <dd>
                                    <NumberField field="capacity"
                                            state={ this.state }
                                            unit="J"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Storage Material</dt>
                                <dd>
                                    <SelectField field="material"
                                            onChange={ this.onChange }
                                            options={{
                                                water: 'Water'
                                            }}
                                            readonly
                                            state={ this.state } />
                                </dd>

                                <dt>Specific Heat</dt>
                                <dd>
                                    <DimensionlessNumberField field="specificHeat"
                                            value={ output.specificHeat(this.state) }
                                            readonly />
                                </dd>

                                <dt>Absolute Pressure</dt>
                                <dd>
                                    <NumberField field="pressure"
                                            state={ this.state }
                                            unit="psi"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt><Info field="boilingPoint" onClick={ this.onInfo } /> Boiling Point</dt>
                                <dd>
                                    <NumberField field="boilingPoint"
                                            value={ output.boilingPoint(this.state) }
                                            state={ this.state }
                                            unit="K"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'boilingPoint' }>
                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    T_2 = \dfrac{LT_1}{L + RT_1\ln\left(\dfrac{P_1}{P_2}\right)}
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$T_1$ = known boiling temperature</MJ></li>
                                                    <li><MJ>$P_1$ = pressure where the corresponding $T_1$ is known</MJ></li>
                                                    <li><MJ>$T_2$ = the boiling point at the pressure of interest</MJ></li>
                                                    <li><MJ>$P_2$ = the vapour pressure of the liquid at the pressure of interest</MJ></li>
                                                    <li><MJ>$R$ = the ideal gas constant, in J/(K * mol)</MJ></li>
                                                    <li><MJ>$L$ = the heat vaporization of the liquid, in J/mol</MJ></li>
                                                    <li><MJ>$\ln$ = the natural logarithm</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>

                                <dt>Depleted Temperature</dt>
                                <dd>
                                    <NumberField field="depleted"
                                            state={ this.state }
                                            unit="K"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Stored Energy Per Gram</dt>
                                <dd>
                                    <NumberField field="storedEnergy"
                                            value={ output.storedEnergy(this.state) }
                                            state={ this.state }
                                            unit="J"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Mass Required</dt>
                                <dd>
                                    <NumberField field="mass"
                                            value={ output.mass(this.state) }
                                            state={ this.state }
                                            unit="g"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Volume Required</dt>
                                <dd>
                                    <NumberField field="volume"
                                            value={ output.volume(this.state) }
                                            state={ this.state }
                                            unit="L"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                            </dl>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <p>Given the above volume, what pressure may be expected if the material flashes to steam, such as on sudden loss of compression?</p>
                            <dl className="table">
                                <dt><Info field="burst" onClick={ this.onInfo } /> Burst Presure</dt>
                                <dd>
                                    <NumberField field="burst"
                                            value={ output.burst(this.state) }
                                            state={ this.state }
                                            unit="Pa"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                                <InfoSection show={ this.state.info === 'burst' }>
                                    <table>
                                        <tr>
                                            <td>
                                                <MathJax math={ String.raw`
                                                    $$
                                                    \begin{align}
                                                    PV &= nRT
                                                    P &= \dfrac{nRT}{V}
                                                    \end{align}
                                                    $$
                                                ` } />
                                            </td>
                                            <td>
                                                <ul>
                                                    <li><MJ>$P$ = the pressureof the gas, in Pa</MJ></li>
                                                    <li><MJ>$V$ = the volume of the gas, in $m^3$</MJ></li>
                                                    <li><MJ>$n$ = the amount of substance, in mol</MJ></li>
                                                    <li><MJ>$R$ = the ideal gas constant, in J / mol * K</MJ></li>
                                                    <li><MJ>$T$ = the absolute temperature, in K</MJ></li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </InfoSection>
                            </dl>
                        </div>
                    </div>
                </section>
                <pre>
                { JSON.stringify(this.state, null, 4) }
                </pre>
            </div>
        );
    }
}
