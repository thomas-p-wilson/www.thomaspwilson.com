import React, { Suspense } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import StandardCalculator from './StandardCalculator';

const StandardCalculatorPage = ({ pageContext }) => {
    return (
        <>
            <Header/>
            <div className="calculators-page">
                <div className="container">
                    <Suspense fallback={<div>Loading...</div>}>
                        <StandardCalculator config={ pageContext.config.default || pageContext.config } />
                    </Suspense>
                </div>
            </div>
            <Footer/>
        </>
    );
}
export default StandardCalculatorPage;
