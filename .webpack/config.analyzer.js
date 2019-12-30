'use strict';

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    plugins: [
        new BundleAnalyzerPlugin({
            'analyzerHost': '0.0.0.0',
            'analyzerPort': process.env.ANALYZER_PORT || 3001,
            'analyzerMode': 'server'
        }),
    ]
};
