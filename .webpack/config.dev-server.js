module.exports = {
    compress: true,
    historyApiFallback: true,
    hot: true,
    open: true,
    overlay: true,
    host: '0.0.0.0',
    port: process.env.EV_UI_PORT || 3000,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Connection, Date, ETag, Set-Cookie, X-Content-Type-Options, X-Download-Options, X-Frame-Options, X-XSS-Protection',
    },
    stats: {
        colors: true,
        normal: true
    },
    quiet: false,
    noInfo: false
};
