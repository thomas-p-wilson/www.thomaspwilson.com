const path = require('path');
const webpack = require('webpack');
const globAll = require('glob-all');
const PurifyCSSPlugin = require('purifycss-webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function configureProductionBuild(config) {
    if (process.env.NODE_ENV !== 'production') {
        return config;
    }

    config.plugins = config.plugins.concat([ // eslint-disable-line no-param-reassign
        new webpack.LoaderOptionsPlugin({
            'minimize': true,
            'debug': false
        }),
        new PurifyCSSPlugin({
            'verbose': true,
            'paths': globAll.sync([
                path.join(__dirname, 'dist/*.html'),
                path.join(__dirname, 'src/**/*.js')
            ]),
            'moduleExtensions': ['.js'],
            'minimize': true
        }),
        new webpack.optimize.UglifyJsPlugin({
            'include': /\.min.js$/,
            'compress': { 'warnings': false },
            'output': { 'comments': false },
            'sourceMap': false
        }),
        // new UnminifiedWebpackPlugin(),
        new CompressionPlugin({
            'asset': '[path].gz[query]',
            'algorithm': 'gzip',
            'test': /\.js$|\.css$|\.html$/,
            'threshold': 10240,
            'minRatio': 0.8
        }),
        new CopyWebpackPlugin([
            { from: 'src/html/.htaccess', to: '.htaccess', toType: 'file' },
            { from: 'public/assets', to: 'assets' },
        ])
    ]);
    return config;
};
