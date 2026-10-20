// Shared CRM vocabulary for the leads pages.
(function () {
  'use strict';
  var STATUSES = [
    ['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'],
    ['proposal', 'Proposal sent'], ['won', 'Won'], ['lost', 'Lost'],
    ['unresponsive', 'Unresponsive']
  ];
  var OPEN = ['new', 'contacted', 'qualified', 'proposal'];
  var SOURCES = [
    ['widget_form', 'Website widget'], ['contact_form', 'Contact form'],
    ['pms_direct', 'PMS page'], ['whatsapp_direct', 'WhatsApp (direct)'],
    ['phone', 'Phone call'], ['referral', 'Referral'], ['other', 'Other']
  ];
  // Sources a person can pick when adding a lead by hand.
  var MANUAL_SOURCES = ['whatsapp_direct', 'phone', 'referral', 'other'];
  var ACTIVITY_TYPES = [
    ['note', 'Note'], ['whatsapp', 'WhatsApp'], ['call', 'Call'],
    ['email', 'Email'], ['proposal', 'Proposal']
  ];

  function label(list, key) {
    for (var i = 0; i < list.length; i++) if (list[i][0] === key) return list[i][1];
    return key || '';
  }

  function statusBadge(s) {
    var cls = s === 'won' ? 'ok' : (s === 'lost' || s === 'unresponsive') ? 'soft' : s === 'new' ? 'warn' : '';
    return '<span class="badge ' + cls + '">' + OH.esc(label(STATUSES, s)) + '</span>';
  }

  function isOpen(lead) { return OPEN.indexOf(lead.status) > -1; }
  function isOverdue(lead) {
    return isOpen(lead) && lead.next_follow_up && lead.next_follow_up < OH.todayIso();
  }

  function options(list, selected, only) {
    return list.filter(function (o) { return !only || only.indexOf(o[0]) > -1; })
      .map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === selected ? ' selected' : '') + '>' + OH.esc(o[1]) + '</option>';
      }).join('');
  }

  window.CRM = {
    STATUSES: STATUSES, OPEN: OPEN, SOURCES: SOURCES, MANUAL_SOURCES: MANUAL_SOURCES,
    ACTIVITY_TYPES: ACTIVITY_TYPES, label: label, statusBadge: statusBadge,
    isOpen: isOpen, isOverdue: isOverdue, options: options
  };
})();
