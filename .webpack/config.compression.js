'use strict';

const CompressionPlugin = require('compression-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    plugins: [
        // new webpack.optimize.ModuleConcatenationPlugin(),
        new UnminifiedWebpackPlugin(),
        new MinifyPlugin(),
        new CompressionPlugin({
            'filename': '[path].gz[query]',
            'algorithm': 'gzip',
            'threshold': 10240,
            'minRatio': 0.8
        })
    ]
};
