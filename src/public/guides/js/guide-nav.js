/**
 * Guide Navigation System
 * Sidebar, TOC, Prev/Next, Related Content
 */

// ===== GUIDE DATA =====
const GUIDE_CATEGORIES = [
  {
    id: 'revenue',
    label: 'Revenue',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    basePath: '/guides/revenue/',
    guides: [
      { slug: 'hotel-rate-plans.html', title: 'Hotel Rate Plans: EP, CP, MAP, AP' },
      { slug: 'rate-linkage.html', title: 'Rate Linkage (Derived Rates)' },
      { slug: 'revpar.html', title: 'RevPAR' },
      { slug: 'adr.html', title: 'ADR & ARR' },
      { slug: 'occupancy.html', title: 'Occupancy Rate' },
      { slug: 'room-night.html', title: 'Room Night (RN)' },
      { slug: 'mtd-ytd.html', title: 'MTD & YTD Reporting' },
      { slug: 'bar.html', title: 'BAR - Best Available Rate' },
      { slug: 'mlos.html', title: 'MLOS - Minimum Length of Stay' },
      { slug: 'lead-time.html', title: 'Lead Time & Booking Window' },
      { slug: 'no-show.html', title: 'No-Show & Cancellation' },
      { slug: 'arr.html', title: 'ARR - Average Room Rate' },
      { slug: 'overbooking.html', title: 'Overbooking Strategy' },
      { slug: 'trevpar.html', title: 'TRevPAR & GOP PAR' },
      { slug: 'increase-hotel-revenue.html', title: 'How to Increase Revenue' },
    ]
  },
  {
    id: 'ota',
    label: 'OTA',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V6l7-3 7 3v15"/><path d="M9 21v-5h6v5"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/></svg>',
    basePath: '/guides/ota/',
    guides: [
      { slug: 'ota-hotel-meaning.html', title: 'OTA Full Form & Meaning' },
      { slug: 'what-is-ota.html', title: 'What is OTA?' },
      { slug: 'what-is-gds.html', title: 'What is GDS?' },
      { slug: 'best-ota-for-hotels.html', title: 'Best OTA for Hotels' },
      { slug: 'best-ota-for-resorts.html', title: 'Best OTA for Resorts' },
      { slug: 'best-ota-for-homestays.html', title: 'Best OTA for Homestays' },
      { slug: 'booking-com-hotel-listing-guide.html', title: 'Booking.com Listing Guide' },
      { slug: 'booking-genius-program.html', title: 'Booking.com Genius Program' },
      { slug: 'google-free-booking-links.html', title: 'Google Free Booking Links' },
      { slug: 'booking-com-visibility-booster.html', title: 'Booking.com Visibility Booster' },
      { slug: 'makemytrip-hotel-listing.html', title: 'MakeMyTrip Hotel Listing Guide' },
      { slug: 'hotel-direct-booking-strategy.html', title: 'Hotel Direct Booking Strategy' },
      { slug: 'attract-international-guests-india.html', title: 'Attract International Guests' },
    ]
  },
  {
    id: 'software',
    label: 'Software',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    basePath: '/guides/software/',
    guides: [
      { slug: 'what-is-pms-hotel.html', title: 'What is PMS?' },
      { slug: 'channel-manager.html', title: 'Channel Manager' },
      { slug: 'update-hotel-rates-all-otas.html', title: 'Update Rates on All OTAs' },
      { slug: 'booking-engine.html', title: 'Booking Engine' },
      { slug: 'what-is-rms-hotel.html', title: 'What is RMS?' },
      { slug: 'what-is-pos-hotel.html', title: 'What is POS?' },
      { slug: 'hotel-inventory-management.html', title: 'Inventory Management' },
      { slug: 'hotel-accounting-software.html', title: 'Accounting Software' },
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><rect x="5" y="11" width="4" height="7"/><rect x="12" y="6" width="4" height="12"/><rect x="19" y="14" width="2" height="4"/></svg>',
    basePath: '/guides/reports/',
    guides: [
      { slug: 'manager-report.html', title: 'Manager Report (Flash Report)' },
      { slug: 'night-audit.html', title: 'Night Audit' },
      { slug: 'arrival-report.html', title: 'Arrival Report' },
      { slug: 'departure-report.html', title: 'Departure Report' },
      { slug: 'profit-loss-report.html', title: 'P&L Report' },
      { slug: 'expenses-report.html', title: 'Expenses Report' },
      { slug: 'payment-report.html', title: 'Payment Report' },
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="4" width="12" height="17" rx="1"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4"/></svg>',
    basePath: '/guides/compliance/',
    guides: [
      { slug: 'gst-hotels.html', title: 'GST for Hotels' },
      { slug: 'tds-tcs.html', title: 'TDS & TCS on OTA Payments' },
      { slug: 'grc-form-c.html', title: 'GRC & Form C' },
      { slug: 'form-c-hotel.html', title: 'Form C for Hotels' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V6l7-3 7 3v15"/><path d="M9 21v-5h6v5"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/></svg>',
    basePath: '/guides/operations/',
    guides: [
      { slug: 'hotel-check-in-process.html', title: 'Hotel Check-In Process' },
      { slug: 'foc-hotel.html', title: 'FOC (Free of Charge)' },
      { slug: 'hotel-cancellation-policy.html', title: 'Hotel Cancellation Policy' },
      { slug: 'hotel-housekeeping-sop.html', title: 'Housekeeping SOP & Checklist' },
      { slug: 'hotel-staff-training.html', title: 'Hotel Staff Training Guide' },
    ]
  }
];

// ===== RELATED CONTENT MAP =====
const RELATED_CONTENT = {
  // Revenue
  '/guides/revenue/hotel-rate-plans.html': [
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Display rate plans on your website' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync rates across OTAs' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Tax implications of rate plans' },
  ],
  '/guides/revenue/revpar.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily RevPAR tracking' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate pricing decisions' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Revenue to profit analysis' },
  ],
  '/guides/revenue/adr.html': [
    { href: '/guides/revenue/increase-hotel-revenue.html', title: 'Increase Hotel Revenue', category: 'Revenue', desc: 'Turn ADR gains into more revenue' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily ADR tracking' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Dynamic pricing' },
  ],
  '/guides/revenue/occupancy.html': [
    { href: '/guides/revenue/increase-hotel-revenue.html', title: 'Increase Hotel Revenue', category: 'Revenue', desc: 'Fill rooms and lift total revenue' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily occupancy tracking' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Manage availability across OTAs' },
  ],
  '/guides/revenue/room-night.html': [
    { href: '/guides/reports/night-audit.html', title: 'Night Audit', category: 'Reports', desc: 'Room night reconciliation' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Room night tracking' },
  ],
  '/guides/revenue/mtd-ytd.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'MTD metrics in daily reports' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Monthly and yearly financials' },
  ],
  '/guides/revenue/bar.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Dynamic BAR pricing' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Push BAR to all channels' },
  ],
  '/guides/revenue/mlos.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate MLOS restrictions' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync restrictions to OTAs' },
  ],
  '/guides/revenue/lead-time.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Lead time pricing rules' },
    { href: '/guides/reports/arrival-report.html', title: 'Arrival Report', category: 'Reports', desc: 'Track booking patterns' },
  ],
  '/guides/revenue/no-show.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Track no-show rates' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Guest registration for arrivals' },
  ],
  '/guides/revenue/arr.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'How ARR and RevPAR work together' },
    { href: '/guides/revenue/adr.html', title: 'ADR & ARR', category: 'Revenue', desc: 'International equivalent of ARR' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate ARR optimisation' },
  ],
  '/guides/revenue/overbooking.html': [
    { href: '/guides/revenue/no-show.html', title: 'No-Show & Cancellation', category: 'Revenue', desc: 'The root cause of overbooking need' },
    { href: '/guides/revenue/occupancy.html', title: 'Occupancy Rate', category: 'Revenue', desc: 'Maximise occupancy safely' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate overbooking decisions' },
  ],
  // Software
  '/guides/software/what-is-pms-hotel.html': [
    { href: '/guides/reports/night-audit.html', title: 'Night Audit', category: 'Reports', desc: 'PMS night audit process' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST invoicing from PMS' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Track in your PMS' },
  ],
  '/guides/software/channel-manager.html': [
    { href: '/guides/software/update-hotel-rates-all-otas.html', title: 'Update Rates on All OTAs', category: 'Software', desc: 'Bulk rate updates via channel manager' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Push rates to channels' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Channel performance data' },
  ],
  '/guides/software/update-hotel-rates-all-otas.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Complete guide to channel managers' },
    { href: '/guides/revenue/rate-linkage.html', title: 'Rate Linkage', category: 'Revenue', desc: 'Derived rates and parity management' },
    { href: '/guides/ota/what-is-ota.html', title: 'What is an OTA', category: 'OTA', desc: 'How OTAs work and what they cost' },
  ],
  '/guides/software/booking-engine.html': [
    { href: '/guides/revenue/hotel-rate-plans.html', title: 'Rate Plans', category: 'Revenue', desc: 'Display plans on your site' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Direct booking tax rules' },
  ],
  '/guides/software/what-is-rms-hotel.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Key metric for RMS' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Base rate for dynamic pricing' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'RMS performance tracking' },
  ],
  '/guides/software/what-is-pos-hotel.html': [
    { href: '/guides/reports/expenses-report.html', title: 'Expenses Report', category: 'Reports', desc: 'F&B cost tracking' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'F&B GST billing' },
  ],
  '/guides/software/hotel-inventory-management.html': [
    { href: '/guides/reports/expenses-report.html', title: 'Expenses Report', category: 'Reports', desc: 'Material cost tracking' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Cost impact on profitability' },
  ],
  '/guides/software/hotel-accounting-software.html': [
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST-compliant invoicing' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax deduction accounting' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Financial reporting' },
  ],
  // Reports
  '/guides/reports/manager-report.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Key metric in daily report' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Generate reports from PMS' },
  ],
  '/guides/reports/night-audit.html': [
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Night audit in PMS' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Tax reconciliation' },
  ],
  '/guides/reports/arrival-report.html': [
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Registration for arrivals' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Generate arrival lists' },
  ],
  '/guides/reports/departure-report.html': [
    { href: '/guides/reports/payment-report.html', title: 'Payment Report', category: 'Reports', desc: 'Collect pending payments' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Checkout process' },
  ],
  '/guides/reports/profit-loss-report.html': [
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Generate P&L statements' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Revenue performance' },
  ],
  '/guides/reports/expenses-report.html': [
    { href: '/guides/software/hotel-inventory-management.html', title: 'Inventory Management', category: 'Software', desc: 'Track material costs' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Expense categorization' },
  ],
  '/guides/reports/payment-report.html': [
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'OTA payment deductions' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Payment reconciliation' },
  ],
  // OTA
  '/guides/ota/what-is-ota.html': [
    { href: '/guides/ota/ota-hotel-meaning.html', title: 'OTA Meaning in Hotels', category: 'OTA', desc: 'The short definition, in plain terms' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync rates across all OTAs' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax deductions on OTA payments' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Measure revenue performance' },
  ],
  '/guides/ota/what-is-gds.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'GDS connectivity through CM' },
    { href: '/guides/ota/what-is-ota.html', title: 'What is OTA?', category: 'OTA', desc: 'OTA vs GDS comparison' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Set competitive GDS rates' },
  ],
  '/guides/ota/best-ota-for-hotels.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Manage all OTAs from one place' },
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Reduce OTA dependency' },
    { href: '/guides/revenue/hotel-rate-plans.html', title: 'Rate Plans', category: 'Revenue', desc: 'Set up EP, CP, MAP plans' },
  ],
  '/guides/ota/best-ota-for-resorts.html': [
    { href: '/guides/revenue/mlos.html', title: 'MLOS', category: 'Revenue', desc: 'Minimum stay for peak seasons' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync seasonal pricing' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Dynamic pricing for resorts' },
  ],
  '/guides/ota/best-ota-for-homestays.html': [
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST rules for homestays' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Guest registration requirements' },
    { href: '/guides/ota/what-is-ota.html', title: 'What is OTA?', category: 'OTA', desc: 'How OTAs work' },
  ],
  '/guides/ota/attract-international-guests-india.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync inventory across Booking.com, Expedia, and Agoda' },
    { href: '/guides/ota/booking-com-visibility-booster.html', title: 'Booking.com Visibility Booster', category: 'OTA', desc: 'Step-by-step guide to geo-targeting international travellers' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC and Form C', category: 'Compliance', desc: 'Legal requirements for foreign guests' },
  ],
  '/guides/ota/booking-com-hotel-listing-guide.html': [
    { href: '/guides/revenue/no-show.html', title: 'No-Show & Cancellation', category: 'Revenue', desc: 'Understanding no-show policies' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync availability with Booking.com' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax on Booking.com invoices' },
  ],
  // Compliance
  '/guides/compliance/gst-hotels.html': [
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'GST-compliant invoicing' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Tax impact on profits' },
  ],
  '/guides/compliance/tds-tcs.html': [
    { href: '/guides/reports/payment-report.html', title: 'Payment Report', category: 'Reports', desc: 'Track TDS/TCS deductions' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'TDS/TCS accounting' },
  ],
  '/guides/compliance/grc-form-c.html': [
    { href: '/guides/compliance/form-c-hotel.html', title: 'Form C for Hotels', category: 'Compliance', desc: 'Filing, deadlines and penalties' },
    { href: '/guides/reports/arrival-report.html', title: 'Arrival Report', category: 'Reports', desc: 'Plan guest registration' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Guest profile management' },
  ],
  // Operations
  '/guides/operations/hotel-check-in-process.html': [
    { href: '/guides/operations/hotel-staff-training.html', title: 'Hotel Staff Training', category: 'Operations', desc: 'Train the team running check-in' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Legal registration requirements at check-in' },
    { href: '/guides/revenue/no-show.html', title: 'No-Show & Cancellation', category: 'Revenue', desc: 'What happens when guests do not arrive' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Verify OTA payment models before check-in' },
  ],
  '/guides/operations/foc-hotel.html': [
    { href: '/guides/revenue/adr.html', title: 'ADR & ARR', category: 'Revenue', desc: 'How FOC rooms affect your average rate' },
    { href: '/guides/revenue/occupancy.html', title: 'Occupancy Rate', category: 'Revenue', desc: 'How FOC rooms count in occupancy' },
    { href: '/guides/reports/night-audit.html', title: 'Night Audit', category: 'Reports', desc: 'Reconciling FOC rooms in nightly reports' },
  ],

  // OTA
  '/guides/ota/makemytrip-hotel-listing.html': [
    { href: '/guides/ota/best-ota-for-hotels.html', title: 'Best OTAs for Hotels', category: 'OTA', desc: 'Compare MMT, Goibibo, Booking.com and Agoda' },
    { href: '/guides/ota/booking-com-hotel-listing-guide.html', title: 'Booking.com Listing Guide', category: 'OTA', desc: 'List on the other channel that matters' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Stop updating rates in every extranet' },
  ],
  '/guides/ota/ota-hotel-meaning.html': [
    { href: '/guides/ota/what-is-ota.html', title: 'What Is an OTA?', category: 'OTA', desc: 'How online travel agents actually work' },
    { href: '/guides/ota/best-ota-for-hotels.html', title: 'Best OTAs for Hotels', category: 'OTA', desc: 'Which channels suit your property' },
    { href: '/guides/ota/hotel-direct-booking-strategy.html', title: 'Direct Booking Strategy', category: 'OTA', desc: 'Keep more of every booking' },
  ],
  '/guides/ota/hotel-direct-booking-strategy.html': [
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Take reservations on your own site' },
    { href: '/guides/ota/google-free-booking-links.html', title: 'Google Free Booking Links', category: 'OTA', desc: 'Free direct bookings from Google' },
    { href: '/guides/ota/what-is-ota.html', title: 'What Is an OTA?', category: 'OTA', desc: 'Understand what you are balancing against' },
  ],
  '/guides/ota/booking-genius-program.html': [
    { href: '/guides/ota/booking-com-hotel-listing-guide.html', title: 'Booking.com Listing Guide', category: 'OTA', desc: 'Set the listing up properly first' },
    { href: '/guides/ota/booking-com-visibility-booster.html', title: 'Visibility Booster', category: 'OTA', desc: 'The other Booking.com ranking lever' },
    { href: '/guides/ota/best-ota-for-hotels.html', title: 'Best OTAs for Hotels', category: 'OTA', desc: 'Where Booking.com fits for Indian hotels' },
  ],
  '/guides/ota/booking-com-visibility-booster.html': [
    { href: '/guides/ota/booking-com-hotel-listing-guide.html', title: 'Booking.com Listing Guide', category: 'OTA', desc: 'Get the fundamentals right first' },
    { href: '/guides/ota/booking-genius-program.html', title: 'Genius Programme', category: 'OTA', desc: 'The discount side of Booking.com visibility' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'What you are discounting from' },
  ],
  '/guides/ota/google-free-booking-links.html': [
    { href: '/guides/ota/hotel-direct-booking-strategy.html', title: 'Direct Booking Strategy', category: 'OTA', desc: 'Where Google fits in your direct plan' },
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Where those free clicks need to land' },
    { href: '/guides/ota/what-is-ota.html', title: 'What Is an OTA?', category: 'OTA', desc: 'How Google differs from an OTA' },
  ],

  // Revenue
  '/guides/revenue/increase-hotel-revenue.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'The metric that tells you if it worked' },
    { href: '/guides/revenue/adr.html', title: 'ADR', category: 'Revenue', desc: 'Raise rate without losing occupancy' },
    { href: '/guides/revenue/occupancy.html', title: 'Occupancy', category: 'Revenue', desc: 'The other half of the equation' },
  ],
  '/guides/revenue/rate-linkage.html': [
    { href: '/guides/revenue/hotel-rate-plans.html', title: 'Hotel Rate Plans', category: 'Revenue', desc: 'The plans you are linking together' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'The rate everything else derives from' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Where linked rates are actually managed' },
  ],
  '/guides/revenue/trevpar.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'The room-only version of this metric' },
    { href: '/guides/revenue/adr.html', title: 'ADR', category: 'Revenue', desc: 'Average rate per occupied room' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Where total revenue actually lands' },
  ],

  // Operations
  '/guides/operations/hotel-cancellation-policy.html': [
    { href: '/guides/revenue/no-show.html', title: 'No-Shows', category: 'Revenue', desc: 'What happens when they simply do not arrive' },
    { href: '/guides/revenue/overbooking.html', title: 'Overbooking', category: 'Revenue', desc: 'Selling against expected cancellations' },
    { href: '/guides/operations/hotel-check-in-process.html', title: 'Check-In Process', category: 'Operations', desc: 'Where the policy gets enforced' },
  ],
  '/guides/operations/hotel-housekeeping-sop.html': [
    { href: '/guides/operations/hotel-staff-training.html', title: 'Staff Training', category: 'Operations', desc: 'Getting the team to follow the SOP' },
    { href: '/guides/operations/hotel-check-in-process.html', title: 'Check-In Process', category: 'Operations', desc: 'The other guest-facing SOP' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Tracking whether standards hold' },
  ],
  '/guides/operations/hotel-staff-training.html': [
    { href: '/guides/operations/hotel-housekeeping-sop.html', title: 'Housekeeping SOP', category: 'Operations', desc: 'The standard you are training against' },
    { href: '/guides/operations/hotel-check-in-process.html', title: 'Check-In Process', category: 'Operations', desc: 'Front office training essentials' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC and Form C', category: 'Compliance', desc: 'What reception must get right by law' },
  ],

  // Compliance
  '/guides/compliance/form-c-hotel.html': [
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC and Form C', category: 'Compliance', desc: 'How the guest registration card ties in' },
    { href: '/guides/operations/hotel-check-in-process.html', title: 'Check-In Process', category: 'Operations', desc: 'Collecting the details at the desk' },
    { href: '/guides/ota/attract-international-guests-india.html', title: 'International Guests', category: 'OTA', desc: 'Why Form C matters for foreign bookings' },
  ],
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  var currentPath = window.location.pathname;

  buildSidebar(currentPath);
  setupSidebarToggle();
  setupCategoryToggles();
  generateTOC();
  setupScrollSpy();
  injectPrevNext(currentPath);
  injectRelatedCards(currentPath);
});

// ===== SIDEBAR =====
function buildSidebar(currentPath) {
  var sidebar = document.querySelector('.guide-sidebar');
  if (!sidebar) return;

  var html = '<nav aria-label="Guide navigation">';

  GUIDE_CATEGORIES.forEach(function(cat) {
    var isCurrent = currentPath.indexOf(cat.basePath) === 0;
    var expandedClass = isCurrent ? ' expanded' : '';

    html += '<div class="sidebar-category' + expandedClass + '" data-category="' + cat.id + '">';
    html += '<div class="sidebar-category-header">';
    html += '<span>' + cat.icon + ' ' + cat.label + '</span>';
    html += '<span class="chevron">\u25B8</span>';
    html += '</div>';
    html += '<ul class="sidebar-guide-list">';

    cat.guides.forEach(function(guide) {
      var href = cat.basePath + guide.slug;
      var isActive = (currentPath.indexOf(guide.slug) !== -1 && currentPath.indexOf(cat.basePath) === 0) ? ' class="active"' : '';
      html += '<li><a href="' + href + '"' + isActive + '>' + guide.title + '</a></li>';
    });

    html += '</ul></div>';
  });

  html += '</nav>';
  sidebar.innerHTML = html;
}

// ===== SIDEBAR TOGGLE (mobile) =====
function setupSidebarToggle() {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.guide-sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', function() {
    var isOpen = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    toggle.textContent = isOpen ? '\u2715' : '\u2630';
  });

  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      toggle.textContent = '\u2630';
    });
  }
}

// ===== CATEGORY COLLAPSE/EXPAND =====
function setupCategoryToggles() {
  var headers = document.querySelectorAll('.sidebar-category-header');
  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      header.parentElement.classList.toggle('expanded');
    });
  });
}

// ===== TOC GENERATION =====
function generateTOC() {
  var tocContainer = document.querySelector('.guide-toc');
  if (!tocContainer) return;

  var articleContent = document.querySelector('.article-content');
  if (!articleContent) {
    tocContainer.style.display = 'none';
    var layout = document.querySelector('.guide-page-layout');
    if (layout) layout.classList.remove('has-toc');
    return;
  }

  var headings = articleContent.querySelectorAll('h2');
  if (headings.length < 4) {
    tocContainer.style.display = 'none';
    var layout2 = document.querySelector('.guide-page-layout');
    if (layout2) layout2.classList.remove('has-toc');
    return;
  }

  var html = '<h4>On This Page</h4><ul>';
  headings.forEach(function(h, i) {
    if (!h.id) h.id = 'section-' + i;
    html += '<li><a href="#' + h.id + '" data-toc-target="' + h.id + '">' + h.textContent + '</a></li>';
  });
  html += '</ul>';
  tocContainer.innerHTML = html;
}

// ===== SCROLL SPY =====
function setupScrollSpy() {
  var tocLinks = document.querySelectorAll('.guide-toc a[data-toc-target]');
  if (tocLinks.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        tocLinks.forEach(function(l) { l.classList.remove('active'); });
        var link = document.querySelector('.guide-toc a[data-toc-target="' + entry.target.id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  var headings = document.querySelectorAll('.article-content h2[id]');
  headings.forEach(function(h) { observer.observe(h); });
}

// ===== PREV/NEXT NAVIGATION =====
function injectPrevNext(currentPath) {
  var container = document.querySelector('.prev-next-nav');
  if (!container) return;

  // Pre-rendered as static HTML for crawlers; skip if already populated.
  if (container.querySelector('.prev-next-link, .prev-next-placeholder')) return;

  var prevGuide = null;
  var nextGuide = null;

  for (var c = 0; c < GUIDE_CATEGORIES.length; c++) {
    var cat = GUIDE_CATEGORIES[c];
    for (var i = 0; i < cat.guides.length; i++) {
      var guideSlug = cat.guides[i].slug;
      if (currentPath.indexOf(guideSlug) !== -1 && currentPath.indexOf(cat.basePath) === 0) {
        if (i > 0) {
          prevGuide = { title: cat.guides[i - 1].title, href: cat.basePath + cat.guides[i - 1].slug };
        }
        if (i < cat.guides.length - 1) {
          nextGuide = { title: cat.guides[i + 1].title, href: cat.basePath + cat.guides[i + 1].slug };
        }
        break;
      }
    }
    if (prevGuide || nextGuide) break;
  }

  if (!prevGuide && !nextGuide) {
    container.style.display = 'none';
    return;
  }

  var html = '';
  if (prevGuide) {
    html += '<a href="' + prevGuide.href + '" class="prev-next-link prev">';
    html += '<div class="pn-direction">Previous</div>';
    html += '<div class="pn-title">' + prevGuide.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  if (nextGuide) {
    html += '<a href="' + nextGuide.href + '" class="prev-next-link next">';
    html += '<div class="pn-direction">Next</div>';
    html += '<div class="pn-title">' + nextGuide.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  container.innerHTML = html;
}

// ===== RELATED CONTENT CARDS =====
// Picks up to 3 other guides from the same category as currentPath.
// Used when RELATED_CONTENT has no hand-picked entry for a guide.
function relatedFromSameCategory(currentPath) {
  for (var c = 0; c < GUIDE_CATEGORIES.length; c++) {
    var cat = GUIDE_CATEGORIES[c];
    if (currentPath.indexOf(cat.basePath) !== 0) continue;

    var picks = [];
    for (var i = 0; i < cat.guides.length && picks.length < 3; i++) {
      var g = cat.guides[i];
      if (currentPath.indexOf(g.slug) !== -1) continue; // skip the current page
      picks.push({
        href: cat.basePath + g.slug,
        title: g.title,
        category: cat.label,
        desc: 'More in ' + cat.label,
      });
    }
    return picks;
  }
  return [];
}

function injectRelatedCards(currentPath) {
  var container = document.querySelector('.related-cards-section');
  if (!container) return;

  // Related cards are pre-rendered as static HTML so crawlers can see them.
  // If they are already present, leave them alone.
  if (container.querySelector('.related-card')) return;

  var items = RELATED_CONTENT[currentPath];

  // No hand-picked entry for this guide: fall back to others in the same
  // category so a page can never dead-end. Hand-picked entries always win.
  if (!items || items.length === 0) {
    items = relatedFromSameCategory(currentPath);
  }

  if (!items || items.length === 0) {
    container.style.display = 'none';
    return;
  }

  var html = '<h3>You Might Also Like</h3><div class="related-cards-grid">';
  items.forEach(function(item) {
    html += '<a href="' + item.href + '" class="related-card">';
    html += '<div class="rc-category">' + item.category + '</div>';
    html += '<div class="rc-title">' + item.title + '</div>';
    html += '<div class="rc-desc">' + item.desc + '</div>';
    html += '</a>';
  });
  html += '</div>';
  container.innerHTML = html;
}
