import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Calculator } from '../../components/calculator/Calculator';
import StandardCalculatorLayout from '../../components/calculator/StandardCalculatorLayout';

const StandardCalculatorPage = ({ config }) => (
    <>
        <Header/>
        <div className="calculators-page">
            <div className="container">
                <Calculator config={ config }>
                    <div className="App">
                        <header className="App-header">
                            <h1 className="App-title">{ config._meta.title }</h1>
                            { config._meta.description && (<p>{config._meta.description}</p>) }
                        </header>

                        <StandardCalculatorLayout />
                    </div>
                </Calculator>
            </div>
        </div>
        <Footer/>
    </>
);
export default StandardCalculatorPage;
