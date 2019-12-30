'use strict'

const path = require('path');
const webpack = require('webpack');
const globAll = require('glob-all');
const PurifyCSSPlugin = require('purifycss-webpack');

const src = path.resolve(__dirname, '../src/client');

module.exports = {
    plugins: [
        new PurifyCSSPlugin({
            'verbose': true,
            'paths': globAll.sync([
                path.resolve(__dirname, '../dist/*.html'),
                path.join(src, '**/*.js')
            ]),
            'moduleExtensions': ['.js'],
            'minimize': true
        }),
        new webpack.HashedModuleIdsPlugin()
    ]
}
