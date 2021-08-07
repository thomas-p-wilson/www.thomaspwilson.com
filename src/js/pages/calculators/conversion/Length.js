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
        const measure = measures.length;
        const base = 'length-metric-metre';
        return (
            <div className="conversion-page">
                <section>
                    <h2>Metric ({ Object.keys(measure.metric.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'metric') }
                        <aside>
                            In 1970, Charles Maurice de Talleyrand proposed a new system to the French National Assembly, which would base its measurements on natural units. Great Britain did not wish to co-operate in development, so the French Academy of Sciences began developing the system alone starting in 1971. While Talleyrand's grand ambition of a global system of measurement has not yet been realized, approximately 99% of countries globally have adopted the metric system to some extent, leading approximately 95% of the global population to fall under some degree of metrification.
                        </aside>
                    </div>
                </section>

                <section>
                    <h2>U.S. Customary Units ({ Object.keys(measure.usCustomaryUnits.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'usCustomaryUnits') }
                        <aside>
                            The United States customary system is derived from the English unit system which was in place before the U.S. became an independent country. Formalized in 1832, and updated by the Mendenhall Order of 1893 to redefine the units in relation to the meter and kilogram, the system bears striking similarity to the parallel British Imperial system, both of which are based on the older English unit system, though significant differences do exist. 
                        </aside>
                    </div>
                </section>

                <section>
                    <h2>British Imperial Units ({ Object.keys(measure.britishImperial.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'britishImperial') }
                        <aside>
                            The imperial system was first defined in the British Weights and Measures Act 1824, replacing the previously-used Winchester Standards which had been in effect since 1588. Imperial units are still in use in the United Kingcome and some other commonwealth and former British territories. 
                        </aside>
                    </div>
                </section>

                <section>
                    <h2>English Units - Pre 1826 ({ Object.keys(measure.englishUnits.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'englishUnits') }
                        <aside>
                            The English Units system is taken to include both the Winchester Units (1495-1587) and the Exchequer Standards (1588-1825). The measurements contained herein are a combination of the two, which will in the future be broken out appropriately. In any case, these units are derived from early Anglo-Saxon and Ancient Roman systems of measurement.
                            
                            <em>Note: All conversions to the metre are through the late 13th century foot</em>
                        </aside>
                    </div>
                </section>

                <section>
                    <h2>Imperial - Gunter's Survey Units ({ Object.keys(measure.guntersUnits.units).length })</h2>
                    <div className="flex-row">
                        { renderMeasure(measure, base, this, 'guntersUnits') }
                        <aside>
                            Edmund Gunter produced a distance measuring device in 1620 composed of 100 links each 201mm long, yielding a 20.1m or 66ft chain. The chain and the link eventually became statutory measures in the British Empire and influenced future systems of measure.
                        </aside>
                    </div>
                </section>
            </div>
        );
    }
}
