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
import transform from 'lodash/transform';

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
        const measure = transform(measures.length, (result, item, name) => {
            result[item.system] = result[item.system] || {};
            result[item.system][name] = item;
        });
        return (
            <div className="App length-conversion conversion-page">
                <section className="App-content">
                    {
                        Object.keys(measure)
                            .map((system) => (
                                <div className="row">
                                    <div className="col col100">
                                        <h2>{ system } ({ Object.keys(measure[system]).length })</h2>
                                        <ul className="unit-list">
                                            {
                                                Object.keys(measure[system])
                                                    .map((key) => (
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
                            ))
                    }
                </section>
            </div>
        );
    }
}
