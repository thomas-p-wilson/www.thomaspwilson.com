import React from 'react';
import SimpleCalculator from '../../components/redone/SimpleCalculator';
import calculator from './definition';

export default () => (
	<div className="calculator calc-circle-area">
		<div className="calc-column">
			<SimpleCalculator calculator={ calculator } />
		</div>
		<div className="desc-column">
			<div>
				yo yo yo
			</div>
		</div>
	</div>
);
