import React from 'react';
import { useCalculatorContext } from '../../components/calculator/Calculator';
import { functionOrValue } from '../../utils/helpers';

class ErrorWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(error) {
        console.log('Error: ', error);
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true
        };
    }

    render() {
        if (this.state.hasError) {
            return (<div/>);
        }

        return (
            this.props.children
        );
    }
}

export const IgnoreErrors = (Wrapped) => (props) => (
    <ErrorWrapper {...props}>
        <Wrapped {...props} />
    </ErrorWrapper>
)

export const getField = (field, { type, unit, exponent, readonly: readOnly, options, ...config }, calculator) => {
    const props = { field, unit, exponent, readOnly, options };
    if (type === 'number' && unit) {
        return (<calculator.NumberFieldWithUnit { ...props } />);
    }
    if (type === 'number') {
        return (<calculator.NumberField { ...props } />);
    }
    if (type === 'percent') {
        return (<calculator.PercentField { ...props } />);
    }
    if (options) {
        return (<calculator.SelectField { ...props } />)
    }
}

const StandardField = IgnoreErrors(({ field, hide=false, withInfo=null, info=null, ...props }) => {
    const calculator = useCalculatorContext();
    // if (functionOrValue(hide, calculator.state)) {
    //     return null;
    // }
    return (
        <>
            <dt>
                { (withInfo || (!!calculator.config[field].info && withInfo !== false)) && (<calculator.InfoButton field={field} />) }
                <span>{ functionOrValue(calculator.config[field].title, calculator) }</span>
            </dt>
            <dd>
                { getField(field, { ...calculator.config[field], ...props }, calculator) }
            </dd>
            { (withInfo && (info || calculator.config[field].info)) && (<calculator.InfoSection field={field}>{ info || calculator.config[field].info }</calculator.InfoSection>) }
        </>
    );
});
export default StandardField;
