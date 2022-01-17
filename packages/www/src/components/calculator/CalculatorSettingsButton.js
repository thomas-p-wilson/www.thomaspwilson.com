/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import React, { useState } from 'react';
import Modal from '../Modal';
import { useCalculatorContext } from './Calculator';

const CalculatorSettingsButton = () => {
    const [open, setOpen] = useState(false);
    const calculator = useCalculatorContext();

    return (
        <>
            <i className="fa fa-cog" style={{color: '#52d2ff', fontSize: '2rem'}} onClick={() => {setOpen(true)}} />
            { open && (
                <Modal onClose={() => {setOpen(false);}}>
                    <p>Change settings for the entire calculator, including precision, units of measure, etc</p>

                    <dl className="table">
                        <dt>Scale</dt>
                        <dd><calculator.NumberField field="scale" setting /></dd>
                    </dl>
                </Modal>
            ) }
        </>
    )
};
export default CalculatorSettingsButton;
