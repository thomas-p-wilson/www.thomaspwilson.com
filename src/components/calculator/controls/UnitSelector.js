import React, { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { getMeasure, units as _units } from '../../../utils/conversion';
import { useCalculatorContext } from '../Calculator';

export default ({ field, unit, value, exponent, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const calculator = useCalculatorContext();
    const parentRef = useRef();
    const close = useCallback((ev) => {
        setIsOpen(false);
        setSearch('');
    }, [setIsOpen, setSearch]);
    const onOutsideClick = useCallback((ev) => {
        if (parentRef.current && parentRef.current.contains(ev.target)) {
            return;
        }
        close();
    }, [parentRef, close]);
    const toggle = useCallback(() => {
        setIsOpen(!isOpen);
        setSearch('');
    }, [setIsOpen, setSearch, isOpen]);
    const onSelect = useCallback((ev) => {
        calculator.onChangeUnit(ev);
        close();
    }, [calculator, close]);
    useEffect(() => {
        document.addEventListener('mousedown', onOutsideClick);
        return () => {
            document.removeEventListener('mousedown', onOutsideClick);
        };
    }, [close, onOutsideClick]);

    // Build exponent
    const exponentComponent = exponent && (<sup>{ exponent }</sup>);

    // Build list of units
    const measure = getMeasure(unit)
    const units = Object.keys(measure)
        .reduce((arr, system) => {
            const units = Object.keys(measure[system].units)
                .filter((symbol) => {
                    const item = measure[system].units[symbol];
                    return search === ''
                            || String.prototype.toLowerCase.call(item.singular || '').indexOf(String.prototype.toLowerCase.call(search || '')) > -1;
                })
                .map((symbol) => (
                    <button className="dropdown-item"
                            name={ field }
                            value={ measure[system].units[symbol].id }
                            onClick={ onSelect }
                            key={`${system}-${symbol}`}>
                        { measure[system].units[symbol].singular }{ exponentComponent }
                    </button>
                ));
            if (units.length > 0) {
                return arr
                    .concat([(
                        <span className="dropdown-header" key={ measure[system].name }>{ measure[system].name } ({ Object.keys(measure[system].units).length })</span>
                    )])
                    .concat(units);
            }
            return arr;
        }, []);

    const obj = _units[value];
    return (
        <React.Fragment>
            <button className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={ isOpen }
                    onClick={ toggle }>
                { obj.plural }{ obj.symbol ? ` (${ obj.symbol })` : '' }{ exponentComponent }
            </button>
            <div className={ classnames('dropdown-menu dropdown-menu-right', { show: isOpen }) }
                    ref={ parentRef }>
                <input type="search"  value={ search } onChange={ (ev) => { setSearch(ev.target.value); } } placeholder="Search..." className="form-control" />
                <span className="dropdown-divider" />
                { units }
            </div>
        </React.Fragment>
    );
}
