// import cloneDeep from 'lodash-es/cloneDeep';
// import set from 'lodash-es/set';
import update from 'immutability-helper';
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

        const change = (field, value) => {
            this.setState((state) => (
                update(state, {
                    [field]: {
                        $set: value,
                    },
                })
            ));
        }

        if (ev.target.type === 'checkbox') {
            change(field, ev.target.checked);
            return;
        }
        if (ev.target.type === 'select-one') {
            change(field, ev.target.value);
            return;
        }

        let unit = ev.target.getAttribute('data-unit');
        if (unit) {
            change(`displayUnits.${field}`, unit);
            return;
        }

        let baseUnit = ev.target.getAttribute('data-base-unit');
        let currentUnit = ev.target.getAttribute('data-current-unit');
        let exponent = ev.target.getAttribute('data-exponent');
        let normalized = normalizeValue(ev.target.value);
        if (baseUnit !== currentUnit) {
            change(field, convert(normalized, exponent || 1).from(currentUnit).to(baseUnit));
        } else {
            change(field, normalized);
        }
    }
}