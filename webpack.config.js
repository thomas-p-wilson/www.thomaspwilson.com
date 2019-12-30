
const merge = require('webpack-merge');

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = !isDevelopment;
const useCompression = !!process.env.USE_COMPRESSION || isProduction;
const useAnalyzer = !!process.env.USE_ANALYZER;

const base = require('./.webpack/config.base.js');
const dev = require('./.webpack/config.dev.js');
const prod = require('./.webpack/config.prod.js');
const compress = require('./.webpack/config.compression.js');
const analyzer = require('./.webpack/config.analyzer.js');

module.exports = merge(
    base,
    isDevelopment ? dev : prod,
    useCompression ? compress : {},
    useAnalyzer ? analyzer : {}
);
