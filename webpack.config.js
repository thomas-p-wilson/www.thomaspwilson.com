const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

const babelSettings = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));

module.exports = {
    'entry': [
        path.resolve('themes/thomaspwilson/source/js/calculators.js')
    ],
    'output': {
        'filename': 'calculators.js',
        'path': path.resolve('./public'),
        'publicPath': '/public/'
    },
    'module': {
        'loaders': [{
            'test': /\.(js|jsx)$/,
            'exclude': /(node_modules|bower_components|dist)/,
            'loader': 'babel-loader',
            'query': babelSettings
        }]
    },
    'resolve': {
        'extensions': ['.js', '.jsx'],
        'modules': [
            path.resolve('./'),
            'node_modules'
        ],
        'alias': {
            'react': 'preact-compat',
            'react-dom': 'preact-compat'
        }
    },
    'plugins': [
        // new webpack.DefinePlugin({ // <-- key to reducing React's size
        //     'process.env': {
        //         'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        //         'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        //     }
        // }),
        // new LodashModuleReplacementPlugin({
        //     'collections': true,
        //     'paths': true
        // }),
        // new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|en-ca)$/),
        // new webpack.LoaderOptionsPlugin({
        //     'minimize': true,
        //     'debug': false
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //     'compress': {
        //         'warnings': false
        //     },
        //     'output': {
        //         'comments': false
        //     },
        //     'sourceMap': false
        // }),
        // new UnminifiedWebpackPlugin(),
        // new CompressionPlugin({
        //     'asset': '[path].gz[query]',
        //     'algorithm': 'gzip',
        //     'test': /\.js$|\.css$|\.html$/,
        //     'threshold': 10240,
        //     'minRatio': 0.8
        // }),
        new BundleAnalyzerPlugin({
            'analyzerHost': '0.0.0.0',
            'analyzerPort': 3030,
            'analyzerMode': (process.env.WEBPACK_ANALYSER) ? 'server' : 'disabled'
        })
    ],
    // 'devtool': 'source-map'
};