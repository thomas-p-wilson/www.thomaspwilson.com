const scaleData = {
    G: [9, 'Giga'],
    M: [6, 'Mega'],
    k: [3, 'Kilo'],
    '': [0, ''],
    c: [-2, 'Centi'],
    m: [-3, 'Milli'],
    u: [-6, 'Micro'],
    n: [-9, 'Nano']
}

export const generateScale = (symbol, singular, plural, measure, system, prefixes = symbols) => {
    const use = [ ...prefixes, '' ];
    const result = {};
    Object.keys(scaleData)
        .forEach((prefix) => {
            if (use.indexOf(prefix) !== -1) {
                result[prefix + symbol] = {
                    symbol: prefix + symbol,
                    singular: scaleData[prefix][1] + singular.toLowerCase(),
                    plural: scaleData[prefix][1] + plural.toLowerCase(),
                    measure,
                    system,
                    multiplier: Math.pow(10, scaleData[prefix][0])
                }
            }
        });
    return result;
}
