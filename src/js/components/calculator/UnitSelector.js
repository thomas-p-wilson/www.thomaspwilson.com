import React from 'react';
import classnames from 'classnames';
import { getMeasure } from '../../utils/conversion';

/**
 *
 */
export default class UnitSelector extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false
        };
        this.onOutsideClick = this.onOutsideClick.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.renderExponent = this.renderExponent.bind(this);

        document.addEventListener('mousedown', this.onOutsideClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onOutsideClick, false);
    }

    onOutsideClick(ev) {
        if (!this.state.open) {
            return;
        }
        if (this.node && this.node.contains(ev.target)) {
            return;
        }
        this.setState((state) => ({ open: false }));
    }

    onToggle(ev) {
        this.setState((state) => ({ open: !state.open }));
    }

    onSelect(ev) {
        this.props.onChange(ev);
        this.setState({ open: false });
    }

    renderExponent() {
        if (this.props.exponent) {
            return (<sup>{ this.props.exponent }</sup>);
        }
    }

    render() {
        const {
            unit,
            field,
            value,
            number
        } = this.props;
        if (!unit) {
            return (<div />);
        }
        const measure = getMeasure(unit);
        return (
            <React.Fragment>
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded={ this.state.open } onClick={ this.onToggle }>{ value }{ this.renderExponent() }</button>
                <div className={ classnames('dropdown-menu dropdown-menu-right', { show: this.state.open }) }
                        ref={ (ref) => { this.node = ref; } }>
                    {
                        Object.keys(getMeasure(unit))
                            .map((symbol) => (
                                <a className="dropdown-item"
                                        data-field={ field }
                                        data-unit={ symbol }
                                        onClick={ this.onSelect }>
                                    { measure[symbol].singular }{ this.renderExponent() }
                                </a>
                            ))
                    }
                </div>
            </React.Fragment>
        );
    }
}
