import React from 'react';
import { Calculator } from '../../components/calculator/Calculator';
import StandardCalculatorLayout from '../../components/calculator/StandardCalculatorLayout';

class StandardCalculator extends React.Component {
    render() {
        return (
            <Calculator config={ this.props.config }>
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">{ this.props.config._meta.title }</h1>
                        { this.props.config._meta.description && (<p>{this.props.config._meta.description}</p>) }
                    </header>

                    <StandardCalculatorLayout />
                </div>
            </Calculator>
        );
    }
}
export default StandardCalculator;
