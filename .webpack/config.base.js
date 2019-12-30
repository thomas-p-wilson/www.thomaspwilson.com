'use strict'

require('@babel/register');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UnusedWebpackPlugin = require('unused-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const CalculatorManifestPlugin = require('../src/js/webpack-plugins/calculator-manifest-plugin');
const trimEnd = require('lodash/trimEnd');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;
// const publicPath = `http://0.0.0.0:${ process.env.UI_PORT || 3000 }/`
const clientSrc = path.resolve(__dirname, '../src');
const jsSrc = path.resolve(clientSrc, 'js');
const htmlSrc = path.resolve(clientSrc, 'html');
const dist = path.resolve(__dirname, '../dist');

module.exports = {
    mode: process.env.NODE_ENV || 'production',
    entry: {
        // polyfill: '@babel/polyfill',
        main: jsSrc
    },
    output: {
        path: dist,
        publicPath: '/',
        filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[id].chunk.js'
    },
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
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    jsSrc
                ],
                loaders: [
                    'strip-sourcemap-loader',
                    {
                        loader: 'babel-loader', query: require('../.babelrc.js')
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // publicPath: '../'
                        }
                    },
                    { loader: 'css-loader', options: { sourceMap: true } },
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // publicPath: '../'
                        }
                    },
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
                test: /\.html/,
                loader: 'file-loader',
                query: { 'name': '[name].[ext]' }
            },
            {
                test: /\.(png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        useRelativePath: true,
                        outputPath: 'assets/images/',
                        publicPath: '/assets/images/',
                        limit: 100000
                    }
                }
            },
            {
                test: /\.(eot|com|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        useRelativePath: true,
                        outputPath: 'assets/fonts/',
                        publicPath: '/assets/fonts/',
                        limit: 100000
                    }
                }
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        useRelativePath: true,
                        outputPath: 'assets/images/',
                        publicPath: '/assets/images/',
                        mimetype: 'image/svg+xml',
                        limit: 100000
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(isProduction),
            VERSION: JSON.stringify(process.env.EV_VERSION || 'dev'),
            API: JSON.stringify(trimEnd(process.env.EV_API_URL, '/')),
            SENTRY_DSN: JSON.stringify(process.env.EV_SENTRY_DSN)
        }),
        new CopyWebpackPlugin([
            { from: htmlSrc, to: '.' },
            { from: path.resolve(__dirname, '../src/images'), to: 'images/' }
        ]),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
            ignoreOrder: true
        }),
        new UnusedWebpackPlugin({
            directories: [path.join(__dirname, 'src')],
            exclude: ['*.test.js']
        }),
        new DuplicatePackageCheckerPlugin(),
        new CalculatorManifestPlugin()
    ],
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             styles: {
    //                 name: 'styles',
    //                 test: /\.css$/,
    //                 chunks: 'all',
    //                 enforce: true,
    //             }
    //         }
    //     }
    // }
}
