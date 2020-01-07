import React from 'react';
import { Link } from 'react-router-dom';

export default ({ to }) => (
	<Link to={ to } className="back-button">
		<img src="/assets/images/left-arrow.svg" />
	</Link>
);