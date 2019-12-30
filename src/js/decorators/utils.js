/* eslint-disable no-param-reassign */

/**
 * Determines the display name of a compnent, if available.
 *
 * @param {Component} component - The component to get the name of
 * @returns {String} - The name of the component, or undefined if not found
 */
export function getDisplayName(component) {
    return component.displayName
            || component.constructor.displayName
            || component.name
            || component.constructor.name;
}

/**
 * Adds a wrapping name or identifier to the provided component's display name.
 * This is useful when building decorators, in order to establish a "path" of
 * names by which to identify the component.
 *
 * @param {Component} component - The component whose name we'll wrap
 * @param {String} wrap - The name to wrap with
 */
export function wrapDisplayName(component, wrap) {
    component.displayName = `${ wrap }(${ getDisplayName(component) })`;
}

/**
 * Sets the display name on a component.
 *
 * @param {String} name - The new component name
 * @returns {Component} - The component
 */
export function setDisplayName(name) {
    /**
     * Receives the component whose name we will set.
     *
     * @param {Component} component - The component whose name to set
     * @returns {Component} The component
     */
    return (component) => {
        component.displayName = name;
        return component;
    };
}

/**
 * Processes a list or object, normalizing it.
 *
 * @param {Object|Array} args - The list or object to process
 * @param {Function} normalize - A normalization callback
 * @returns {Object} - A normalized object representation, or null
 */
export function processArgs(args, normalize) {
    if (!args
            || (Array.isArray(args) && args.length === 0)
            || Object.keys(args).length === 0) {
        return null;
    }

    // Normalize array
    if (Array.isArray(args)) {
        return args.reduce((result, prop) => {
            result[prop] = normalize(prop);
            return result;
        }, {});
    }

    // Normalize object
    return Object.keys(args)
        .reduce((result, prop) => {
            if (args[prop] === false) {
                return result;
            }
            if (args[prop] === true) {
                args[prop] = {};
            }

            result[prop] = {
                ...normalize(prop),
                ...args[prop]
            };
            return result;
        }, {});
}

/**
 * A utility function for composing decorators, in the given order.
 *
 * @param {Array<Function>} fns - The decorators/functions to compose
 * @returns {Function} - The highest level function, composing all the others
 */
export function compose(...fns) {
    return fns.reverse()
        .reduce((prevFn, nextFn) => (value) => (nextFn(prevFn(value))), (value) => (value));
}
