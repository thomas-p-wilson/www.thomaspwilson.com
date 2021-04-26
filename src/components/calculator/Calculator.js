import React, { useContext } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import convert from '../../utils/conversion';
import memoizeOne from 'memoize-one';
import NumberField from './controls/NumberField';
import NumberFieldWithUnit from './controls/NumberFieldWithUnit';
import SelectField from './controls/SelectField';
import OldInfo from './Info';
import OldInfoSection from './InfoSection';
import { functionOrValue } from '../../utils/helpers';

export const CalculatorContext = React.createContext({});

export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext)
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider')
  }
  return context
};

const InfoButton = (props) => {
  const calculator = useCalculatorContext();
  return (
    <OldInfo { ...props } onClick={ calculator.onInfo } />
  );
};

const InfoSection = ({ field, hide, ...props }) => {
  const calculator = useCalculatorContext();
  if (functionOrValue(hide, calculator.state)) {
    return null;
  }
  return (
    <OldInfoSection field={ field } show={ calculator.state.info === field } { ...props } />
  );
};

const produceProviderValue = memoizeOne((state, config, calculate, onChange, onInfo, getDisplayUnit, getRawValue) => ({
  state,
  config,
  calculate,
  onChange,
  onInfo,
  getDisplayUnit,
  getRawValue,
  // Convenience field-building
  NumberField,
  NumberFieldWithUnit,
  SelectField,

  InfoButton,
  InfoSection,
}));


export const normalizeValue = (value) => {
    if (typeof value === 'undefined') {
        return 0;
    }
    if (Number.isNaN(value)) {
        return 0;
    }
    if (typeof value === 'string') {
        return `${ value }`.replace(/[^\d.-]/g, '');
    }
    return value;
}

/**
 * The Calculator handles all state for the elements contained within, and
 * provides facilities for producing controls, displaying data, handling
 * contextual information, etc.
 */
export class Calculator extends React.Component {
  constructor(props) {
    super(props);
    console.log('Keys: ', Object.keys(props.config));
    const defaultState = Object.keys(props.config)
        .reduce((res, key) => {
          if (props.config[key].default) {
            res[key] = props.config[key].default;
          }
          return res;
        }, {});
    this.state = defaultState || {};
    this.config = props.config;

    this.onChange = this.onChange.bind(this);
    this.onInfo = this.onInfo.bind(this);
    this.getDisplayUnit = this.getDisplayUnit.bind(this);
    this.getRawValue = this.getRawValue.bind(this);
    this.calculate = this.calculate.bind(this);
  }

  onChange(ev) {
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

  onInfo(ev) {
    let field = ev.target.getAttribute('data-field');
    if (!field) {
      field = ev.target.parentElement.getAttribute('data-field');
    }
    ev.persist();
    this.setState((state) => {
      if (state.info === field) {
        return { info: null };
      }
      return { info: field };
    });
  }

  getDisplayUnit(field, fallback) {
    return (this.state.displayUnits && this.state.displayUnits[field]) || fallback;
  }

  // TODO Remove explicit in favour of the `explicit || getRawValue` syntax
  getRawValue(field, explicit, fallback) {
    return explicit || get(this.state, field) || fallback;
  }

  calculate(field) {
    console.log('Calculate field ', field);
    console.log('  Has calculator? ', this.props.config[field])
    if (this.props.config[field] && this.props.config[field].calculate) {
      return this.props.config[field].calculate(this.state);
    }
    return null;
  }

  render() {
    return (
      <CalculatorContext.Provider value={ produceProviderValue(this.state, this.props.config, this.calculate, this.onChange, this.onInfo, this.getDisplayUnit, this.getRawValue) }>
        { this.props.children }
      </CalculatorContext.Provider>
    );
  }
}



