import React from 'react';
import CheckboxField from '../../../../components/calculator/CheckboxField';
import DimensionlessNumberField from '../../../../components/calculator/DimensionlessNumberField';
import { onChange } from '../../common';
import * as output from './calculated.js';

export default class Retirement extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            age: 20,
            net: 36000,
            expenses: 25000,
            interest: 0.05,
            inflation: 0.032
        };

        this.onChange = onChange().bind(this);
    }

    render() {
        const self = this;
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Retirement Calculator</h1>
                    <p>Get a rough estimate of how much you need to save, and over what period of time, in order to retire at a given time. None of the data you enter here is transmitted anywhere. It all remains on your device and your device alone.</p>
                    <p>Disclaimer: Naturally these are just estimates. Talk to a financial advisor for better, more personalized information.</p>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col100">
                            <h2>Savings Rate</h2>
                            <small>Your savings rate is the percentage of your take-home incoming that remains unspent.</small>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Age (Years)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="age"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Take-home Pay (Yearly)</td>
                                        <td>
                                            <DimensionlessNumberField field="net"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <CheckboxField field="netMatchInflation"
                                                        id="netMatchInflation"
                                                        state={ this.state }
                                                        onChange={ this.onChange } />

                                                <label class="form-check-label" for="netMatchInflation">
                                                    Match inflation?
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Expenses (Yearly)</td>
                                        <td>
                                            <DimensionlessNumberField field="expenses"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                        <td>
                                            <div class="form-check">
                                                <CheckboxField field="expensesMatchInflation"
                                                        id="expensesMatchInflation"
                                                        state={ this.state }
                                                        onChange={ this.onChange } />

                                                <label class="form-check-label" for="expensesMatchInflation">
                                                    Match inflation?
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Savings Rate (Yearly)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="savingsRateNumeric"
                                                    value={ output.savingsRateNumeric(this.state) }
                                                    readonly />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Savings Rate (%)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="savingsRatePercent"
                                                    value={ output.savingsRatePercent(this.state) * 100 }
                                                    readonly />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Existing Savings</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="savings"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Average Interest Rate (%)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="interest"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Average Rate of Inflation (%)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="inflation"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Post-Retirement Safety Margin (%)</td>
                                        <td colSpan="2">
                                            <DimensionlessNumberField field="safety"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col100">
                            <h2>Retirement Profile</h2>
                            <small>Savings progression, and year of retirement</small>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Years Until Retirement</td>
                                        <td>
                                            <DimensionlessNumberField field="years"
                                                    value={ output.chartData(this.state).retirementYear }
                                                    onChange={ this.onChange }
                                                    readonly />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ paddingTop: '2em' }}>
                                            <Line data={{
                                                    labels: Array.from(Array(output.yearsUntilDeath(this.state)).keys()),
                                                    datasets: [
                                                        {
                                                            label: 'Unspent',
                                                            data: output.chartData(this.state).unspent
                                                        },
                                                        {
                                                            label: 'Retirement',
                                                            borderColor: "rgba(0,220,0,0.6)",
                                                            backgroundColor: "rgba(0,220,0,0.3)",
                                                            data: output.chartData(this.state).retirement
                                                        },
                                                        {
                                                            label: 'Retirement (No Inflation)',
                                                            borderColor: "rgba(220,0,0,0.6)",
                                                            backgroundColor: "rgba(220,0,0,0.3)",
                                                            data: output.chartData(this.state).retirementNoInflation
                                                        }
                                                    ]}}
                                                    options={{
                                                        tooltips: {
                                                            mode: 'index',
                                                            callbacks: {
                                                                title: () => (''),
                                                                label: (tooltipItem, data) => {
                                                                    var label = data.datasets[tooltipItem.datasetIndex].label || '';
                                                                    if (label) {
                                                                        label += ': ';
                                                                    }
                                                                    return label + Number(tooltipItem.yLabel).toLocaleString({}, {
                                                                        minimumFractionDigits: 0,
                                                                        maximumFractionDigits: 2
                                                                    });
                                                                }
                                                            }
                                                        },
                                                        scales: {
                                                            yAxes: [{
                                                                ticks: {
                                                                    callback: function(label, index, labels) {
                                                                        return Number(label).toLocaleString({}, {
                                                                            minimumFractionDigits: 0,
                                                                            maximumFractionDigits: 2
                                                                        });
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }}
                                                    plugins={[
                                                        {
                                                            id: 'test',
                                                            afterDatasetsDraw: (chart) => {
                                                                const self = this;
                                                                function draw(year, color) {
                                                                    const element = chart.controller.data.datasets[0]._meta[0].data[year];
                                                                    if (!element) {
                                                                        return;
                                                                    }
                                                                    chart.ctx.beginPath();
                                                                    chart.ctx.beginPath();
                                                                    chart.ctx.moveTo(element._view.x, element._yScale.top);
                                                                    chart.ctx.lineTo(element._view.x, element._yScale.bottom);
                                                                    chart.ctx.strokeStyle=color;
                                                                    chart.ctx.alpha=0.3;
                                                                    chart.ctx.stroke();
                                                                }

                                                                draw(output.chartData(this.state).retirementYear, 'green');
                                                                draw(output.chartData(this.state).retirementNoInflationYear, 'red');
                                                            }
                                                        }
                                                    ]}
                                                    height="250"
                                                    width="100%"
                                                    ref={ (ref) => { this.chart = ref; } } />
                                        </td>
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
