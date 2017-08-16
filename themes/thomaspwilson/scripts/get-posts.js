'use strict';

function getPosts(posts, options) {
    if (!options && (!posts || !posts.hasOwnProperty('length'))) {
        options = posts;
        posts = this.site.posts;
    }

    options = options || {};

    var order = options.order || -1;
    var orderby = options.orderby || 'date';
    var limit = options.limit || 6;
    var self = this;

    // Sort the posts
    posts = posts.sort(orderby, order);

    // Limit the number of posts
    if (limit) {
        posts = posts.limit(limit);
    }
    return posts;
}

hexo.extend.helper.register('get_posts', getPosts);
