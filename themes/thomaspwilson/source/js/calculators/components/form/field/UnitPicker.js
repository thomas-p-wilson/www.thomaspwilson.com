import React from 'react';
import { categories } from '../../../measurements';

export default ({ id, calculator, unit, defaultUnit }) => {

    console.log('Unit: ', unit);
    console.log('Calc: ', calculator);
    if (!calculator || !unit) {
        return null;
    }

    return (
        <div className="input-group-btn">
            <button type="button" className="btn btn-default dropdown-toggle">{ (calculator._units || calculator.units)[unit] || defaultUnit } <span className="caret"></span></button>
            <ul className="dropdown-menu dropdown-menu-right">
                {
                    (this.props.unit.options || listUnits(this.props.unit.type || this.props.unit)).map((unit) => (
                        <li><a onClick={ () => { this.props.onChange({ target: { name: this.props.id + '_unit', value: unit } }) } }>{ unit }</a></li>
                    ))
                }
            </ul>
        </div>
    );
}
