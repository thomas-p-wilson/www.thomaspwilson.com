module.exports = {
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ],
    "plugins": [
        "@babel/plugin-syntax-dynamic-import",
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": false,
                "helpers": process.env.NODE_ENV === 'development',
                "regenerator": process.env.NODE_ENV === 'development',
                "useESModules": true
            }
        ],
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties"],
        "@babel/plugin-proposal-export-default-from"
    ]
}