'use strict';

var path = require('path');
var glob = require('glob');

module.exports = class CalculatorManifestPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapPromise('CalculatorManifestPlugin', async (compilation) => {
            const files = glob.sync('**/descriptor.json', {
                cwd: path.resolve(__dirname, '..')
            });
            const calculators = files
                .map((file) => (require(path.resolve(__dirname, '..', file))))
                .map(({ changelog, ...rest }) => (rest));
            const categories = calculators.reduce((arr, calc) => {
                if (arr.indexOf(calc.category) !== -1) {
                    return arr;
                }
                return arr.concat([calc.category]);
            }, []);
            const manifest = {
                calculators,
                categories
            };

            const output = JSON.stringify(manifest, null, 2);
            compilation.assets['manifest.json'] = {
                source: () => (output),
                size: () => (output.length)
            };
        });
    }
};