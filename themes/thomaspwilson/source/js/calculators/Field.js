import React from 'react';
import PropTypes from 'prop-types';
import { evaluate } from './utils';

export default class Field extends React.Component {
    static propTypes = {
        'id': PropTypes.string.isRequired,
        'title': PropTypes.string.isRequired,
        'calculator': PropTypes.object.isRequired,
        'onChange': PropTypes.func.isRequired,
        'type': PropTypes.oneOf(['number']),
        'addon': PropTypes.any,
        'info': PropTypes.any,
        'output': PropTypes.bool
    };

    static defaultProps = {
        'type': 'number'
    };

    constructor() {
        super();
        this.state = { 'open': false };
    }

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
                <p className="alert alert-info">{ evaluate(this.props.info, this.props.calculator) }</p>
            </div>
        ];
    }

    renderInput() {
        let input;

        // Get info from props
        const {
            id,
            type,
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

        // Build new props
        const props = {
            id,
            name: id,
            value,
            onChange,
            disabled: Boolean(this.props.output),
            className: 'form-control'
        };
        if (this.props.type === 'number' && !options) {
            props.pattern = '([0-9]{1,3}).([0-9]{1,3})';
        }


        if (options) {
            input = (
                <select { ...props }>
                    {
                        Object.keys(options).map((option, i) => (
                            <option value={ option } key={ i }>{ options[option] }</option>
                        ))
                    }
                </select>
            );
        } else {
            input = (
                <input type={ this.props.type }
                        { ...props } />
            );
        }

        if (!this.props.addon) {
            return input;
        }

        return (
            <div className="input-group">
                { input }
                <span className="input-group-addon">{ evaluate(this.props.addon, this.props.calculator) }</span>
            </div>
        );
    }

    render() {
        return (
            <div className="form-group">
                <label for={ this.props.id } className="col-md-4 col-sm-12 control-label">{ this.props.title } { this.renderInfoButton() }</label>
                <div className="col-md-8 col-sm-12">
                    { this.renderInput() }
                </div>
                { this.renderInfo() }
            </div>
        );
    }
}