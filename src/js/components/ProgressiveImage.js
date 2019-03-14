import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const loaded = {};

export default class ProgressiveImage extends React.Component {
	static propTypes = {
		/**
		 * The name and id to give to the figure
		 */
		name : PropTypes.string.isRequired,
		/**
		 * The aspect ratio, as a percentage, of the image to be loaded. Used to
		 * produce the intrinsic placeholder in order to avoid reflow.
		 */
		aspect: PropTypes.number.isRequired,
		/**
		 * The source url of the thumbnail to display as a placeholder until the
		 * large image is loaded.
		 */
		smallSrc: PropTypes.string.isRequired,
		/**
		 * The source of the final, large image to display.
		 */
		largeSrc: PropTypes.string.isRequired,
		/**
		 * Additional classnames to give to the figure.
		 */
		className: PropTypes.string,
		/**
		 * The caption to give to the figure.
		 */
		caption: PropTypes.any,
		/**
		 * The placeholder wrapper component
		 */
		wrapper: PropTypes.any,
		/**
		 * Additional wrapper props
		 */
		wrapperProps: PropTypes.object
	};

	static defaultProps = {
		wrapper: 'div'
	};

	constructor() {
		super();

		this.state = {
			small: false,
			large: false
		};
	}

	render() {
		const { small, large } = this.state;
		const { className, aspect, largeSrc, smallSrc, name, caption, wrapper: Wrapper, wrapperProps = {} } = this.props;
		return (
			<figure name={ name } id={ name } className={ classnames('progressive-image', name, className) }>
				<Wrapper className="placeholder" data-large={ largeSrc } { ...wrapperProps }>
  					<img src={ smallSrc } onLoad={ () => { console.log('onLoad'); this.setState({ small: true }); } } className={ classnames('small', { visible: small && !large && !loaded[largeSrc] }) } />
  					<img src={ largeSrc } onLoad={ () => { this.setState({ large: true }); loaded[largeSrc] = true } } className={ classnames({ visible: large || loaded[largeSrc] }) } />
  					<div style={{
  						paddingBottom: `${ aspect }%`
  					}} />
				</Wrapper>
				{ caption }
			</figure>
		);
	}
}