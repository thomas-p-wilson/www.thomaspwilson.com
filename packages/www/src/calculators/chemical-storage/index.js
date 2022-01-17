import React from 'react';
import { Wrap } from '../common';
import StandardField from '../../components/calculator/StandardField';
import config from './calculator';
import { Calculator } from '../../components/calculator/Calculator';

const BatteryStoragePage = () => {
    return (
        <div className="App">
            <section className="App-content">
                <div className="row">
                    <div className="col col100">
                        <h2>System Info</h2>
                        <dl className="table">
                            <StandardField field="material" />

                            <StandardField field="nominalChargeCycle" readonly />

                            <StandardField field="capacity" />

                            <StandardField field="nameplateCapacity" readonly />

                            <StandardField field="cellCapacity" />

                            <StandardField field="cellCount" readonly />

                            <StandardField field="cellCost" />

                            <StandardField field="taxes" />

                            <StandardField field="totalCost" readonly />
                        </dl>
                    </div>
                </div>
            </section>
        </div>
    );
}

const BatteryStorage = () => (
    <Calculator config={ config }>
        <BatteryStoragePage />
    </Calculator>
);

export default Wrap(BatteryStorage);
