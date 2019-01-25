export function queryStringToMap() {
    var query = document.location.search;
    if (!query || query === '') {
        return {};
    }
    var vars = query.substr(1).split('&');
    var result = {};
    var i = vars.length;
    while(i--) {
        var [key, value] = vars[i].split('=', 2);
        key = decodeURIComponent(key);
        value = decodeURIComponent(value);
        if (result[key]) {
            result[key] = [].concat(result[key]).concat([value]);
        } else {
            result[key] = value;
        }
    }
    return result;
}

export function mapToQueryString(map) {
    return Object.keys(map)
        .reduce((result, key) => {
            const value = map[key];
            if (value === undefined || value === null || value === '') {
                return result;
            }

            if (Array.isArray(value)) {
                value.forEach((_value) => {
                    result.push(encodeURIComponent(key) + '=' + encodeURIComponent(_value));
                });
                return result;
            }

            result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            return result;
        }, [])
        .join('&');
}

export function updateQueryString(map) {
    var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
    let params = mapToQueryString(map);
    window.history.replaceState({}, "", baseUrl + (params ? '?' + params : ''));
}

// Explicitly save/update a url parameter using HTML5's replaceState().
export function updateQueryStringParam(key, value) {
    var map = queryStringToMap();
    map[key] = value;
    updateQueryString(map);
}

/**
 * Evaluates the provided value, executing it if it's a function, retrieving
 * the value if it's a variable string, and returning the original if it's
 * nothing important.
 */
export function evaluate(value, fallback, calculator) {
    if (typeof value === 'function') {
        return value.apply(null, Array.prototype.slice.call(arguments, 2));
    }
    if (value.indexOf('$unit') === 0) {
        const prop = value.substr(6);
        if (calculator.field_units[prop]) {
            return calculator.field_units[prop];
        }
        if (calculator.fields[prop]
                && calculator.fields[prop].unit
                && calculator.units[calculator.fields[prop].unit.type]) {
            return calculator.units[calculator.fields[prop].unit.type];
        }
        return null;
    }
    if (value.indexOf('$') === 0) {
        const prop = value.substr(1);
        if (Object.prototype.hasOwnProperty.call(calculator, prop)) {
            return calculator[prop];
        }
    }
    return value || fallback;
}

export function roundToScale(value, scale) {
    return Number(Math.round(value + 'e+' + scale) + ('e-' + scale));
}