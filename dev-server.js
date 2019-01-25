var path = require('path');
var express = require('express');
var webpack = require('webpack');
var middleware = require('webpack-dev-middleware');

var config = require('./webpack.config');
var app = express();

app.use(express.static('./src'));
app.use(middleware(webpack(config)));

var server = app.listen(3000);