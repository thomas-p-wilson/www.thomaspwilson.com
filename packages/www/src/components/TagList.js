import React from 'react';

export default ({ tags = [] }) => (
	<ul className="tag-list">
		{
			tags.map((tag, i) => (
				<li className="badge badge-pill">{ tag }</li>
			))
		}
	</ul>
);
