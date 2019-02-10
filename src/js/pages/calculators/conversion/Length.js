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
                                {
                                    Object.keys(measures.length)
                                        .filter((key) => (measures.length[key].system === 'Metric'))
                                        .map((key) => ([key, measures.length[key]]))
                                        .map(([key, unit]) => (
                                            <li>
                                                <NumberField field="value"
                                                        state={ this.state }
                                                        unit="metre"
                                                        display={ key }
                                                        onChange={ this.onChange }
                                                        unconvertible />
                                            </li>
                                        ))
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>English Units - Pre-1826</h2>

                            <ul className="unit-list">
                                {
                                    Object.keys(measures.length)
                                        .filter((key) => (measures.length[key].system === 'English Units'))
                                        .map((key) => ([key, measures.length[key]]))
                                        .map(([key, unit]) => (
                                            <li>
                                                <NumberField field="value"
                                                        state={ this.state }
                                                        unit="metre"
                                                        display={ key }
                                                        onChange={ this.onChange }
                                                        unconvertible />
                                            </li>
                                        ))
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>Imperial Units</h2>

                            <ul className="unit-list">
                                {
                                    Object.keys(measures.length)
                                        .filter((key) => (measures.length[key].system === 'Imperial'))
                                        .map((key) => ([key, measures.length[key]]))
                                        .map(([key, unit]) => (
                                            <li>
                                                <NumberField field="value"
                                                        state={ this.state }
                                                        unit="metre"
                                                        display={ key }
                                                        onChange={ this.onChange }
                                                        unconvertible />
                                            </li>
                                        ))
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>U.S. Customary Units</h2>
                            <small>Those units whose conversions are identical to their Imperial counterparts are omitted.</small>

                            <ul className="unit-list">
                                {
                                    Object.keys(measures.length)
                                        .filter((key) => (measures.length[key].system === 'US Customary'))
                                        .map((key) => ([key, measures.length[key]]))
                                        .map(([key, unit]) => (
                                            <li>
                                                <NumberField field="value"
                                                        state={ this.state }
                                                        unit="metre"
                                                        display={ key }
                                                        onChange={ this.onChange }
                                                        unconvertible />
                                            </li>
                                        ))
                                }
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
