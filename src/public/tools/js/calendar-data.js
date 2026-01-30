/**
 * Shared Calendar Data for Hotel Tools
 * Used by both results.html and calendar.html
 * Single source of truth for all dates, events, and wedding muhurats
 */

const CalendarData = {
  year: 2026,

  // =============================================
  // LONG WEEKENDS & NATIONAL EVENTS
  // =============================================
  nationalEvents: [
    // Long Weekends
    { name: 'Republic Day Weekend', start: '2026-01-24', end: '2026-01-26', multiplier: 1.25, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Saturday to Monday long weekend. Patriotic tourism spike.' },
    { name: 'Holi Long Weekend', start: '2026-03-14', end: '2026-03-17', multiplier: 1.3, isLongWeekend: true, duration: 4, type: 'festival', strategy: 'Saturday to Tuesday. Holi on Monday. Leisure destinations peak.' },
    { name: 'Good Friday Weekend', start: '2026-04-03', end: '2026-04-05', multiplier: 1.25, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Friday to Sunday. Beach and hill stations popular.' },
    { name: 'Ambedkar Jayanti', start: '2026-04-14', end: '2026-04-14', multiplier: 1.15, isLongWeekend: false, duration: 1, type: 'national', strategy: 'Tuesday. Bridge day opportunity with Monday leave.' },
    { name: 'May Day Weekend', start: '2026-05-01', end: '2026-05-03', multiplier: 1.35, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Friday to Sunday. Summer vacation kickoff. Hill stations at capacity.' },
    { name: 'Independence Day Weekend', start: '2026-08-14', end: '2026-08-16', multiplier: 1.25, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Friday to Sunday. Janmashtami + Independence Day combo.' },
    { name: 'Gandhi Jayanti + Dussehra Weekend', start: '2026-10-02', end: '2026-10-04', multiplier: 1.3, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Friday to Sunday. Major travel window.' },
    { name: 'Diwali Week', start: '2026-10-17', end: '2026-10-21', multiplier: 1.45, isLongWeekend: true, duration: 5, type: 'festival', strategy: 'Saturday to Wednesday. Extended to full week by many.' },
    { name: 'Guru Nanak Jayanti', start: '2026-11-04', end: '2026-11-04', multiplier: 1.15, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Wednesday. Bridge day opportunities.' },
    { name: 'Christmas Weekend', start: '2026-12-25', end: '2026-12-27', multiplier: 1.4, isLongWeekend: true, duration: 3, type: 'national', strategy: 'Friday to Sunday. Peak tourist season.' },
    { name: 'New Year 2027 Weekend', start: '2026-12-31', end: '2027-01-03', multiplier: 1.5, isLongWeekend: true, duration: 4, type: 'national', strategy: 'Thursday to Sunday. Absolute peak. Gala packages essential.' },

    // Major Festivals (not long weekends but high impact)
    { name: 'Pongal / Makar Sankranti', start: '2026-01-14', end: '2026-01-16', multiplier: 1.15, isLongWeekend: false, duration: 3, type: 'festival', strategy: 'Wednesday to Friday. Harvest festival. Regional surge.' },
    { name: 'Maha Shivaratri', start: '2026-02-26', end: '2026-02-26', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Thursday. Pilgrimage destinations surge.' },
    { name: 'Holi', start: '2026-03-16', end: '2026-03-17', multiplier: 1.25, isLongWeekend: false, duration: 2, type: 'festival', strategy: 'Monday-Tuesday. Leisure destinations peak. City hotels may dip.' },
    { name: 'Ugadi / Gudi Padwa', start: '2026-03-22', end: '2026-03-22', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'regional', strategy: 'Sunday. South & West India New Year.' },
    { name: 'Ram Navami', start: '2026-04-02', end: '2026-04-02', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Thursday. Ayodhya & pilgrimage sites surge.' },
    { name: 'Mahavir Jayanti', start: '2026-04-10', end: '2026-04-10', multiplier: 1.05, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Friday. Jain pilgrimage destinations.' },
    { name: 'Baisakhi / Tamil New Year', start: '2026-04-13', end: '2026-04-14', multiplier: 1.2, isLongWeekend: false, duration: 2, type: 'regional', strategy: 'Monday-Tuesday. Regional surge in Punjab and Tamil Nadu.' },
    { name: 'Akshaya Tritiya', start: '2026-04-26', end: '2026-04-26', multiplier: 1.15, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Sunday. Most auspicious day for weddings & purchases.' },
    { name: 'Buddha Purnima', start: '2026-05-12', end: '2026-05-12', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Tuesday. Buddhist pilgrimage sites.' },
    { name: 'Eid ul-Fitr', start: '2026-03-20', end: '2026-03-21', multiplier: 1.15, isLongWeekend: false, duration: 2, type: 'festival', strategy: 'Friday-Saturday. Community travel spike.' },
    { name: 'Eid ul-Adha', start: '2026-05-27', end: '2026-05-28', multiplier: 1.15, isLongWeekend: false, duration: 2, type: 'festival', strategy: 'Wednesday-Thursday. Community gatherings.' },
    { name: 'Raksha Bandhan', start: '2026-08-28', end: '2026-08-28', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Friday. Short family visits.' },
    { name: 'Janmashtami', start: '2026-09-04', end: '2026-09-04', multiplier: 1.15, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Friday. Mathura-Vrindavan pilgrimage surge.' },
    { name: 'Ganesh Chaturthi', start: '2026-09-15', end: '2026-09-25', multiplier: 1.25, isLongWeekend: false, duration: 11, type: 'festival', strategy: 'Tuesday to Friday. Mumbai & Pune peak. Massive festival.' },
    { name: 'Navratri', start: '2026-10-18', end: '2026-10-26', multiplier: 1.2, isLongWeekend: false, duration: 9, type: 'festival', strategy: 'Sunday to Monday. 9-day festival. Extended bookings.' },
    { name: 'Durga Puja', start: '2026-10-20', end: '2026-10-23', multiplier: 1.25, isLongWeekend: false, duration: 4, type: 'festival', strategy: 'Tuesday to Friday. Bengal region peak.' },
    { name: 'Dussehra', start: '2026-10-21', end: '2026-10-21', multiplier: 1.2, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Wednesday. North India celebrates. Mysore Dasara famous.' },
    { name: 'Karwa Chauth', start: '2026-11-01', end: '2026-11-01', multiplier: 1.1, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Sunday. North India. Couple staycations.' },
    { name: 'Diwali', start: '2026-10-20', end: '2026-10-20', multiplier: 1.4, isLongWeekend: false, duration: 1, type: 'festival', strategy: 'Tuesday. Festival of Lights. Peak pricing.' },
    { name: 'Chhath Puja', start: '2026-11-18', end: '2026-11-21', multiplier: 1.2, isLongWeekend: false, duration: 4, type: 'festival', strategy: 'Wednesday to Saturday. Bihar & UP surge.' },

    // Summer Vacation
    { name: 'Summer Vacation Peak', start: '2026-05-01', end: '2026-06-15', multiplier: 1.3, isLongWeekend: false, duration: 46, type: 'season', strategy: 'School holidays. Family packages. Hill stations peak.' }
  ],

  // =============================================
  // REGIONAL EVENTS BY STATE
  // =============================================
  regionalEvents: {
    'Goa': [
      { name: 'Goa Carnival', start: '2026-02-14', end: '2026-02-17', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Saturday to Tuesday. Unique Goan celebration.' },
      { name: 'Sunburn Festival', start: '2026-12-28', end: '2026-12-30', multiplier: 1.5, isLongWeekend: false, type: 'regional', strategy: 'Monday to Wednesday. Asia\'s biggest EDM festival.' },
      { name: 'Shigmo Festival', start: '2026-03-14', end: '2026-03-28', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Goan spring festival with parades.' }
    ],
    'Kerala': [
      { name: 'Onam', start: '2026-08-23', end: '2026-08-26', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Sunday to Wednesday. Kerala\'s harvest festival.' },
      { name: 'Nehru Trophy Boat Race', start: '2026-08-08', end: '2026-08-08', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Saturday. Famous boat race in Alleppey.' },
      { name: 'Thrissur Pooram', start: '2026-05-03', end: '2026-05-03', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Sunday. Spectacular elephant procession.' }
    ],
    'West Bengal': [
      { name: 'Durga Puja (Regional Peak)', start: '2026-10-20', end: '2026-10-25', multiplier: 1.5, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Sunday. Kolkata transforms. Book months ahead.' },
      { name: 'Poila Boishakh', start: '2026-04-14', end: '2026-04-14', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Tuesday. Bengali New Year celebrations.' }
    ],
    'Tamil Nadu': [
      { name: 'Pongal', start: '2026-01-14', end: '2026-01-17', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Wednesday to Saturday. Harvest festival. Family gatherings.' },
      { name: 'Chithirai Festival', start: '2026-04-14', end: '2026-04-25', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Saturday. Madurai Meenakshi temple festival.' },
      { name: 'Jallikattu Season', start: '2026-01-15', end: '2026-01-30', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Bull-taming festival period in Tamil Nadu.' }
    ],
    'Punjab': [
      { name: 'Baisakhi', start: '2026-04-13', end: '2026-04-14', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Monday-Tuesday. Sikh new year. Golden Temple footfall.' },
      { name: 'Guru Nanak Jayanti', start: '2026-11-24', end: '2026-11-24', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Tuesday. Amritsar fully booked.' },
      { name: 'Lohri', start: '2026-01-13', end: '2026-01-13', multiplier: 1.1, isLongWeekend: false, type: 'regional', strategy: 'Tuesday. Bonfire festival celebrations.' }
    ],
    'Gujarat': [
      { name: 'Navratri Garba', start: '2026-10-18', end: '2026-10-26', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Sunday to Monday. 9 nights of Garba.' },
      { name: 'Rann Utsav', start: '2026-11-01', end: '2027-02-28', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Sunday onwards. 4-month cultural festival in Kutch.' },
      { name: 'International Kite Festival', start: '2026-01-07', end: '2026-01-14', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Wednesday to Wednesday. Ahmedabad kite festival.' }
    ],
    'Rajasthan': [
      { name: 'Pushkar Fair', start: '2026-11-23', end: '2026-11-27', multiplier: 1.5, isLongWeekend: false, type: 'regional', strategy: 'Monday to Friday. Iconic camel fair. 100% occupancy.' },
      { name: 'Desert Festival Jaisalmer', start: '2026-02-05', end: '2026-02-07', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Thursday to Saturday. Desert culture showcase.' },
      { name: 'Teej Festival', start: '2026-08-12', end: '2026-08-12', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Wednesday. Women\'s festival with processions.' }
    ],
    'Maharashtra': [
      { name: 'Ganesh Chaturthi (Mumbai Peak)', start: '2026-09-15', end: '2026-09-25', multiplier: 1.35, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Friday. Mumbai & Pune peak. Massive festival.' },
      { name: 'Gudi Padwa', start: '2026-03-21', end: '2026-03-21', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Saturday. Marathi New Year celebrations.' },
      { name: 'Pandharpur Wari', start: '2026-06-25', end: '2026-07-05', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Pilgrimage walk to Pandharpur.' }
    ],
    'Karnataka': [
      { name: 'Mysore Dasara', start: '2026-10-17', end: '2026-10-21', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Saturday to Wednesday. Grand Mysore palace celebrations.' },
      { name: 'Hampi Festival', start: '2026-01-09', end: '2026-01-11', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Friday to Sunday. Cultural festival at ruins.' },
      { name: 'Ugadi', start: '2026-03-22', end: '2026-03-22', multiplier: 1.1, isLongWeekend: false, type: 'regional', strategy: 'Sunday. Kannada New Year.' }
    ],
    'Odisha': [
      { name: 'Rath Yatra', start: '2026-06-20', end: '2026-06-28', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Saturday to Sunday. Puri temple chariot festival.' },
      { name: 'Konark Dance Festival', start: '2026-12-01', end: '2026-12-05', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Saturday. Classical dance at Sun Temple.' }
    ],
    'Assam': [
      { name: 'Bihu', start: '2026-04-14', end: '2026-04-16', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Thursday. Assamese New Year. Regional peak.' },
      { name: 'Ambubachi Mela', start: '2026-06-22', end: '2026-06-26', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Kamakhya Temple festival. Tantric pilgrimage.' }
    ],
    'Bihar': [
      { name: 'Chhath Puja', start: '2026-11-18', end: '2026-11-21', multiplier: 1.35, isLongWeekend: false, type: 'regional', strategy: 'Wednesday to Saturday. Major Bihar festival. High footfall.' },
      { name: 'Sonepur Mela', start: '2026-11-15', end: '2026-12-15', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Asia\'s largest cattle fair.' }
    ],
    'Uttarakhand': [
      { name: 'Char Dham Yatra Season', start: '2026-05-01', end: '2026-10-31', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Friday onwards. 6-month pilgrimage season. Book ahead.' },
      { name: 'Ganga Dussehra', start: '2026-06-11', end: '2026-06-11', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Thursday. Haridwar/Rishikesh surge.' },
      { name: 'International Yoga Day', start: '2026-06-21', end: '2026-06-21', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Sunday. Rishikesh peak.' }
    ],
    'Himachal Pradesh': [
      { name: 'Kullu Dussehra', start: '2026-10-21', end: '2026-10-28', multiplier: 1.35, isLongWeekend: false, type: 'regional', strategy: 'Wednesday to Wednesday. Famous week-long celebration.' },
      { name: 'Shimla Summer Festival', start: '2026-06-01', end: '2026-06-05', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Monday to Friday. Cultural programs and activities.' }
    ],
    'Ladakh': [
      { name: 'Hemis Festival', start: '2026-07-12', end: '2026-07-13', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Sunday-Monday. Largest monastery festival.' },
      { name: 'Ladakh Festival', start: '2026-09-01', end: '2026-09-15', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Tuesday onwards. Cultural showcase in Leh.' },
      { name: 'Losar', start: '2026-02-17', end: '2026-02-18', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Tuesday-Wednesday. Tibetan New Year.' }
    ],
    'Jammu & Kashmir': [
      { name: 'Tulip Festival', start: '2026-03-20', end: '2026-04-10', multiplier: 1.35, isLongWeekend: false, type: 'regional', strategy: 'Friday to Friday. Srinagar tulip garden peak.' },
      { name: 'Shikara Festival', start: '2026-07-18', end: '2026-07-21', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Saturday to Tuesday. Dal Lake celebrations.' },
      { name: 'Amarnath Yatra', start: '2026-07-01', end: '2026-08-15', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Pilgrimage season. High demand in Pahalgam & Baltal.' }
    ],
    'Andaman & Nicobar Islands': [
      { name: 'Island Tourism Festival', start: '2026-01-05', end: '2026-01-14', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Monday to Wednesday. Cultural and adventure activities.' }
    ],
    'Sikkim': [
      { name: 'Losar Festival', start: '2026-02-17', end: '2026-02-18', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Tuesday-Wednesday. Tibetan New Year celebrations.' },
      { name: 'Saga Dawa', start: '2026-06-10', end: '2026-06-10', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Wednesday. Buddha\'s birth, enlightenment & death.' }
    ],
    'Meghalaya': [
      { name: 'Shillong Cherry Blossom', start: '2026-11-13', end: '2026-11-15', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Friday to Sunday. Cherry blossom festival.' },
      { name: 'Wangala Festival', start: '2026-11-10', end: '2026-11-12', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: '100 Drums festival of Garos.' }
    ],
    'Nagaland': [
      { name: 'Hornbill Festival', start: '2026-12-01', end: '2026-12-10', multiplier: 1.5, isLongWeekend: false, type: 'regional', strategy: 'Tuesday to Thursday. Festival of Festivals. Major cultural event.' }
    ],
    'Arunachal Pradesh': [
      { name: 'Ziro Music Festival', start: '2026-09-24', end: '2026-09-27', multiplier: 1.35, isLongWeekend: false, type: 'regional', strategy: 'Thursday to Sunday. Indie music in Ziro valley.' },
      { name: 'Tawang Festival', start: '2026-10-15', end: '2026-10-17', multiplier: 1.25, isLongWeekend: false, type: 'regional', strategy: 'Thursday to Saturday. Buddhist cultural fest.' }
    ],
    'Madhya Pradesh': [
      { name: 'Khajuraho Dance Festival', start: '2026-02-20', end: '2026-02-26', multiplier: 1.3, isLongWeekend: false, type: 'regional', strategy: 'Friday to Thursday. Classical dance at temples.' },
      { name: 'Mandu Festival', start: '2026-12-27', end: '2026-12-29', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Sunday to Tuesday. Heritage celebration.' }
    ],
    'Andhra Pradesh': [
      { name: 'Brahmotsavam (Tirupati)', start: '2026-10-01', end: '2026-10-09', multiplier: 1.4, isLongWeekend: false, type: 'regional', strategy: 'Thursday to Friday. Tirupati temple festival. Peak pilgrimage.' },
      { name: 'Ugadi', start: '2026-03-22', end: '2026-03-22', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Sunday. Telugu New Year.' }
    ],
    'Telangana': [
      { name: 'Bathukamma', start: '2026-10-12', end: '2026-10-20', multiplier: 1.2, isLongWeekend: false, type: 'regional', strategy: 'Monday to Tuesday. Floral festival of Telangana.' },
      { name: 'Bonalu', start: '2026-07-12', end: '2026-08-02', multiplier: 1.15, isLongWeekend: false, type: 'regional', strategy: 'Hyderabad goddess festival period.' }
    ]
  },

  // =============================================
  // WEDDING MUHURAT DATES 2026
  // =============================================
  weddingMuhurats: {
    'January': {
      count: 12,
      dates: ['18', '19', '20', '21', '23', '25', '26', '27', '29', '30', '31'],
      ranges: ['Jan 18-21 (Sun-Wed)', 'Jan 23, 25-27 (Fri-Tue)', 'Jan 29-31 (Thu-Sat)'],
      note: 'Post Makar Sankranti - Very auspicious period',
      season: 'peak'
    },
    'February': {
      count: 14,
      dates: ['1', '2', '4', '5', '6', '8', '9', '11', '12', '13', '15', '16', '19', '20'],
      ranges: ['Feb 1-2, 4-6 (Sun-Fri)', 'Feb 8-9, 11-13 (Sun-Fri)', 'Feb 15-16, 19-20 (Sun-Fri)'],
      note: 'Before Maha Shivratri - Premium wedding window',
      season: 'peak'
    },
    'March': {
      count: 3,
      dates: ['1', '2', '8'],
      ranges: ['Mar 1-2 (Sun-Mon)', 'Mar 8 (Sun) before Holi'],
      note: 'Holashtak period (Mar 9-17) - No muhurats. Lower demand.',
      season: 'low'
    },
    'April': {
      count: 10,
      dates: ['16', '17', '19', '20', '22', '23', '24', '26', '28', '29'],
      ranges: ['Apr 16-17, 19-20 (Thu-Mon)', 'Apr 22-24, 26 (Wed-Sun)', 'Apr 28-29 (Tue-Wed)'],
      note: 'Akshaya Tritiya (Apr 26) - Most auspicious day',
      season: 'moderate'
    },
    'May': {
      count: 15,
      dates: ['1', '3', '4', '6', '7', '10', '11', '13', '14', '15', '17', '18', '20', '21', '22'],
      ranges: ['May 1, 3-4, 6-7 (Fri-Thu)', 'May 10-11, 13-15 (Sun-Fri)', 'May 17-18, 20-22 (Sun-Fri)'],
      note: 'Before summer heat - Very high demand',
      season: 'peak'
    },
    'June': {
      count: 8,
      dates: ['1', '3', '4', '5', '7', '8', '10', '11'],
      ranges: ['Jun 1, 3-5 (Mon-Fri)', 'Jun 7-8, 10-11 (Sun-Thu)'],
      note: 'Before monsoon - Last window until November',
      season: 'moderate'
    },
    'July': {
      count: 0,
      dates: [],
      ranges: [],
      note: 'Chaturmas begins - No wedding muhurats',
      season: 'off'
    },
    'August': {
      count: 0,
      dates: [],
      ranges: [],
      note: 'Shravan month - No wedding muhurats',
      season: 'off'
    },
    'September': {
      count: 0,
      dates: [],
      ranges: [],
      note: 'Pitru Paksha / Shraddh period - No wedding muhurats',
      season: 'off'
    },
    'October': {
      count: 0,
      dates: [],
      ranges: [],
      note: 'Navratri & Diwali preparations - Very limited muhurats',
      season: 'off'
    },
    'November': {
      count: 12,
      dates: ['9', '11', '12', '13', '18', '19', '20', '22', '25', '26', '27', '29'],
      ranges: ['Nov 9, 11-13 (Mon-Fri) Post Diwali', 'Nov 18-20, 22 (Wed-Sun)', 'Nov 25-27, 29 (Wed-Sun)'],
      note: 'Dev Uthani Ekadashi onwards - Premium rates',
      season: 'peak'
    },
    'December': {
      count: 10,
      dates: ['1', '2', '3', '4', '6', '7', '9', '10', '13', '14'],
      ranges: ['Dec 1-4 (Tue-Fri)', 'Dec 6-7, 9-10 (Sun-Thu)', 'Dec 13-14 (Sun-Mon)'],
      note: 'Destination wedding peak + Christmas tourism',
      season: 'peak'
    }
  },

  // =============================================
  // REGIONAL WEDDING PATTERNS
  // =============================================
  regionalWeddingPatterns: {
    'North India': {
      states: ['Punjab', 'Haryana', 'Delhi', 'Uttar Pradesh', 'Rajasthan', 'Uttarakhand', 'Himachal Pradesh'],
      peak: 'Nov-Feb, Apr-Jun',
      avoid: 'Sawan (Jul-Aug), Pitru Paksha (Sep)',
      note: 'Follows Hindu Panchang strictly'
    },
    'South India': {
      states: ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'],
      peak: 'Jan-Feb, May-Jun, Nov-Dec',
      avoid: 'Aadi month (Jul-Aug) in Tamil Nadu',
      note: 'Tamil weddings follow different calendar'
    },
    'West India': {
      states: ['Maharashtra', 'Gujarat', 'Goa'],
      peak: 'Nov-Feb, Apr-May',
      avoid: 'Shravan month',
      note: 'Gujaratis prefer Kartik & Vaishakh months'
    },
    'East India': {
      states: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
      peak: 'Nov-Feb, May-Jun',
      avoid: 'Bhado month (Aug-Sep)',
      note: 'Bengali weddings peak in specific tithis'
    }
  },

  // =============================================
  // MONTHLY CALENDAR VIEW DATA
  // =============================================
  monthlyCalendar: {
    'January': [
      { date: '1', name: "New Year's Day", type: 'national' },
      { date: '13', name: 'Lohri', type: 'regional' },
      { date: '14', name: 'Makar Sankranti / Pongal', type: 'festival' },
      { date: '18-31', name: 'Wedding Season Peak', type: 'wedding' },
      { date: '26', name: 'Republic Day', type: 'national' }
    ],
    'February': [
      { date: '1-20', name: 'Wedding Season Peak', type: 'wedding' },
      { date: '2', name: 'Vasant Panchami', type: 'festival' },
      { date: '14-17', name: 'Goa Carnival', type: 'regional' },
      { date: '26', name: 'Maha Shivaratri', type: 'festival' }
    ],
    'March': [
      { date: '9-17', name: 'Holashtak (No weddings)', type: 'festival' },
      { date: '14-17', name: 'Holi Long Weekend', type: 'longweekend' },
      { date: '16-17', name: 'Holi', type: 'festival' },
      { date: '20-21', name: 'Eid ul-Fitr', type: 'festival' },
      { date: '22', name: 'Ugadi / Gudi Padwa', type: 'regional' }
    ],
    'April': [
      { date: '2', name: 'Ram Navami', type: 'festival' },
      { date: '3', name: 'Good Friday', type: 'national' },
      { date: '10', name: 'Mahavir Jayanti', type: 'festival' },
      { date: '13-14', name: 'Baisakhi / Tamil New Year', type: 'regional' },
      { date: '14', name: 'Ambedkar Jayanti', type: 'national' },
      { date: '16-29', name: 'Wedding Season', type: 'wedding' },
      { date: '26', name: 'Akshaya Tritiya', type: 'festival' }
    ],
    'May': [
      { date: '1', name: 'May Day / Labour Day', type: 'national' },
      { date: '1-22', name: 'Wedding Season Peak', type: 'wedding' },
      { date: '1-15', name: 'Summer Vacation Peak', type: 'season' },
      { date: '12', name: 'Buddha Purnima', type: 'festival' },
      { date: '27-28', name: 'Eid ul-Adha', type: 'festival' }
    ],
    'June': [
      { date: '1-11', name: 'Wedding Season (Last Window)', type: 'wedding' },
      { date: '20-28', name: 'Rath Yatra (Puri)', type: 'regional' },
      { date: '21', name: 'International Yoga Day', type: 'festival' }
    ],
    'July': [
      { date: '1-Aug 15', name: 'Amarnath Yatra', type: 'regional' },
      { date: '12-13', name: 'Hemis Festival (Ladakh)', type: 'regional' },
      { date: 'All', name: 'Chaturmas - No Weddings', type: 'info' }
    ],
    'August': [
      { date: '14-16', name: 'Independence Day + Janmashtami Weekend', type: 'longweekend' },
      { date: '15', name: 'Independence Day', type: 'national' },
      { date: '23-26', name: 'Onam (Kerala)', type: 'regional' },
      { date: '28', name: 'Raksha Bandhan', type: 'festival' }
    ],
    'September': [
      { date: '4', name: 'Janmashtami', type: 'festival' },
      { date: '15-25', name: 'Ganesh Chaturthi', type: 'festival' },
      { date: 'All', name: 'Pitru Paksha - No Weddings', type: 'info' }
    ],
    'October': [
      { date: '2', name: 'Gandhi Jayanti', type: 'national' },
      { date: '2-4', name: 'Gandhi Jayanti Weekend', type: 'longweekend' },
      { date: '17-21', name: 'Mysore Dasara', type: 'regional' },
      { date: '17-21', name: 'Diwali Week', type: 'longweekend' },
      { date: '18-26', name: 'Navratri', type: 'festival' },
      { date: '20', name: 'Diwali', type: 'festival' },
      { date: '20-23', name: 'Durga Puja', type: 'festival' },
      { date: '21', name: 'Dussehra', type: 'festival' }
    ],
    'November': [
      { date: '1', name: 'Karwa Chauth', type: 'festival' },
      { date: '4', name: 'Guru Nanak Jayanti', type: 'festival' },
      { date: '9-29', name: 'Wedding Season Resumes', type: 'wedding' },
      { date: '18-21', name: 'Chhath Puja', type: 'regional' },
      { date: '23-27', name: 'Pushkar Fair', type: 'regional' }
    ],
    'December': [
      { date: '1-14', name: 'Wedding Season Peak', type: 'wedding' },
      { date: '1-10', name: 'Hornbill Festival (Nagaland)', type: 'regional' },
      { date: '25', name: 'Christmas', type: 'national' },
      { date: '25-27', name: 'Christmas Weekend', type: 'longweekend' },
      { date: '28-30', name: 'Sunburn Festival (Goa)', type: 'regional' },
      { date: '31', name: "New Year's Eve", type: 'national' }
    ]
  },

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  /**
   * Get all events for a specific state (national + regional)
   */
  getEventsForState(state) {
    let events = [...this.nationalEvents];
    if (state && this.regionalEvents[state]) {
      events = [...events, ...this.regionalEvents[state]];
    }
    // Remove duplicates and sort by date
    events = events.filter((event, index, self) =>
      index === self.findIndex((e) => e.name === event.name && e.start === event.start)
    );
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    return events;
  },

  /**
   * Get only long weekends
   */
  getLongWeekends() {
    return this.nationalEvents.filter(e => e.isLongWeekend);
  },

  /**
   * Get wedding muhurat info for a month
   */
  getWeddingMuhurats(month) {
    return this.weddingMuhurats[month] || null;
  },

  /**
   * Get total wedding muhurat days
   */
  getTotalWeddingDays() {
    return Object.values(this.weddingMuhurats).reduce((sum, m) => sum + m.count, 0);
  },

  /**
   * Check if a date falls in wedding season
   */
  isWeddingSeason(month) {
    const data = this.weddingMuhurats[month];
    return data && data.season === 'peak';
  },

  /**
   * Get monthly calendar events
   */
  getMonthlyEvents(month) {
    return this.monthlyCalendar[month] || [];
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.CalendarData = CalendarData;
}

// For module exports (if using in Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarData;
}
