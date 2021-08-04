/* eslint-disable no-useless-escape */

require('@babel/register');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const globAll = require('glob-all');
const PurifyCSSPlugin = require('purifycss-webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;
const analyzerEnabled = !!process.env.WEBPACK_ANALYZER;

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
const babelSettings = fixBabel(require(__dirname + '/.babelrc'));

module.exports = {
    'entry': {
        'main': ['./src/js/index.js'],
        'index': ['./src/html/index.html']
    },
    'output': {
        'filename': 'js/[name].min.js',
        'path': path.resolve('./dist'),
        'publicPath': '/',
    },
    devServer: {
        'host': '0.0.0.0',
        'port': 3000,
        'hot': true,
        'contentBase': 'public/',
        'historyApiFallback': true,
        'injectClient': isDevelopment,
    },
    'node': { 'global': true },
    'module': {
        'rules': [
            {
                'test': /\.js$/,
                'include': [
                    path.resolve(__dirname, 'src')
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
                    { loader: 'css-loader', options: { sourceMap: true, url: false } },
                ]
            },
            {
                'test': /\.(sass|scss)$/,
                'use': [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader', options: { sourceMap: true, url: false } },
                    {
                        loader: 'sass-loader',
                        options: {
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
                'test': /\.(eot|com|ttf|woff|woff2).*?$/,
                'use': [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        },
                    },
                ],
            },
            {
                'test': /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                'loader': 'url-loader?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
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
            'lodash.get': path.resolve(__dirname, 'src/js/common/shims/lodash.get.js'),
            'lodash.merge': path.resolve(__dirname, 'src/js/common/shims/lodash.merge.js'),
            'lodash.omit': path.resolve(__dirname, 'src/js/common/shims/lodash.omit.js'),
            'lodash.set': path.resolve(__dirname, 'src/js/common/shims/lodash.set.js')
        }
    },
    'plugins': [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
            ignoreOrder: true
        }),
        new BundleAnalyzerPlugin({
            'analyzerHost': '0.0.0.0',
            'analyzerPort': 3001,
            'analyzerMode': (isDevelopment || analyzerEnabled) ? 'server' : 'disabled',
        }),
        new DuplicatePackageCheckerPlugin(),
        new webpack.NamedModulesPlugin(),

        // Production plugins
        ...(process.env.NODE_ENV === 'production' ? [
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
            new CompressionPlugin(),
            new CopyWebpackPlugin([
                { from: 'src/html/.htaccess', to: '.htaccess', toType: 'file' },
                { from: 'public/assets', to: 'assets' },
            ]),
        ] : [])
    ],
    'externals': {
        'window': 'window',
        'location': 'location'
    },
    'devtool': 'source-map'
};
