import React from 'react';
import PropTypes from 'prop-types';
import { evaluate, roundToScale } from '../utils';
import stateful from '../decorators/stateful';
import { Input, Select } from '../components/form';
import OutsideClickWatcher from '../components/box/OutsideClickWatcher';
import Dropdown from '../components/form/Dropdown';
import Field from './form/Field';
import { convert } from '../measurements';

const exponentize = (text, exponent) => {
    if (exponent <= 1) {
        return text;
    }

    return (<span>{ text }<sup>{ exponent }</sup></span>);
}

@stateful({
    open: true
})
export default class CalculatorField extends React.Component {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    onChange(name, value) {
        this.props.onChange(name, this.convert(value, true));
    }

    convert(value, toGlobal) {
        if (this.props.options) {
            return value;
        }

        // All values are stored in the definition's global unit. Convert to the
        // local unit
        const field = this.props.calculator.fields[this.props.id];
        const fieldUnit = field.unit;
        if (field && fieldUnit) {
            const globalUnit = this.props.calculator.units[field.unit.type];
            const displayUnit = this.props.calculator.getUnit(this.props.id);
            const exponent = (field.unit || {}).exponent || 1;
            if (displayUnit !== globalUnit) {
                return convert(value, toGlobal ? displayUnit : globalUnit, toGlobal ? globalUnit : displayUnit, exponent);
            }
        }
        return value;
    }

    getValue() {
        let value;
        try {
            value = this.props.calculator.get(this.props.id);
        } catch (err) {}

        value = this.convert(value);

        // Handle rounding
        if (!this.props.options && this.props.type !== 'select') {
            value = roundToScale(value, this.props.scale || 3);
        }

        return value;
    }

    renderTitle() {
        if (!this.props.info) {
            return this.props.title;
        }

        return (
            <span>{ this.props.title } <a className="info" onClick={ () => { this.props.updateopen(!this.props.open) } }><i className="fa fa-info-circle"></i></a></span>
        );
    }

    renderInfo() {
        if (!this.props.info) {
            return;
        }

        return [
            <div className="clearfix"></div>,
            <div className="row">
                <p className={ 'field-info' + (this.props.open ? ' open' : '') } dangerouslySetInnerHTML={ { __html: evaluate(this.props.info, null, this.props.calculator) } } />
            </div>
        ];
    }

    renderAddon() {
        if (!this.props.addon) {
            return;
        }

        return (
            <span className="input-group-addon">
                { evaluate(this.props.addon, null, this.props.calculator) }
            </span>
        );
    }

    renderUnitPicker() {
        if (!this.props.unit) {
            return;
        }

        let exponent = '';
        if (this.props.calculator.fields[this.props.id]
                && this.props.calculator.fields[this.props.id].unit
                && this.props.calculator.fields[this.props.id].unit.exponent > 1) {
            exponent = this.props.calculator.fields[this.props.id].unit.exponent;
        }
        const options = (this.props.unit.options || listUnits(this.props.unit.type || this.props.unit))
            .map((unit) => ({
                value: unit,
                title: exponentize(unit, exponent),
                selected: this.props.calculator.getUnit(this.props.id) === unit
            }));
        return (
            <Dropdown id={ this.props.id + '_unit' }
                    title={ exponentize(this.props.calculator[this.props.id + '_unit'] || this.defaultUnit, exponent) }
                    options={ options }
                    onChange={ (name, value) => { this.props.onChange('$unit$' + this.props.id, value); } }
                    className="input-group-btn" />
        );
    }

    render() {
        const props = {
            id: this.props.id,
            name: this.props.id,
            type: this.props.options ? 'select' : this.props.type,
            scale: this.props.scale,
            value: this.getValue(),
            title: this.renderTitle(),
            className: 'form-control',
            onChange: this.onChange,
            after_field: this.renderInfo(),
            suffix: this.renderAddon() || this.renderUnitPicker(),
            disabled: this.props.output,
            options: this.props.options
        };

        return (
            <Field { ...props } />
        );
    }
}

// @stateful({
//     open: true
// })
// export default class Field extends React.Component {
//     static propTypes = {
//         'id': PropTypes.string.isRequired,
//         'title': PropTypes.string.isRequired,
//         'calculator': PropTypes.object.isRequired,
//         'onChange': PropTypes.func.isRequired,
//         'type': PropTypes.oneOf(['number']),
//         'scale': PropTypes.number,
//         'addon': PropTypes.any,
//         'info': PropTypes.any,
//         'output': PropTypes.bool,
//         'unit': PropTypes.oneOfType([
//             PropTypes.string,
//             PropTypes.shape({
//                 'type': PropTypes.string,
//                 'options': PropTypes.arrayOf(PropTypes.string),
//                 'exponent': PropTypes.number
//             })
//         ]),
//         'open': PropTypes.bool,
//         'updateopen': PropTypes.func
//     };

//     static defaultProps = {
//         'type': 'number',
//         'scale': 3
//     };

//     constructor(props) {
//         super(props);
//         this.onChange = this.onChange.bind(this);
//         if (props.unit) {
//             this.defaultUnit = defaultUnit(props.unit.type || props.unit);
//         }
//     }

//     onChange(ev) {
//         console.log('Changed: ', ev);
//         // Handle unit conversions
//         if (this.isConversionRequired()) {
//             let value = ev.target.value;
//             value = convert(value, this.props.calculator[this.props.id + '_unit'], this.defaultUnit, this.props.unit.exponent || 1);
//             ev.target.value = value;
//         }
//         this.props.onChange(ev.target.name, ev.target.value);
//     }

//     isConversionRequired() {
//         if (this.props.type !== 'number' || !this.props.unit || !this.props.calculator[this.props.id + '_unit']) {
//             return false;
//         }
//         return this.defaultUnit !== this.props.calculator[this.props.id + '_unit'];
//     }

//     //
//     // RENDERING
//     //
//     renderInfoButton() {
//         if (!this.props.info) {
//             return;
//         }

//         return (
//             <a className="info" onClick={ () => { this.props.updateopen(!this.props.open) } }><i className="fa fa-info-circle"></i></a>
//         );
//     }

//     renderInfo() {
//         if (!this.props.info) {
//             return;
//         }

//         return [
//             <div className="clearfix"></div>,
//             <div className="row">
//                 <p className={ 'field-info' + (this.props.open ? ' open' : '') } dangerouslySetInnerHTML={ { __html: evaluate(this.props.info, null, this.props.calculator) } } />
//             </div>
//         ];
//     }

//     renderInput() {
//         // Get info from props
//         const {
//             id,
//             type,
//             scale,
//             output,
//             onChange,
//             options,
//             ...rest
//         } = this.props;

//         // Generate value
//         let value;
//         try {
//             value = this.props.calculator[this.props.id];
//         } catch (err) {}

//         // Handle unit conversions
//         if (this.isConversionRequired()) {
//             value = convert(value, this.defaultUnit, this.props.calculator[this.props.id + '_unit'], this.props.unit.exponent);
//         }

//         // Handle rounding
//         if (type === 'number' && scale && !this.props.calculator.isExplicit(id)) {
//             value = roundToScale(value, scale || 2);
//         }

//         // Build new props
//         const props = {
//             type,
//             id,
//             name: id,
//             value,
//             options,
//             onChange: this.onChange,
//             disabled: Boolean(this.props.output),
//             className: 'form-control'
//         };
//         if (type === 'number' && !options) {
//             props.step = 0.01;
//         }

//         if (!options) {
//             return (<Input { ...props } />);
//         }
//         return (<Select { ...props } />);
//     }

//     renderAddon() {
//         if (!this.props.addon) {
//             return null;
//         }

//         return (
//             <span className="input-group-addon">
//                 { evaluate(this.props.addon, null, this.props.calculator) }
//             </span>
//         );
//     }

//     renderUnitChooser() {
//         if (!this.props.unit) {
//             return null;
//         }

//         const options = (this.props.unit.options || listUnits(this.props.unit.type || this.props.unit))
//             .map((unit) => ({
//                 value: unit,
//                 title: unit,
//                 selected: this.props.calculator.getUnit(this.props.id) === unit
//             }));
//         console.log('Options: ', options);
//         console.log('Unit: ', this.props.calculator.getUnit(this.props.id));
//         return (
//             <Dropdown id={ this.props.id + '_unit' }
//                     title={ this.props.calculator[this.props.id + '_unit'] || this.defaultUnit }
//                     options={ options }
//                     onChange={ (name, value) => { this.props.onChange('$unit$' + this.props.id, value); } }
//                     className="input-group-btn" />
//         );
//     }

//     renderField() {
//         let elements = [
//             this.renderInput(),
//             this.renderAddon(),
//             this.renderUnitChooser()
//         ].filter((o) => (o));

//         if (elements.length === 1) {
//             return elements;
//         }

//         return (
//             <div className="input-group">
//                 { elements }
//             </div>
//         );
//     }

//     render() {
//         return (
//             <div className="form-group">
//                 <label for={ this.props.id } className="col-md-4 col-sm-12 control-label">{ this.props.title } { this.renderInfoButton() }</label>
//                 <div className="col-md-8 col-sm-12">
//                     { this.renderField() }
//                 </div>
//                 { this.renderInfo() }
//             </div>
//         );
//     }
// }