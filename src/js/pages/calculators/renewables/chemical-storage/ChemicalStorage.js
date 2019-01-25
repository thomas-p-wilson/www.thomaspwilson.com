import React, { Component } from 'react';
import './App.css';
import * as output from './calculated.js';
import MathJax from 'react-mathjax-preview'

const defaults = {
	minimumCapacity: 90000, // Wh
	batteryType: 'lion'
}

class Photovoltaic extends Component {
    //
    // React Lifecycle
    //
    constructor(props) {
        super(props);

        this.state = {
            // Variables
            apertureRadius: 60.96, // cm
            systemFocalLength: 3,
            primaryType: 'paraboloid',
            primaryFocalLength: 2,
            primaryThickness: 5 // cm
        };

        this.handleChange = this.handleChange.bind(this);
        this.milesToMetres = this.milesToMetres.bind(this);
        this.metresToMiles = this.metresToMiles.bind(this);
        this.mphToMps = this.mphToMps.bind(this);
        this.mpsToMph = this.mpsToMph.bind(this);
    }

    componentDidMount() {
        this.calculateOutput();
    }

    //
    // Input Handling
    //

    handleChange(event) {
        //update state with new value
        let state = event.target.getAttribute("data-var");
        this.setState({[state]: event.target.value}, this.calculateOutput);
    }

    calculateOutput(){
        //uses special form of set state acceptinga  function so that asynchronous
        //state updates don't screw things up.
        this.setState((prevState, props)=>({dragComponent:               output.DragComponent(prevState)}));
        this.setState((prevState, props)=>({rollingResistanceComponent:  output.RollingResistanceComponent(prevState)}));
        this.setState((prevState, props)=>({roadGradientComponent:       output.RoadGradientComponent(prevState)}));
        this.setState((prevState, props)=>({inertialComponent:           output.InertialComponent(prevState)}));
        this.setState((prevState, props)=>({battCapWS:                   output.BattCapWS(prevState)}));
        this.setState((prevState, props)=>({battCapKWH:                  output.BattCapKWH(prevState)}));
        this.setState((prevState, props)=>({weight:                      output.Weight(prevState)}));
        this.setState((prevState, props)=>({cost:                        output.Cost(prevState)}));
    }
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Telescope Design Parameters</h1>
                    <p>The telescope design parameters calculator is designed to aid me when I'm building telescope components. I intend to expand the feature set of this calculator as time permits and as I find the need...or desire.</p>
                    <p>Currently, the calculator supports telescope designs with the following properties:</p>
                    <ul>
                        <li>Newtonian (single-mirror), Cassegrain (twin-mirror) types</li>
                        <li>Spherical or paraboloidal mirrors (where acceptable)</li>
                        <li>Spin casting calculation</li>
                    </ul>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>System Info</h2>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Minimum Capacity</td>
                                        <td><VariableInput var="minimumCapacity" handleChange={ this.handleChange } state={ this.state } /></td>
                                    </tr>
                                    <tr>
                                        <td>Battery Type</td>
                                        <td><VariableInput var="batteryType" handleChange={ this.handleChange } state={ this.state } /></td>
                                    </tr>
                                    <tr>
                                        <td>Nameplate Capacity</td>
                                        <td>{ this.state.nameplateCapacity }Wh</td>
                                    </tr>
                                    <tr>
                                        <td>Battery Capacity</td>
                                        <td><VariableInput var="batteryCapacity" handleChange={ this.handleChange } state={ this.state } /></td>
                                    </tr>
                                    <tr>
                                        <td>Batteries Required</td>
                                        <td>{ this.state.batteriesRequired }</td>
                                    </tr>
                                    <tr>
                                        <td>Battery Cost</td>
                                        <td><VariableInput var="batteryCost" handleChange={ this.handleChange } state={ this.state } /></td>
                                    </tr>
                                    <tr>
                                        <td>Total Cost</td>
                                        <td>{ this.state.totalCost }</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

class VariableInput extends Component{
    render() {
        let val = this.props.state[this.props.var];
        return (
            <input type="number" data-var={this.props.var} onChange={this.props.handleChange} value={val}></input>
        )
    }
}

export default App;