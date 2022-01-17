import React, { useContext } from 'react';
import update from 'immutability-helper';
import get from 'lodash/get';
import { convert } from '@thomaspwilson/react-calculator';
import NumberField from './controls/NumberField';
import NumberFieldWithUnit from './controls/NumberFieldWithUnit';
import SelectField from './controls/SelectField';
import PercentField from './controls/PercentField';
import OldInfo from './Info';
import OldInfoSection from './InfoSection';
import { functionOrValue } from '../../utils/helpers';
import { bindMethods } from '../../utils/class';

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
  if (functionOrValue(hide, calculator.getCurrentState())) {
    return null;
  }
  return (
    <OldInfoSection field={ field } show={ calculator.isInfoOpen(field) } { ...props } />
  );
};

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

const produceProviderValue = ({ config, onChange, onChangeUnit, onChangeSetting, onInfo, calculate, getUnit, getValue, getSetting, isInfoOpen, setInfoOpen, getCurrentState }) => ({
  config,
  onChange,
  onChangeUnit,
  onChangeSetting,
  onInfo,
  calculate,
  getUnit,
  getValue,
  getSetting,
  getCurrentState,
  isInfoOpen,
  setInfoOpen,
  NumberField,
  NumberFieldWithUnit,
  SelectField,
  PercentField,
  InfoButton,
  InfoSection,
})

/**
 * The Calculator handles all state for the elements contained within, and
 * provides facilities for producing controls, displaying data, handling
 * contextual information, etc.
 */
export class Calculator extends React.Component {
  constructor(props) {
    super(props);
    const defaults = Object.keys(props.config)
      .reduce((res, key) => {
        if (props.config[key].default) {
          res[key] = props.config[key].default;
        }
        return res;
      }, {});
    this.state = {
      /**
       * The default values provided in the calculator configuration.
       */
      defaults,
      /**
       * Values that are explicitly set via the form.
       */
      values: {},
      units: {},
      info: {},
      settings: {
        scale: 2,
        ...get(props.config._meta, 'settings', {}),
      },
    };
    this.config = props.config;

    bindMethods(this, [
      'getDefault', 'getValue', 'setValue', 'getCacheValue', 'setCacheValue',
      'getUnit', 'getBaseUnit', 'setUnit', 'getSetting',
      'setSetting', 'isInfoOpen', 'setInfoOpen', 'onChange', 'onChangeUnit',
      'onInfo', 'getCurrentState', 'calculate', 'onChangeSetting', 'update',
    ]);
  }

  //
  // Getters/Setters
  //
  update(obj) {
    this.setState((state) => {
      console.log('State: ', state);
      console.log('Object: ', obj);
      return update(state, obj)
    });
  }
  getDefault(field) {
    return this.state.defaults[field];
  }

  getValue(field) {
    return this.state.values[field];
  }

  setValue(field, value) {
    this.update({ values: { [field]: { $set: value } }, cache: { $set: {} } });
    // this.setState((state) => ({
    //   values: update(this.state.values, { [field]: { $set: value } }),
    //   cache: {}
    // }));
    // this.setState(update(this.state.values, { [field]: { $set: value }, cache: { $set: {} } } ));
  }

  getUnit(field) {
    return get(this.state.units, field, this.getBaseUnit(field));
  }

  getBaseUnit(field) {
    return get(this.config, `${field}.unit`);
  }

  setUnit(field, unit) {
    this.update({ units: { [field]: { $set: unit } } });
    // this.setState((state) => ({
    //   units: update(this.state.units, { [field]: { $set: unit } })
    // }));
    // this.setState(update(this.state, { units: { [field]: { $set: unit } } } ));
  }

  getSetting(name, fallback) {
    return get(this.state.settings, name, fallback);
  }

  setSetting(name, value) {
    console.log('Settings: ', this.state.settings)
    this.update({ settings: { [name]: { $set: value } } });
    // this.setState((state) => ({
    //   settings: update(this.state.settings, { [name]: { $set: value } })
    // }));
    // this.setState(update(this.state, { settings: { [name]: { $set: value } } } ));
  }

  isInfoOpen(field) {
    return this.state.info === field;
  }

  //
  // Event Handling
  //
  onChange(ev) {
    const field = ev.target.name;

    if (ev.target.type === 'checkbox') {
      this.setValue(field, ev.target.checked);
      return;
    }
    if (ev.target.type === 'select-one') {
      this.setValue(field, ev.target.value);
      return;
    }

    const baseUnit = this.getBaseUnit(field);
    const currentUnit = this.getUnit(field);
    const exponent = this.config[field].exponent || 1;
    const normalized = normalizeValue(ev.target.value);
    if (baseUnit !== currentUnit) {
      this.setValue(field, convert(normalized, exponent || 1).from(currentUnit).to(baseUnit));
    } else {
      this.setValue(field, normalized);
    }
  }

  onChangeUnit(ev) {
    this.setUnit(ev.target.name, ev.target.value);
  }

  onChangeSetting(ev) {
    console.log(`Setting: ${ev.target.name} -> ${ev.target.value}`)
    this.setSetting(ev.target.name, ev.target.value);
  }

  onInfo(ev) {
    let field = ev.target.getAttribute('data-field');
    if (!field) {
      field = ev.target.parentElement.getAttribute('data-field');
    }
    ev.persist();
    this.setState((state) => {
      if (state.info === field) {
        return { info: '' };
      }
      return { info: field };
    });
  }

  getCurrentState() {
    return {
      // Add calculated getters
      ...Object.keys(this.config)
        .filter((field) => (this.config[field].calculate))
        .reduce((res, field) => {
          Object.defineProperty(res, field, { get: () => (this.calculate(field)) });
          return res;
        }, {}),

      // Add default values
      ...this.state.defaults,

      // Add explicit values,
      ...this.state.values,
    };
  }

  /**
   * Get the calculated value for the given field. This is the value that should
   * be displayed. The following sources of information are evaluated in the
   * given order:
   * 1. Explicit values
   * 2. Calculator function
   * 3. Default values
   */
  calculate(field) {
    // Explicit value
    if (Object.hasOwnProperty.call(this.state.values, field)) {
      return this.state.values[field];
    }

    // Calculator function
    if (this.props.config[field] && Object.hasOwnProperty.call(this.props.config[field], 'calculate')) {
      return this.props.config[field].calculate(this.getCurrentState());
    }

    // Default value
    if (Object.hasOwnProperty.call(this.state.defaults, field)) {
      return this.state.defaults[field];
    }

    return null;
  }

  render() {
    return (
      <CalculatorContext.Provider value={ produceProviderValue(this) }>
        { this.props.children }
      </CalculatorContext.Provider>
    );
  }
}



