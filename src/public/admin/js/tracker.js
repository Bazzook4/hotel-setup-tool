// Shared page-tracker vocabulary.
(function () {
  'use strict';
  var PAGE_LIVE = {
    live:       ['Live', 'ok'],
    stale:      ['Old version live', 'bad'],
    missing:    ['Missing (404)', 'bad'],
    redirect:   ['Redirects', 'soft'],
    error:      ['Check failed', 'warn'],
    gone:       ['Removed', 'soft'],
    still_live: ['Still live after delete', 'bad']
  };
  var CHANGE_LIVE = {
    live:       ['Live', 'ok'],
    not_live:   ['Not live', 'bad'],
    redirect:   ['Redirects', 'soft'],
    superseded: ['Replaced later', 'soft']
  };
  var CHANGE_TYPE = {
    added:    ['Added', 'ok'],
    modified: ['Edited', ''],
    deleted:  ['Removed', 'bad'],
    renamed:  ['Moved', 'warn']
  };
  var KINDS = {
    title: 'Title', meta: 'Meta description', h1: 'H1', h2s: 'Headings', schema: 'Schema',
    links: 'Links', body: 'Body text', markup: 'Markup only', 'new': 'New page'
  };
  var TYPES = { guide: 'Guide', hub: 'Guide hub', tool: 'Tool', service: 'Service', other: 'Page' };

  function badge(map, key, fallback) {
    var v = map[key] || [fallback || 'Not checked', key ? '' : 'soft'];
    return '<span class="badge ' + v[1] + '">' + OH.esc(v[0]) + '</span>';
  }

  function kinds(list) {
    if (!list || !list.length) return '';
    return list.map(function (k) { return KINDS[k] || k; }).join(', ');
  }

  function isProblem(p) {
    return ['stale', 'missing', 'error', 'still_live'].indexOf(p.live_status) > -1;
  }

  function pageLink(path, title) {
    return '<a href="/admin/pages/page.html?path=' + encodeURIComponent(path) + '">' +
      OH.esc(title || path) + '</a>';
  }

  window.TR = {
    PAGE_LIVE: PAGE_LIVE, CHANGE_LIVE: CHANGE_LIVE, CHANGE_TYPE: CHANGE_TYPE, TYPES: TYPES,
    pageLive: function (s) { return badge(PAGE_LIVE, s); },
    changeLive: function (s) { return badge(CHANGE_LIVE, s, 'Pending'); },
    changeType: function (s) { return badge(CHANGE_TYPE, s); },
    kinds: kinds, isProblem: isProblem, pageLink: pageLink
  };
})();
