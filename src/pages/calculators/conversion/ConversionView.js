import React from 'react';
import { measures } from '../../../utils/conversion';
import NumberField from '../../../components/calculator/NumberField';
import { onChange } from '../common';

export default class Mass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onChange = onChange().bind(this);
    }

    render() {
        const { measure, base } = this.props;
        return (
            <div className="App mass-conversion conversion-page">
                <section className="App-content">
                    {
                        Object.keys(measure)
                            .map((system) => (
                                <div className="row">
                                    <div className="col col100">
                                        <h2>{ measure[system].name } ({ Object.keys(measure[system].units).length })</h2>
                                        { measure[system].description ? (<p>{ measure[system].description }</p>) : null }
                                        <ul className="unit-list">
                                            {
                                                Object.keys(measure[system].units)
                                                    .map((key) => (
                                                        <li>
                                                            <NumberField field="value"
                                                                    state={ this.state }
                                                                    unit={ base }
                                                                    display={ measure[system].units[key].id }
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
