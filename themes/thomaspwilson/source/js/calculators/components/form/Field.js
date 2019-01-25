import React from 'react';
import PropTypes from 'prop-types';
import { evaluate, roundToScale } from '../../utils';
import { Input, Select } from './index';
import OutsideClickWatcher from '../box/OutsideClickWatcher';
import Dropdown from './Dropdown';

export default class Field extends React.Component {
    static propTypes = {
        'id': PropTypes.string.isRequired,
        'title': PropTypes.any,
        'onChange': PropTypes.func.isRequired,
        'type': PropTypes.oneOf(['number', 'select']),
        'scale': PropTypes.number,
        'prefix': PropTypes.any,
        'suffix': PropTypes.any,
        'info': PropTypes.any,
        'disabled': PropTypes.boolean
    };

    static defaultProps = {
        'type': 'number',
        'scale': 3
    };

    renderInput() {
        if (!this.props.options) {
            return (<Input { ...this.props } />);
        }
        return (<Select { ...this.props } />);
    }

    renderAddon(prop) {
        if (!prop) {
            return null;
        }

        return (
            <span className="input-group-addon">
                { prop }
            </span>
        );
    }

    renderField() {
        let elements = [
            this.props.prefix,
            this.renderInput(),
            this.props.suffix
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
                { this.props.before_field }
                <label for={ this.props.id } className="col-md-4 col-sm-12 control-label">{ this.props.title }</label>
                <div className="col-md-8 col-sm-12">
                    { this.renderField() }
                </div>
                { this.props.after_field }
            </div>
        );
    }
}