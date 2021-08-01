import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Calculator } from '../../components/calculator/Calculator';
import CalculatorSettingsButton from '../../components/calculator/CalculatorSettingsButton';
import StandardCalculatorLayout from '../../components/calculator/StandardCalculatorLayout';

const CalculatorHeader = ({ config }) => (
    <nav className="navbar navbar-light bg-light">
        <div className="container">
            <a className="mybtn btn btn-link btn-xs" href="/home">
                <i className="fa fa-chevron-left" style={{color: '#52d2ff', fontSize: '2rem'}} />
            </a>
            <h2 style={{margin: '.5rem'}}>{ config._meta.title }</h2>
            <CalculatorSettingsButton />
        </div>
    </nav>
);

const StandardCalculatorPage = ({ config }) => (
    <>
        <Header/>
        <Calculator config={ config }>
            <CalculatorHeader config={ config } />
            <div className="calculators-page">
                <div className="container">
                    <div className="App">
                        { config._meta.description && (<p>{config._meta.description}</p>) }

                        <StandardCalculatorLayout />
                    </div>
                </div>
            </div>
        </Calculator>
        <Footer/>
    </>
);
export default StandardCalculatorPage;
