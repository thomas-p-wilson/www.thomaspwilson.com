import React from 'react';
import config from './config.js';
import { Wrap } from '../common';
import { Calculator, useCalculatorContext } from '../../components/calculator/Calculator';
import { functionOrValue } from '../../utils/helpers';
import { units } from '../../utils/conversion';


const getField = (field, { type, unit, exponent, readonly: readOnly, options, ...config }, calculator) => {
    const props = { field, unit, exponent, readOnly, options };
    if (type === 'number' && unit) {
        return (<calculator.NumberFieldWithUnit { ...props } />);
    }
    if (type === 'number') {
        return (<calculator.NumberField { ...props } />);
    }
    if (options) {
        return (<calculator.SelectField { ...props } />)
    }
}

const StandardField = ({ field, hide=false, withInfo=true, info=null, ...props }) => {
    const calculator = useCalculatorContext();
    if (functionOrValue(hide, calculator.state)) {
        return null;
    }
    return (
        <>
            <dt>
                { (withInfo && calculator.config[field].info) && (<calculator.InfoButton field={field} />) }
                <span>{ functionOrValue(calculator.config[field].title, calculator.state) }</span>
            </dt>
            <dd>
                { getField(field, { ...calculator.config[field], ...props }, calculator) }
            </dd>
            { (withInfo && (info || calculator.config[field].info)) && (<calculator.InfoSection field={field}>{ info || calculator.config[field].info }</calculator.InfoSection>) }
        </>
    );
};

const StandardFieldList = ({ fields }) => {
    const calculator = useCalculatorContext();
    const _fields = fields || Object.keys(calculator.config);
    return (
        <dl className="table">
        {
            _fields.map((key) => (
                <StandardField field={key} key={key} />
            ))
        }
        </dl>
    );
}

const StandardCalculator = () => {
    const calculator = useCalculatorContext();

    // if (calculator.config._meta && calculator.config._meta.tabs) {
    //
    // }
console.log('Meta: ', calculator.config._meta);
    if (calculator.config._meta && calculator.config._meta.sections) {
        return Object.keys(calculator.config._meta.sections).map((key) => (
            <section key={key}>
                <h2>{calculator.config._meta.sections[key].title}</h2>

                <StandardFieldList fields={ calculator.config._meta.sections[key].fields } />
            </section>
        ));
    }

    return (<StandardFieldList />);
}

@Wrap
class Telescopy extends React.Component {
    render() {
        console.log('Units: ', units);
        return (
            <Calculator config={ config }>
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">Woodgas Energy Conversion</h1>
                    </header>

                    <StandardCalculator />
                </div>
            </Calculator>
        );
    }
}

export default Telescopy;
