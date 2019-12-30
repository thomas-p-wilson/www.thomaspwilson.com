/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import { connect } from 'react-redux';
import {
    setDisplayName,
    wrapDisplayName
} from './utils';
import { warn } from '../logging';
import { actions } from '../ducks';

export const getAction = (key, config) => {
    if (config && typeof config.action !== 'undefined') {
        if (config.action === false) {
            return;
        }
        if (typeof config.action === 'string') {
            return actions.getRegistered()[config.action];
        }
        if (typeof config.action === 'function') {
            return config.action;
        }
    }

    if (!actions.getRegistered()) {
        warn(`No action found for key '${ key }'`);
        return;
    }

    if (actions.getRegistered()[key]) {
        return actions.getRegistered()[key];
    }

    const k = `fetch_${ key }`;
    const camel = camelCase(k);
    if (actions.getRegistered()[camel]) {
        return actions.getRegistered()[camel];
    }

    const snake = snakeCase(k);
    if (actions.getRegistered()[snake]) {
        return actions.getRegistered()[snake];
    }

    warn(`No action found for key '${ key }'`);
};


export const getState = (key, config, state, props) => {
    if (typeof config.state === 'function') {
        return config.state(state, props);
    }
    return state[config.state || key];
};

export const executeActions = (config, t) => {
    Object.keys(config)
        .forEach((key) => {
            const action = getAction(key, config[key]);
            if (action) {
                t.props.dispatch((dispatch, getState) => (
                    action(dispatch, getState, t.props)
                ));
            }
        });
};

/**
 * A function that produces an action, which the @connect decorator may then
 * call in order to retrieve the desired state.
 *
 * @callback action
 * @param {object} state - The content of the store
 * @param {object} location - The location
 * @param {object} match - The location match
 * @returns {undefined - Nothing
 */

/**
 * A configuration object that determines how the @connect decorator will find
 * and inject information into the component.
 *
 * @typedef PropConfigObject
 * @type {Object}
 * @property {string|function} state - The name of the store property, or a
 *     function that returns the desired state representation.
 * @property {string|action} action - The name of the action, or a function
 *     that returns the desired action.
 */

/**
 * Connect the decorated/wrapped component to the Redux store automatically.
 *
 * If you pass `true` as the only argument to the decorator, the decorator will
 * attempt to inspect the prop types of the wrapped component to determine what
 * state to pass in, and will attempt to find an action that matches the name of
 * the prop.
 *
 * If you pass an object literal as the only argument to the decorator, the
 * decorator will use each key as a prop and will behave as specified in the
 * object literal.
 *
 * Example #1:
 * ```
 * @connect({
 *     messages: {
 *         state: 'all-messages', // The name of the store property to retrieve
 *         action: 'fetchAllMessages', // The name or instance of the action
 *     }
 * })
 * ```
 *
 * The first argument determines how state is mapped to props. There are
 * multiple ways to accomplish this:
 *
 * Example #1:
 * ```
 * @connect((state) => ({
 *     messages: state.messages,
 *     fetching: state.fetching,
 * }))
 * ```
 *
 * Example #2:
 * ```
 * @connect((state) => ({
 *     messages: state.messages,
 *     fetching: state.fetching,
 * }), {
 *     fetchInitialData,
 *     showSpinner,
 * })
 * ```
 *
 * @param {Object<String,PropConfigObject>} config - The prop config
 * @returns {Function} - The decorator function which takes a component
 */
export default (config = {}) => (WrappedComponent) => {
    class WithState extends React.Component {
        static propTypes = {
            location: PropTypes.object
        };

        static contextTypes = {
            params: PropTypes.any
        };

        componentDidMount() {
            executeActions(config, this);
        }

        componentDidUpdate() {
            executeActions(config, this);
        }

        render() {
            return (
                <WrappedComponent { ...this.props } />
            );
        }
    }

    // Map state and dispatch
    const mapStateToProps = (state, props) => (
        Object.keys(config)
            .reduce((result, key) => {
                result[key] = getState(key, config[key], state, props);
                return result;
            }, {})
    );
    const ConnectedWithState = connect(mapStateToProps, null, null, { pure: false })(WithState);

    if (process.env.NODE_ENV !== 'production') {
        return setDisplayName(wrapDisplayName(WrappedComponent, 'withState'))(ConnectedWithState);
    }
    return ConnectedWithState;
};
