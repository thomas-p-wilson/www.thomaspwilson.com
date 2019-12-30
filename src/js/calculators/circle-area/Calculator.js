import React from 'react';
import SimpleCalculator from '../../components/redone/SimpleCalculator';
import calculator from './definition';

export default () => (
	<div className="calculator calc-circle-area">
		<div className="calc-column">
			<div>
				<h2>Features of a Circle</h2>
				<SimpleCalculator calculator={ calculator } />
			</div>
		</div>
		<div className="desc-column">
			<div>
				<p>This calculator can determine the area, circumference, diameter, or radius of a circle.</p>
				
				<p>Notation:</p>
				<dl>
					<dt><code>A</code></dt>
					<dd>The area of the circle</dd>

					<dt><code>c</code></dt>
					<dd>The circumference of the circle</dd>

					<dt><code>d</code></dt>
					<dd>The diameter of the circle</dd>

					<dt><code>r</code></dt>
					<dd>The radius of the circle</dd>
				</dl>
			</div>
		</div>
	</div>
);
