'use strict';

const path = require('path');

const clientSrc = path.resolve(__dirname, '../src');

module.exports = {
    resolve: {
        extensions: [ '.js' ],
        alias: {
            '@': clientSrc,
            '~': path.resolve(__dirname, '../node_modules/'),
            'react': path.resolve(__dirname, '../node_modules/preact/compat'),
            'react-dom': path.resolve(__dirname, '../node_modules/preact/compat'),
            'lodash': path.resolve(__dirname, '../node_modules/lodash'),
            'react-is': path.resolve(__dirname, '../node_modules/react-is'),
            'prop-types': path.resolve(__dirname, '../node_modules/prop-types'),
            '@babel/runtime': path.resolve(__dirname, '../node_modules/@babel/runtime')
        }
    }
}
