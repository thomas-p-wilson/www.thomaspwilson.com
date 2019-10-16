/* eslint-disable no-useless-escape */

require('@babel/register');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const extend = require('./webpack.config.production.js');

const fixSetting = function (o) {
    if (!Array.isArray(o)) {
        return require.resolve(o);
    }

    o[0] = require.resolve(o[0]);
    if (o[1] && o[1].alias) {
        Object.keys(o[1].alias).forEach((key) => {
            o[1].alias[key] = require.resolve(o[1].alias[key]);
        });
    }
    return o;
}
const fixBabel = function (settings) {
    let result = {
        ...settings
    };
    if (result.presets) {
        result.presets = result.presets.map(fixSetting);
    }
    if (result.plugins) {
        result.plugins = result.plugins.map(fixSetting);
    }
    return result;
}
const babelSettings = fixBabel(JSON.parse(fs.readFileSync('.babelrc', 'utf8')));

const cssLoader = (url = false) => ({
    'loader': 'css-loader',
    'options': {
        url,
        'minimize': process.env.BUILD,
        'importLoaders': 1
    }
});

module.exports = extend({
    'entry': {
        'main': ['./src/js/index.js'],
        'index': ['./src/html/index.html']
    },
    'output': {
        'filename': 'js/[name].min.js',
        'path': path.resolve('./dist')
    },
    'node': { 'global': true },
    'module': { 'rules': [
        {
            'test': /\.js$/,
            'include': [
                path.resolve(__dirname, 'src')
                // path.resolve(__dirname, 'node_modules/preact-chartjs-2')
            ],
            'loaders': [
                'strip-sourcemap-loader',
                {
                    'loader': 'babel-loader', 'query': babelSettings
                }
            ]
        },
        {
            'test': /\.css$/,
            'use': [
                { loader: MiniCssExtractPlugin.loader },
                { loader: 'css-loader', options: { sourceMap: true } },
            ]
        },
        {
            'test': /\.(sass|scss)$/,
            'use': [
                { loader: MiniCssExtractPlugin.loader },
                { loader: 'css-loader', options: { sourceMap: true } },
                {
                    loader: 'sass-loader',
                    options: {
                        // data: `@import "${ path.resolve(__dirname, '../src/client/scss/shim.scss') }";`,
                        sourceMap: true
                    }
                }
            ]
        },
        {
            'test': /\.html/,
            'loader': 'file-loader',
            'query': { 'name': '[name].[ext]' }
        },
        {
            'test': /\.(png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
            'loader': 'url-loader?limit=100000'
        },
        {
            'test': /\.(eot|com|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
            'loader': 'url-loader?limit=10000&mimetype=application/octet-stream'
        },
        {
            'test': /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            'loader': 'url-loader?limit=10000&mimetype=image/svg+xml'
        }
    ] },
    'resolve': {
        'extensions': ['.js', '.jsx', '.json'],
        'modules': [
            path.resolve('./'),
            'node_modules'
        ],
        'alias': {
            'react': path.resolve(__dirname, './node_modules/preact/compat'),
            'react-dom': path.resolve(__dirname, './node_modules/preact/compat'),
            'preact': path.resolve(__dirname, 'node_modules/preact'),
            'react-redux': 'preact-redux',
            // 'create-react-context': path.resolve(__dirname, 'src/js/shim/createPreactContext.js'),
            'lodash.get': path.resolve(__dirname, 'src/js/common/shims/lodash.get.js'),
            'lodash.merge': path.resolve(__dirname, 'src/js/common/shims/lodash.merge.js'),
            'lodash.omit': path.resolve(__dirname, 'src/js/common/shims/lodash.omit.js'),
            'lodash.set': path.resolve(__dirname, 'src/js/common/shims/lodash.set.js')
        }
    },
    'plugins': [
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|en-ca)$/),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
            ignoreOrder: true
        }),
        new BundleAnalyzerPlugin({
            'analyzerHost': '0.0.0.0',
            'analyzerPort': 3000,
            'analyzerMode': (process.env.WEBPACK_ANALYZER) ? 'server' : 'disabled'
        }),
        new DuplicatePackageCheckerPlugin(),
        new webpack.NamedModulesPlugin()
    ],
    'externals': {
        'window': 'window',
        'location': 'location'
    },
    'devtool': 'source-map'
});
