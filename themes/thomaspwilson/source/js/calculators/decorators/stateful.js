import React, { createFactory } from 'react';
import PropTypes from 'prop-types';

export default (config)  => (component) => {
	const factory = createFactory(component);

	class StatefulComponent extends React.Component {
		static propTypes = {
			children: PropTypes.any,
		};

		constructor() {
			super();
			this.state = {};
			this.computeProps = this.computeProps.bind(this);
		}

		computeProps() {
			let {
				children,
				...rest
			} = this.props;

			let result = { ...rest };
			Object.keys(config).forEach((prop) => {
				result[prop] = this.state[prop];
				result['update' + prop] = (obj) => {
					this.setState({ [prop]: obj });
				}
			});
			return result;
		}

		render() {
			return factory(this.computeProps());
		}
	}

	return StatefulComponent;
}