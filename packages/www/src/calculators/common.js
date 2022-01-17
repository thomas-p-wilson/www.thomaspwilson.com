import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import { convert } from '@thomaspwilson/react-calculator';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const onChange = () => {
    return function onChange(ev) {
        let field = ev.target.getAttribute('data-field');

        if (ev.target.type === 'checkbox') {
            this.setState((state) => (set(cloneDeep(state), field, ev.target.checked)));
            return;
        }
        if (ev.target.type === 'select-one') {
            this.setState((state) => (set(cloneDeep(state), field, ev.target.value)));
            return;
        }

        let unit = ev.target.getAttribute('data-unit');
        if (unit) {
            this.setState((state) => ({
                displayUnits: { ...state.displayUnits, [field]: unit }
            }));
            return;
        }

        let baseUnit = ev.target.getAttribute('data-base-unit');
        let currentUnit = ev.target.getAttribute('data-current-unit');
        let exponent = ev.target.getAttribute('data-exponent');
        let normalized = normalizeValue(ev.target.value);
        if (baseUnit !== currentUnit) {
            this.setState((state) => (set(cloneDeep(state), field, convert(normalized, exponent || 1).from(currentUnit).to(baseUnit))));
        } else {
            this.setState((state) => (set(cloneDeep(state), field, normalized)));
        }
    }
}

/**
 * Wrap calculator pages with the header and footer.
 */
export const Wrap = (Wrapped) => () => (
    <div>
        <Header/>
        <div className="calculators-page">
            <div className="container">
                <Wrapped />
            </div>
        </div>
        <Footer/>
    </div>
);
