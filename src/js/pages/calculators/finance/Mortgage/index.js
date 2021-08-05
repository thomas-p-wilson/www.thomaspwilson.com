import React from 'react';
import memoizeOne from 'memoize-one';
// import { isEqual } from 'lodash/es6';
import classnames from 'classnames';
import DimensionlessNumberField from '../../../../components/calculator/DimensionlessNumberField';
import { onChange } from '../../common';
import * as output from './calculated.js';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default class Mortgage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            total: 350000,
            downpayment: 35000,
            amortizationYears: 25,
            term: 5,
            terms: [
                {
                    interest: 0.0267
                }
            ],
            frequency: 'biWeekly'
        };

        this.onChange = onChange().bind(this);
        this.getSchedule = memoizeOne(output.schedule, isEqual).bind(this);
    }

    renderTermsComparison(schedule) {
        return Array.from({
            length: Math.max.apply(null, Object.keys(schedule)
                .map((frequency) => Object.keys(schedule[frequency].terms).length))
        })
            .map((_, i) => ([
                (
                    <tr className={ classnames({ stripe: i % 2 == 0 }) }>
                        <td rowSpan="4" style={{ textAlign: 'center' }}>Term { i + 1 }</td>
                        <td>Interest Rate</td>
                        <td colSpan="6">{ schedule.monthly.terms[i].rate }</td>
                    </tr>
                ),
                (
                    <tr className={ classnames({ stripe: i % 2 == 0 }) }>
                        <td>Payment Amount</td>
                        <td>{ formatter.format(schedule.monthly.terms[i].amount) }</td>
                        <td>{ formatter.format(schedule.semiMonthly.terms[i].amount) }</td>
                        <td>{ formatter.format(schedule.biWeekly.terms[i].amount) }</td>
                        <td>{ formatter.format(schedule.acceleratedBiWeekly.terms[i].amount) }</td>
                        <td>{ formatter.format(schedule.weekly.terms[i].amount) }</td>
                        <td>{ formatter.format(schedule.acceleratedWeekly.terms[i].amount) }</td>
                    </tr>
                ),
                (
                    <tr className={ classnames({ stripe: i % 2 == 0 }) }>
                        <td>Term Interest</td>
                        <td>{ formatter.format(schedule.monthly.terms[i].interest) }</td>
                        <td>{ formatter.format(schedule.semiMonthly.terms[i].interest) }</td>
                        <td>{ formatter.format(schedule.biWeekly.terms[i].interest) }</td>
                        <td>{ formatter.format(schedule.acceleratedBiWeekly.terms[i].interest) }</td>
                        <td>{ formatter.format(schedule.weekly.terms[i].interest) }</td>
                        <td>{ formatter.format(schedule.acceleratedWeekly.terms[i].interest) }</td>
                    </tr>
                ),
                (
                    <tr className={ classnames({ stripe: i % 2 == 0 }) }>
                        <td>Term Principal</td>
                        <td>{ formatter.format(schedule.monthly.terms[i].principal) }</td>
                        <td>{ formatter.format(schedule.semiMonthly.terms[i].principal) }</td>
                        <td>{ formatter.format(schedule.biWeekly.terms[i].principal) }</td>
                        <td>{ formatter.format(schedule.acceleratedBiWeekly.terms[i].principal) }</td>
                        <td>{ formatter.format(schedule.weekly.terms[i].principal) }</td>
                        <td>{ formatter.format(schedule.acceleratedWeekly.terms[i].principal) }</td>
                    </tr>
                )
            ]));
    }

    render() {
        const schedule = this.getSchedule(this.state.total, this.state.downpayment, this.state.amortizationYears, this.state.terms, this.state.term, this.state.frequency);

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="fancy-heading"><span>Mortgage Calculator</span></h1>
                    <p>Get a rough estimate the particulars of a mortage, including payment amount, interest, frequency savings, etc. I do not collect <em>any</em> of this information. I will never know what you entered here.</p>
                    <p>Disclaimer: Naturally these are just estimates. Talk to a financial advisor for better, more personalized information.</p>
                </header>
                <section className="App-content">
                    <div className="row">
                        <div className="col col50">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Building Value</td>
                                        <td>
                                            <DimensionlessNumberField field="total"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Downpayment</td>
                                        <td>
                                            <DimensionlessNumberField field="downpayment"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Downpayment (%)</td>
                                        <td>
                                            <DimensionlessNumberField field="downpaymentpercentage"
                                                    value={ output.downpaymentPercentage(this.state) }
                                                    readonly />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Original Principal</td>
                                        <td>
                                            <DimensionlessNumberField field="amount"
                                                    value={ output.mortgageAmount(this.state) }
                                                    readonly />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Amortization Period</td>
                                        <td>
                                            <DimensionlessNumberField field="amortizationYears"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                    {/*<tr>
                                        <td>Payment Frequency</td>
                                        <td>
                                            <SelectField field="frequency"
                                                    onChange={ (ev) => {
                                                        this.setState((state) => ({
                                                            frequency: ev.target.value
                                                        }))
                                                    } }
                                                    options={
                                                        Object.keys(output.handlers)
                                                            .reduce((res, key) => {
                                                                res[key] = output.handlers[key].title;
                                                                return res;
                                                            }, {})
                                                    }
                                                    state={ this.state } />
                                        </td>
                                    </tr>*/}
                                    <tr>
                                        <td>Term (Years)</td>
                                        <td>
                                            <DimensionlessNumberField field="term"
                                                    state={ this.state }
                                                    onChange={ this.onChange } />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col col50">
                            {
                                Array.from({ length: Math.min(this.state.terms.length + 1, Math.ceil(this.state.amortizationYears / this.state.term)) })
                                    .map((_, i) => (
                                        <div>
                                            <h5>Term { i + 1 }</h5>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td>Interest Rate</td>
                                                        <td>
                                                            <DimensionlessNumberField field={ `terms[${ i }].interest` }
                                                                    defaultValue={ this.state.terms[Math.max(i - 1, 0)].interest }
                                                                    state={ this.state }
                                                                    onChange={ this.onChange } />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col50">
                            <h2 className="fancy-heading"><span>Side-By-Side Comparison</span></h2>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="sticky bg-white" />
                                        <th className="sticky bg-white" />
                                        <th className="sticky bg-white">Monthly</th>
                                        <th className="sticky bg-white">Semi-Monthly</th>
                                        <th className="sticky bg-white">Bi-Weekly</th>
                                        <th className="sticky bg-white">Accelerated Bi-Weekly</th>
                                        <th className="sticky bg-white">Weekly</th>
                                        <th className="sticky bg-white">Accelerated Weekly</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="lightGreenBg">
                                        <td />
                                        <td>Number of Payments</td>
                                        {/* Subtract 1 because we have the first record which does not represent a payment */}
                                        <td>{ schedule.monthly.schedule.length - 1 }</td>
                                        <td>{ schedule.semiMonthly.schedule.length - 1 }</td>
                                        <td>{ schedule.biWeekly.schedule.length - 1 }</td>
                                        <td>{ schedule.acceleratedBiWeekly.schedule.length - 1 }</td>
                                        <td>{ schedule.weekly.schedule.length - 1 }</td>
                                        <td>{ schedule.acceleratedWeekly.schedule.length - 1 }</td>
                                    </tr>
                                    <tr className="lightGreenBg">
                                        <td />
                                        <td>Amortization</td>
                                        <td>{ schedule.monthly.amortization }</td>
                                        <td>{ schedule.semiMonthly.amortization }</td>
                                        <td>{ schedule.biWeekly.amortization }</td>
                                        <td>{ schedule.acceleratedBiWeekly.amortization }</td>
                                        <td>{ schedule.weekly.amortization }</td>
                                        <td>{ schedule.acceleratedWeekly.amortization }</td>
                                    </tr>
                                    <tr className="lightGreenBg">
                                        <td />
                                        <td>Amortization Interest</td>
                                        <td>{ formatter.format(schedule.monthly.interest) }</td>
                                        <td>{ formatter.format(schedule.semiMonthly.interest) }</td>
                                        <td>{ formatter.format(schedule.biWeekly.interest) }</td>
                                        <td>{ formatter.format(schedule.acceleratedBiWeekly.interest) }</td>
                                        <td>{ formatter.format(schedule.weekly.interest) }</td>
                                        <td>{ formatter.format(schedule.acceleratedWeekly.interest) }</td>
                                    </tr>
                                    <tr className="lightGreenBg">
                                        <td />
                                        <td>Interest Saved</td>
                                        <td>$0.00</td>
                                        <td>{ formatter.format(schedule.monthly.interest - schedule.semiMonthly.interest) }</td>
                                        <td>{ formatter.format(schedule.monthly.interest - schedule.biWeekly.interest) }</td>
                                        <td>{ formatter.format(schedule.monthly.interest - schedule.acceleratedBiWeekly.interest) }</td>
                                        <td>{ formatter.format(schedule.monthly.interest - schedule.weekly.interest) }</td>
                                        <td>{ formatter.format(schedule.monthly.interest - schedule.acceleratedWeekly.interest) }</td>
                                    </tr>

                                    { this.renderTermsComparison(schedule) }
                                </tbody>
                            </table>


                            <h2 className="fancy-heading"><span>Payment Schedule</span></h2>
                            <ul className="tab-list">
                                {
                                    Object.keys(output.handlers)
                                        .map((frequency) => (
                                            <li><a onClick={ () => { this.setState({ frequency }); } } className="btn">{ output.handlers[frequency].title }</a></li>
                                        ))
                                }
                            </ul>
                            <table>
                                <thead>
                                    <tr>
                                        <th className="sticky bg-white">Payment</th>
                                        <th className="sticky bg-white">Interest Rate</th>
                                        <th className="sticky bg-white">Payment</th>
                                        <th className="sticky bg-white">Interest Amount</th>
                                        <th className="sticky bg-white">Principal Amount</th>
                                        <th className="sticky bg-white">Prepayment</th>
                                        <th className="sticky bg-white">Principal Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        schedule[this.state.frequency].schedule
                                            .map(({ rate, amount, interest, principal, balance }, i) => {
                                                const result = [];
                                                if (output.handlers[this.state.frequency].isNewTerm(i, this.state.term)) {
                                                    result.push(
                                                        <tr>
                                                            <td colSpan="7">Term { output.handlers[this.state.frequency].getTerm(i, this.state.term) }</td>
                                                        </tr>
                                                    );
                                                }
                                                if (output.handlers[this.state.frequency].isNewYear(i)) {
                                                    result.push(
                                                        <tr>
                                                            <td colSpan="7">Year { output.handlers[this.state.frequency].getYear(i) }</td>
                                                        </tr>
                                                    );
                                                }
                                                result.push(
                                                    <tr>
                                                        <td>{ i }</td>
                                                        <td>{ rate }</td>
                                                        <td>{ formatter.format(amount) }</td>
                                                        <td>{ formatter.format(interest) }</td>
                                                        <td>{ formatter.format(principal) }</td>
                                                        <td>{ formatter.format(0) }</td>
                                                        <td>{ formatter.format(balance) }</td>
                                                    </tr>
                                                );
                                                return result;
                                            })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
