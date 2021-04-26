import React from 'react';
import { useCalculatorContext } from '../../components/calculator/Calculator';
import { functionOrValue } from '../../utils/helpers';

export const getField = (field, { type, unit, exponent, readonly: readOnly, options, ...config }, calculator) => {
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
export default StandardField;
