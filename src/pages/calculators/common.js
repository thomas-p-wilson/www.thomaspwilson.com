import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import convert from '../../utils/conversion';

export const normalizeValue = (value) => {
    if (typeof value === 'undefined') {
        return 0;
    }
    if (value === NaN) {
        return 0;
    }
    if (typeof value === 'string') {
        return `${ value }`.replace(/[^\d.-]/g, '');
    }
    return value;
}

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