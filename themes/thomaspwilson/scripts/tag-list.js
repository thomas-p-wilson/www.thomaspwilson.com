'use strict';

hexo.extend.tag.register('tags', function(args, content, options) {
    return '<ul class="tag-list">'
        + args.map(function (tag) {
            return '<li><a href="/tags/' + tag.toLowerCase() + '" class="label label-default"><i class="fa fa-tag"></i> ' + tag + '</a></li>';
        }).join('')
        + '</ul>';
});