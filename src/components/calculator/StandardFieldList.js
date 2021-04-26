import React from 'react';
import { useCalculatorContext } from '../../components/calculator/Calculator';
import StandardField from './StandardField';

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
export default StandardFieldList;