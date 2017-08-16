'use strict';

function paginatorHelper(options) {
  options = options || {};

  var current = options.current || this.page.current || 0;
  var total = options.total || this.page.total || 1;
  var endSize = options.hasOwnProperty('end_size') ? +options.end_size : 1;
  var midSize = options.hasOwnProperty('mid_size') ? +options.mid_size : 2;
  var space = options.hasOwnProperty('space') ? options.space : '&hellip;';
  var base = options.base || this.page.base || '';
  var format = options.format || this.config.pagination_dir + '/%d/';
  var prevText = options.prev_text || 'Prev';
  var nextText = options.next_text || 'Next';
  var prevNext = options.hasOwnProperty('prev_next') ? options.prev_next : true;
  var transform = options.transform;
  var self = this;
  var result = '';

  if (!current) return '';

  function link(i) {
    return self.url_for(i === 1 ? base : base + format.replace('%d', i));
  }
  function pageLink(i, title) {
    return '<a class="btn ' + (i === current ? 'btn-primary' : 'btn-default') + '" href="' + link(i) + '">' + title + '</a>';
  }



  result = '<div class="btn-group">';
  
  if (current > 1) {
    result += pageLink(current - 1, 'Prev');
  }
  var currentPage = '<span class="btn btn-primary">' +
    (transform ? transform(current) : current) +
    '</span>';
  var start = Math.max(1, current - 2);
  var end = Math.min(total, current + 2);
  for (var i = start; i <= end; i++) {
    result += pageLink(i, i);
  }

  if (current < total) {
    result += pageLink(current + 1, 'Next');
  }

  result += '</div>';

  return result;
}

hexo.extend.helper.register('paginator2', paginatorHelper);
