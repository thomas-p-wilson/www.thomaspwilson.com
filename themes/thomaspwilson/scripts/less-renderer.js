var path = require('path');
var less = require('less');

function renderer(data, options, callback){
    var themeConfig = hexo.theme.config.less || {};
    var cwd = process.cwd();
        var paths = (themeConfig.paths || []).map(function(filepath){
        return path.join(cwd, filepath);    // assuming paths are relative from the root of the project
    });
    
    var parser = less.render(data.text, {
        paths: paths.concat(path.dirname(data.path)),
        filename: path.basename(data.path),
        compress: themeConfig.compress || false
    })
    .then(function(output) {
        callback(null, output.css);
    },
    function(error){
        callback(error);
    });
};

hexo.extend.renderer.register('less', 'css', renderer);