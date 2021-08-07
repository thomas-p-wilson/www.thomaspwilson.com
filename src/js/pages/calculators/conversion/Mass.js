import React from 'react';
import { measures } from '../../../utils/conversion';
import NumberField from '../../../components/calculator/NumberField';
import { onChange } from '../common';

const renderMeasure = (measure, base, _this, key) => (
    <ul className="unit-list">
        {
            Object.keys(measure[key].units)
                .map((unit) => (
                    <li>
                        <NumberField field="value"
                                state={ _this.state }
                                unit={ base }
                                display={ measure[key].units[unit].id }
                                onChange={ _this.onChange }
                                unconvertible />
                    </li>
                ))
        }
    </ul>
)

export default class Mass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onChange = onChange().bind(this);
    }

    render() {
        const measure = measures.mass;
        const base = 'mass-metric-gram';

        return (
            <div className="conversion-page">
                <section>
                    <h2>Metric ({ Object.keys(measure.metric.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'metric') }
                    </div>
                </section>

                <section>
                    <h2>U.S. Customary Units ({ Object.keys(measure.usCustomaryUnits.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'usCustomaryUnits') }
                    </div>
                </section>

                <section>
                    <h2>Tower Weights ({ Object.keys(measure.towerWeights.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'towerWeights') }
                    </div>
                </section>

                <section>
                    <h2>Troy Weights ({ Object.keys(measure.troyWeights.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'troyWeights') }
                    </div>
                </section>

                <section>
                    <h2>Dutch System ({ Object.keys(measure.dutchSystem.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'dutchSystem') }
                    </div>
                </section>

                <section>
                    <h2>Late Avoirdupois ({ Object.keys(measure.lateAvoirdupois.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'lateAvoirdupois') }
                    </div>
                </section>

                <section>
                    <h2>Early Avoirdupois ({ Object.keys(measure.earlyAvoirdupois.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'earlyAvoirdupois') }
                    </div>
                </section>

                <section>
                    <h2>Post-Imperial Apothecary ({ Object.keys(measure.postImperialApothecarySystem.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'postImperialApothecarySystem') }
                    </div>
                </section>

                <section>
                    <h2>Pre-Imperial Apothecary ({ Object.keys(measure.preImperialApothecarySystem.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'preImperialApothecarySystem') }
                    </div>
                </section>

                <section>
                    <h2>Scottish Weights ({ Object.keys(measure.scottishWeights.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'scottishWeights') }
                    </div>
                </section>

                <section>
                    <h2>Mint Weights ({ Object.keys(measure.mintWeights.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'mintWeights') }
                    </div>
                </section>

                <section>
                    <h2>Hanseatic League ({ Object.keys(measure.hanseaticLeague.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'hanseaticLeague') }
                    </div>
                </section>

                <section>
                    <h2>Other ({ Object.keys(measure.other.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'other') }
                    </div>
                </section>
            </div>
        );
    }
}
