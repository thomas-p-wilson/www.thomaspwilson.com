/* eslint-disable no-console, require-jsdoc */
function processConsoleMessage(msg) {
    if (typeof msg === 'object') {
        return new Error(JSON.stringify(msg));
    }
    if (!(msg instanceof Error)) {
        return new Error(msg);
    }
    return msg;
}

const old_console_log = console.log;
export function debug(...args) {
    old_console_log(...args);
}
console.log = debug;

const old_console_warn = console.warn;
export function warn(msg, ...args) {
    old_console_warn(msg, ...args);
}
console.warn = warn;

const old_console_error = console.error;
export function error(msg, ...args) {
    old_console_error(msg, ...args);
}
console.error = error;
