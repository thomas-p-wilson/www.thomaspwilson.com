import React from 'react';
import PropTypes from 'prop-types';
import { evaluate, roundToScale } from '../../../utils';
import convert, { addon, defaultUnit, listUnits } from '../../../Converter';

function withInfo() {

}

@withInfo()
export default class CalculatorNumericField extends React.Component {
    static propTypes = {
        'calculator': PropTypes.object.isRequired
    };
}


export default class Field extends React.Component {
    static propTypes = {
        'id': PropTypes.string.isRequired,
        'title': PropTypes.string.isRequired,
        'onChange': PropTypes.func.isRequired,
        'type': PropTypes.oneOf(['number']),
        'scale': PropTypes.number,
        'addon': PropTypes.any,
        'info': PropTypes.any,
        'output': PropTypes.bool,
        'unit': PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                'type': PropTypes.string,
                'options': PropTypes.arrayOf(PropTypes.string),
                'exponent': PropTypes.number
            })
        ])
    };

    static defaultProps = {
        'type': 'number',
        'scale': 3
    };

    constructor(props) {
        super(props);
        this.state = { 'open': false };
        this.onChange = this.onChange.bind(this);
        if (props.unit) {
            this.defaultUnit = defaultUnit(props.unit.type || props.unit);
        }
    }

    onChange(ev) {
        // Handle unit conversions
        if (this.isConversionRequired()) {
            let value = ev.target.value;
            value = convert(value, this.props.calculator[this.props.id + '_unit'], this.defaultUnit, this.props.unit.exponent || 1);
            ev.target.value = value;
        }
        this.props.onChange(ev);
    }

    isConversionRequired() {
        if (this.props.type !== 'number' || !this.props.unit || !this.props.calculator[this.props.id + '_unit']) {
            return false;
        }
        return this.defaultUnit !== this.props.calculator[this.props.id + '_unit'];
    }

    //
    // RENDERING
    //
    renderInfoButton() {
        if (!this.props.info) {
            return;
        }

        return (
            <a className="info" onClick={ () => { this.setState({ 'open': !this.state.open }) } }><i className="fa fa-info-circle"></i></a>
        );
    }

    renderInfo() {
        if (!this.props.info || this.state.open === false) {
            return;
        }

        return [
            <div className="clearfix"></div>,
            <div className="row">
                <p className="alert alert-info" dangerouslySetInnerHTML={ evaluate(this.props.info, null, this.props.calculator) } />
            </div>
        ];
    }

    renderInput() {
        // Get info from props
        const {
            id,
            type,
            scale,
            output,
            onChange,
            options,
            ...rest
        } = this.props;

        // Generate value
        let value;
        try {
            value = this.props.calculator[this.props.id];
        } catch (err) {}

        // Handle unit conversions
        console.log(this.props.calculator)
        if (this.isConversionRequired()) {
            value = convert(value, this.defaultUnit, this.props.calculator[this.props.id + '_unit'], this.props.unit.exponent);
        }

        // Handle rounding
        if (type === 'number' && scale && !this.props.calculator.isExplicit(id)) {
            value = roundToScale(value, scale || 2);
        }

        // Build new props
        const props = {
            id,
            name: id,
            value,
            onChange: this.onChange,
            disabled: Boolean(this.props.output),
            className: 'form-control'
        };
        if (type === 'number' && !options) {
            props.step = 0.01;
        }

        if (!options) {
            return (
                <input type={ this.props.type }
                        { ...props } />
            );
        }
        return (
            <select { ...props }>
                {
                    Object.keys(options).map((option, i) => (
                        <option value={ option } key={ i }>{ options[option] }</option>
                    ))
                }
            </select>
        );
    }

    renderAddon() {
        if (!this.props.addon) {
            return null;
        }

        return (
            <span className="input-group-addon">
                { evaluate(this.props.addon, null, this.props.calculator) }
            </span>
        );
    }

    renderUnitChooser() {
        if (!this.props.unit) {
            return null;
        }

        return [
            <div className="input-group-btn">
                <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{ this.props.calculator[this.props.id + '_unit'] || this.defaultUnit } <span className="caret"></span></button>
                <ul className="dropdown-menu dropdown-menu-right">
                    {
                        (this.props.unit.options || listUnits(this.props.unit.type || this.props.unit)).map((unit) => (
                            <li><a onClick={ () => { this.props.onChange({ target: { name: this.props.id + '_unit', value: unit } }) } }>{ unit }</a></li>
                        ))
                    }
                </ul>
            </div>
        ];
    }

    renderField() {
        let elements = [
            this.renderInput(),
            this.renderAddon(),
            this.renderUnitChooser()
        ].filter((o) => (o));

        if (elements.length === 1) {
            return elements;
        }

        return (
            <div className="input-group">
                { elements }
            </div>
        );
    }

    render() {
        return (
            <div className="form-group">
                <label for={ this.props.id } className="col-md-4 col-sm-12 control-label">{ this.props.title } { this.renderInfoButton() }</label>
                <div className="col-md-8 col-sm-12">
                    { this.renderField() }
                </div>
                { this.renderInfo() }
            </div>
        );
    }
}