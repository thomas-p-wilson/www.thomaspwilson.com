'use strict'

const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const devServer = require('./config.dev-server.js');

module.exports = {
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsPlugin()
    ],

    devtool: 'source-map',
    devServer,
    stats: true
}
