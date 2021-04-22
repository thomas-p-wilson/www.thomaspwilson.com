import React, { useState } from 'react';
import MathJax from 'react-mathjax-preview'
import MJ from '../../components/calculator/MJ';
import config from './config.js';
import { Wrap } from '../common';
import classnames from 'classnames';
import { Calculator, useCalculatorContext } from '../../components/calculator/Calculator';
import { functionOrValue } from '../../utils/helpers';


const getField = (field, { type, unit, readonly: readOnly, options, ...config }, calculator) => {
    const props = { field, unit, readOnly, options };
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

const StandardField = ({ field, hide=false, withInfo=false, ...props }) => {
    const calculator = useCalculatorContext();
    if (functionOrValue(hide, calculator.state)) {
        return null;
    }
    return (
        <>
            <dt>
                { withInfo && (<calculator.InfoButton field={field} />) }
                <span>{ functionOrValue(calculator.config[field].title, calculator.state) }</span>
            </dt>
            <dd>
                { getField(field, { ...calculator.config[field], ...props }, calculator) }
            </dd>
        </>
    );
};

const SystemDetailsTab = ({ onChange, onInfo, state }) => {
    const calculator = useCalculatorContext();
    return (
        <dl className="table">
            <StandardField field="apertureDiameter" withInfo />
            <calculator.InfoSection field="apertureDiameter">The diameter of the objective aperture determines the amount of light allowed to enter the telescope. Larger apertures allow more light to enter the telescope.</calculator.InfoSection>

            <StandardField field="apertureArea" />

            <StandardField field="systemFocalLength" />

            <StandardField field="systemFocalRatio" withInfo />
            <calculator.InfoSection field="systemFocalRatio">
                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                N = \dfrac{f}{D}
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$N$ = the f-number, aka f-stop, f-ratio, or focal ratio</MJ></li>
                                <li><MJ>$f$ = focal length</MJ></li>
                                <li><MJ>$D$ = diameter of entrance pupil (effective aperture)</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </calculator.InfoSection>
        </dl>
    );
}

const PrimaryMirrorDetailsTab = ({ onChange, onInfo, state }) => {
    const calculator = useCalculatorContext();
    return (
        <dl className="table">
            <StandardField field="primaryType" />

            <StandardField field="primaryConstruction" />

            <StandardField field="apertureDiameter" withInfo readonly />
            <calculator.InfoSection field="apertureDiameter">The diameter of the primary reflector is equal to the system aperture diameter.</calculator.InfoSection>

            <StandardField field="primaryFocalLength" withInfo />
            <calculator.InfoSection field="primaryFocalLength">The focal length of the primary mirror. Typcially twice the primary diameter.</calculator.InfoSection>

            <StandardField field="primaryFocalRatio" />

            <StandardField field="primaryEdgeThickness" />

            <StandardField field="primaryBlankVolume" />

            <StandardField field="primaryBlankMass" />

            <StandardField field="primarySagitta" />
            <calculator.InfoSection field="primaryCenterDepth">
                <strong>Spherical Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                h = R - \sqrt{R^2 - a^2}
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$h$ = the depth of the spherical cap</MJ></li>
                                <li><MJ>$a$ = the radius of the dish</MJ></li>
                                <li><MJ>$R$ = the radius of the sphere, equivalent to the focal length of the mirror</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>

                <strong>Paraboloidal Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                h = \dfrac{a^2}{4f}
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$h$ = the height of the dish</MJ></li>
                                <li><MJ>$a$ = the radius of the dish</MJ></li>
                                <li><MJ>$f$ = the focal length of the mirror</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </calculator.InfoSection>

            <StandardField field="primaryDishArea" withInfo />
            <calculator.InfoSection field="primaryDishArea">
                <strong>Spherical Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                A = 2 \pi r h
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$A$ = The area of the curved surface</MJ></li>
                                <li><MJ>$r$ = The radius of the sphere (focal length)</MJ></li>
                                <li><MJ>$h$ = The height of the dish</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>

                <strong>Parabolic Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                A = \pi a^2 + \dfrac{\pi a}{6h^2} [(a^2 + 4h^2)^{3/2} - a^3]
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$A$ = The area of the curved surface</MJ></li>
                                <li><MJ>$h$ = The height of the dish</MJ></li>
                                <li><MJ>$a$ = The radius of the dish</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </calculator.InfoSection>

            <StandardField field="primaryDishVolume" withInfo />
            <calculator.InfoSection field="primaryDishVolume">
                <strong>Spherical Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                V = \dfrac{\pi h}{6} (3a^2 + h^2)
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$V$ = The volume of the dish</MJ></li>
                                <li><MJ>$a$ = The radius of the dish</MJ></li>
                                <li><MJ>$h$ = The height of the dish</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>

                <strong>Parabolic Mirrors</strong>

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                V = \dfrac{1}{2} \pi a^2 h
                                $$
                            ` } />
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$V$ = The volume of the dish</MJ></li>
                                <li><MJ>$a$ = The radius of the dish</MJ></li>
                                <li><MJ>$h$ = The height of the dish</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </calculator.InfoSection>

            <StandardField field="primaryMaterialVolume" withInfo />
            <calculator.InfoSection field="primaryMaterialVolume" hide={({primaryConstruction}) => (primaryConstruction === 'meniscus')}>A rough estimate of the volume of the material used to create the mirror.</calculator.InfoSection>

            <StandardField field="primaryMass" hide={({primaryConstruction}) => (primaryConstruction === 'meniscus')} />

            <StandardField field="primaryRotation" hide={({primaryType, primaryConstruction}) => (primaryType !== 'paraboloidal' || primaryConstruction === 'meniscus')} withInfo />
            <calculator.InfoSection field="primaryRotation" hide={({primaryType, primaryConstruction}) => (primaryType !== 'paraboloidal' || primaryConstruction === 'meniscus')}>
                The angular velocity with which the mirror must be rotated in order to achieve the desired focal length during spin-casting.

                <table>
                    <tr>
                        <td>
                            <MathJax math={ String.raw`
                                $$
                                w = \sqrt{\dfrac{g}{2f}}
                                $$
                            `} />

                            {/* h = \dfrac{1}{2g}w^2r^2 ??? WHERES THIS FROM???? */}
                        </td>
                        <td>
                            <ul>
                                <li><MJ>$w$ represent the angular velocity of the liquid's rotation, in radians per second</MJ></li>
                                <li><MJ>$g$ represent the acceleration due to gravity</MJ></li>
                                <li><MJ>$f$ represent the focal length of the mirror</MJ></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </calculator.InfoSection>
        </dl>
    )
}

const Tabs = ({ tabs, contentProps }) => {
    const [currentTab, setCurrentTab] = useState(tabs[0]);

    return (
        <>
            <ul className="nav nav-pills justify-content-center">
                {
                    tabs.map((t) => (
                        <li className="nav-item" key={t.title}>
                            <button className={classnames('nav-link', {active: t === currentTab})} onClick={() => {setCurrentTab(t)}} href="#">{t.title}</button>
                        </li>
                    ))
                }
            </ul>
            <section className="App-content">
                <currentTab.component {...contentProps} />
            </section>
        </>
    );
}

const tabs = [{
    title: 'System',
    component: SystemDetailsTab,
}, {
    title: 'Primary',
    component: PrimaryMirrorDetailsTab,
}];

@Wrap
class Telescopy extends React.Component {
    render() {
        return (
            <Calculator config={ config }>
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">Telescope Design Parameters</h1>
                        <p>The telescope design parameters calculator is designed to aid me when I'm building telescope components. I intend to expand the feature set of this calculator as time permits and as I find the need...or desire.</p>
                        <p>Currently, the calculator supports telescope designs with the following properties:</p>
                        <ul>
                            <li>Single-mirror configurations (Newtonian). Double-mirror configurations in the works.</li>
                            <li>Spherical or paraboloidal mirrors (where acceptable)</li>
                            <li>Ground blank and meniscus construction. Hex-backed construction in the works.</li>
                            <li>Spin casting calculation</li>
                        </ul>
                    </header>

                    <Tabs tabs={tabs} />
                </div>
            </Calculator>
        );
    }
}

export default Telescopy;
