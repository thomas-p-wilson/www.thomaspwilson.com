import React, { useContext, useState } from 'react';
import Overlay from './Overlay';
import NumberField from './NumberField';
import UnitSelector from './UnitSelector';
import { DataContext } from '../../calculators/helpers';
import * as length from '../../measures/length';

export class SettingsModal extends React.Component {
	constructor() {
		super();

		this.close = this.close.bind(this);

        document.addEventListener('mousedown', this.close, false);
        document.addEventListener('keyup', this.close, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.close, false);
        document.removeEventListener('keyup', this.close, false);
    }

    close(ev) {
        if (ev.type === 'mousedown' && !React.findDOMNode(this).contains(ev.target)) {
            this.props.onClose();
        }
        if (ev.type === 'keyup' && ev.key === 'Escape') {
        	this.props.onClose();
        }
    }

	render() {
		const { slug, data = {}, update } = useContext(DataContext);
		return (
			<div className="modal">
				<div className="modal-header">
					<h2>Global Settings</h2>
				</div>
				<div className="modal-body">
					<ul className="calc-box">
						<li>
							<label>Scale</label>
							<NumberField name="scale"
									value={ data._settings.scale }
									onChange={ (ev) => {
										const result = JSON.parse(JSON.stringify(data)) || {};
										result._settings.scale = Number(ev.target.value);
										update(result);
									} } />
						</li>
						{/*<li>
							<label>Uncommon Units?</label>
							<NumberField name="scale"
									value={ data._settings.scale }
									onChange={ (ev) => {
										const result = JSON.parse(JSON.stringify(data)) || {};
										result._settings.scale = Number(ev.target.value);
										update(result);
									} } />
						</li>*/}
						<li>
							<label>Default Unit of Length</label>
							<UnitSelector name="length"
									unit="length-metric-centimetre"
									value={ data._settings.length }
									verbose
									onChange={ (ev) => {
										const result = JSON.parse(JSON.stringify(data)) || {};
										result._settings.length = ev.target.getAttribute('data-unit');
										update(result);
									} } />
						</li>
						<li>
							<label>Default Unit of Temperature</label>
							<UnitSelector name="temperature"
									unit="temperature-metric-kelvin"
									value={ data._settings.temperature }
									verbose
									onChange={ (ev) => {
										const result = JSON.parse(JSON.stringify(data)) || {};
										result._settings.temperature = ev.target.getAttribute('data-unit');
										update(result);
									} } />
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export const SettingsButton = () => {
	const [open, setOpen] = useState(false);
	return (
		<div>
			<button onClick={ () => { setOpen(!open) } } title="Global Settings" className="settings-button">
				<img src="/assets/images/cog.svg" />
			</button>
			{
				open ? (<Overlay><SettingsModal onClose={ () => { setOpen(false); } } /></Overlay>) : undefined
			}
		</div>
	);
};
