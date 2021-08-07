import React from 'react';
import classnames from 'classnames';
import { getMeasure, units } from '../../utils/conversion';

/**
 *
 */
export default class UnitSelector extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false,
            search: ''
        };
        this.onOutsideClick = this.onOutsideClick.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.onSearch = this.onSearch.bind(this);
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

    onSearch(ev) {
        this.setState((state) => ({ search: ev.target.value }));
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

    renderUnits() {
        const {
            unit,
            field
        } = this.props;
        const measure = getMeasure(unit)
        return Object.keys(measure)
                .reduce((arr, system) => {
                    const units = Object.keys(measure[system].units)
                        .filter((symbol) => {
                            const item = measure[system].units[symbol];
                            return this.state.search === ''
                                    || String.prototype.toLowerCase.call(item.singular || '').indexOf(String.prototype.toLowerCase.call(this.state.search || '')) > -1;
                        })
                        .map((symbol) => (
                            <a className="dropdown-item"
                                    data-field={ field }
                                    data-unit={ measure[system].units[symbol].id }
                                    onClick={ this.onSelect }>
                                { measure[system].units[symbol].singular }{ this.renderExponent() }
                            </a>
                        ));
                    if (units.length > 0) {
                        return arr
                            .concat([(
                                <span className="dropdown-header">{ measure[system].name } ({ Object.keys(measure[system].units).length })</span>
                            )])
                            .concat(units);
                    }
                    return arr;
                }, []);
    }

    renderDropdownComponent() {
        return (
            <div className={ classnames('dropdown-menu dropdown-menu-right', { show: this.state.open }) }
                ref={ (ref) => { this.node = ref; } }>
                <input type="search"  value={ this.state.search } onChange={ this.onSearch } placeholder="Search..." className="form-control" />
                <span className="dropdown-divider" />
                { this.renderUnits() }
            </div>
        )
    }

    render() {
        const {
            unit,
            field,
            value,
            number,
            disabled,
        } = this.props;
        if (!unit) {
            return (<div />);
        }

        const obj = units[value];
        return (
            <React.Fragment>
                <button className="btn btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded={ this.state.open }
                        onClick={ this.onToggle }
                        disabled={ disabled }>
                    { obj.plural }{ obj.symbol ? ` (${ obj.symbol })` : '' }{ this.renderExponent() }
                </button>
                { !disabled && this.renderDropdownComponent() }
            </React.Fragment>
        );
    }
}
