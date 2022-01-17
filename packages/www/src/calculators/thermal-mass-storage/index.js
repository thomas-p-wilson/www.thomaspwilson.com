import React from 'react';
import MathJax from 'react-mathjax-preview'
import MJ from '../../components/calculator/MJ';
import { Wrap } from '../common';
import StandardField from '../../components/calculator/StandardField';
import config from './calculator';
import { Calculator, useCalculatorContext } from '../../components/calculator/Calculator';

const ThermalMassStoragePage = () => {
    const calculator = useCalculatorContext();
    return (
        <div className="App">
            <section className="App-content">
                <div className="row">
                    <div className="col col100">
                        <h2>System Info</h2>
                        <dl className="table">
                            <StandardField field="capacity" />

                            <StandardField field="material" />

                            <StandardField field="specificHeat" />

                            <StandardField field="absolutePressure" />

                            <StandardField field="boilingPoint" withInfo />
                            <calculator.InfoSection field="boilingPoint">
                                <table>
                                    <tr>
                                        <td>
                                            <MathJax math={ String.raw`
                                                $$
                                                T_2 = \dfrac{LT_1}{L + RT_1\ln\left(\dfrac{P_1}{P_2}\right)}
                                                $$
                                            ` } />
                                        </td>
                                        <td>
                                            <ul>
                                                <li><MJ>$T_1$ = known boiling temperature</MJ></li>
                                                <li><MJ>$P_1$ = pressure where the corresponding $T_1$ is known</MJ></li>
                                                <li><MJ>$T_2$ = the boiling point at the pressure of interest</MJ></li>
                                                <li><MJ>$P_2$ = the vapour pressure of the liquid at the pressure of interest</MJ></li>
                                                <li><MJ>$R$ = the ideal gas constant, in J/(K * mol)</MJ></li>
                                                <li><MJ>$L$ = the heat vaporization of the liquid, in J/mol</MJ></li>
                                                <li><MJ>$\ln$ = the natural logarithm</MJ></li>
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                            </calculator.InfoSection>

                            <StandardField field="depletedTemperature" />

                            <StandardField field="storedEnergy" />

                            <StandardField field="massRequired" />

                            <StandardField field="volumeRequired" />

                            <StandardField field="burstPressure" withInfo />
                            <calculator.InfoSection field="burstPressure">
                                <table>
                                    <tr>
                                        <td>
                                            <MathJax math={ String.raw`
                                                $$
                                                \begin{align}
                                                PV &= nRT
                                                P &= \dfrac{nRT}{V}
                                                \end{align}
                                                $$
                                            ` } />
                                        </td>
                                        <td>
                                            <ul>
                                                <li><MJ>$P$ = the pressureof the gas, in Pa</MJ></li>
                                                <li><MJ>$V$ = the volume of the gas, in $m^3$</MJ></li>
                                                <li><MJ>$n$ = the amount of substance, in mol</MJ></li>
                                                <li><MJ>$R$ = the ideal gas constant, in J / mol * K</MJ></li>
                                                <li><MJ>$T$ = the absolute temperature, in K</MJ></li>
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                            </calculator.InfoSection>
                        </dl>
                    </div>
                </div>
            </section>
        </div>
    );
}

const ThermalMassStorage = () => (
    <Calculator config={ config }>
        <ThermalMassStoragePage />
    </Calculator>
);

export default Wrap(ThermalMassStorage);
