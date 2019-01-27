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
import { onChange } from '../common';

export default class Telescopy extends React.Component {
    //
    // React Lifecycle
    //
    constructor(props) {
        super(props);

        this.state = {};

        this.onChange = onChange().bind(this);
    }

    render() {
        return (
            <div className="App">
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>Metric Units</h2>
                            <ul className="unit-list">
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="femtometre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="picometre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="nanometre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="micrometre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="millimetre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="centimetre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="metre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="kilometre"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>English Units - Pre-1826</h2>

                            <ul className="unit-list">
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="twip"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="point"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="pica"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="line"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="barleycorn"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="finger"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="inch"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="stick"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="hand"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="digit"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="palm"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="nail"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="shaftment"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="span"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="link"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="foot"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="cubit"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="pace"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="yard"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="step"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="ell"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="skein"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="spindle"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="rope"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="ramsden_chain"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="roman_mile"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="rod"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="gunter_chain"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="furlong"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="mile"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="fathom"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="shackle"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="cable"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="nautical_mile"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="league"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>Imperial Units</h2>

                            <ul className="unit-list">
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="thou"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="inch"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="foot"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="yard"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="chain"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="furlong"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="mile"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="fathom"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="cable"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="nautical_mile"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="link"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="rod"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>U.S. Customary Units</h2>
                            <small>Those units whose conversions are identical to their Imperial counterparts are omitted.</small>

                            <ul className="unit-list">
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="point"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="pica"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="inch-us"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="foot-us"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="yard-us"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                                <li>
                                    <NumberField field="value"
                                            state={ this.state }
                                            unit="metre"
                                            display="mile-us"
                                            onChange={ this.onChange }
                                            unconvertible />
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
