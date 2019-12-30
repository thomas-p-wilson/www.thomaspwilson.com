import React, { Component } from 'react';
import * as output from './calculated.js';
import MathJax from 'react-mathjax-preview';
import DimensionlessNumberField from '../../../../components/calculator/DimensionlessNumberField';
import NumberField from '../../../../components/calculator/NumberField';
import { onChange } from '../../common';

export default class Photovoltaic extends Component {
    //
    // React Lifecycle
    //
    constructor(props) {
        super(props);

        this.state = {
            dailyDemand: 30000, // Wh
            dailyLightHours: 6,
            panelRating: 280, // W
            panelCost: 210, // $CAD
            panelEfficiencyModifier: 0.8, // 80%

            displayUnits: {}
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
                    <h1 className="App-title">Photovoltaic Bank Parameters</h1>
                    <p>Determine approximately how much photovoltaic capacity you need to produce energy for a given period of time.</p>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>System Info</h2>
                            <dl class="table">
                                <dt>Daily Demand</dt>
                                <dd>
                                    <NumberField field="dailyDemand"
                                            state={ this.state }
                                            unit="power-metric-watt"
                                            time="time-other-h"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Daily Light Hours</dt>
                                <dd>
                                    <DimensionlessNumberField field="dailyLightHours"
                                            state={ this.state }
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Demand Per Light Hour</dt>
                                <dd>
                                    <NumberField field="demandPerLightHour"
                                            value={ output.demandPerLightHour(this.state) }
                                            state={ this.state }
                                            unit="power-metric-watt"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>
                            </dl>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>Panel Bank</h2>
                            <dl className="table">
                                <dt>Panel Rating</dt>
                                <dd>
                                    <NumberField field="panelRating"
                                            state={ this.state }
                                            unit="power-metric-watt"
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Panel Price</dt>
                                <dd>
                                    <NumberField field="panelCost"
                                            state={ this.state }
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Efficiency Modifier</dt>
                                <dd>
                                    <NumberField field="panelEfficiencyModifier"
                                            state={ this.state }
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Real Rating</dt>
                                <dd>
                                    <NumberField field="realRating"
                                            value={ output.panelRealRating(this.state) }
                                            state={ this.state }
                                            unit="power-metric-watt"
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Panel Cost / Watt</dt>
                                <dd>
                                    <NumberField field="panelCostPerWatt"
                                            value={ output.panelCostPerWatt(this.state) }
                                            state={ this.state }
                                            readonly
                                            onChange={ this.onChange } />
                                </dd>

                                <dt>Panels Required</dt>
                                <dd>
                                    <DimensionlessNumberField field="panelRating"
                                            value={ output.panelsRequired(this.state) }
                                            readonly />
                                </dd>

                                <dt>Total Cost</dt>
                                <dd>
                                    <DimensionlessNumberField field="panelRating"
                                            value={ output.panelTotalCost(this.state) }
                                            readonly />
                                </dd>
                            </dl>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
