import React from 'react';
import { useCalculatorContext } from '../../components/calculator/Calculator';
import StandardFieldList from './StandardFieldList';

const StandardCalculatorLayout = () => {
    const calculator = useCalculatorContext();

    // if (calculator.config._meta && calculator.config._meta.tabs) {
    //
    // }

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
export default StandardCalculatorLayout;
