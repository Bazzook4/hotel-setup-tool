"""Booking.com guide: the pay-at-hotel model and the no-show trap. Facts and
the ₹5,000 / ₹1,000 example from the guide's own pay-at-hotel and no-show
sections (mark no-shows within 48 hours of the check-in date)."""
import gd
from gd import SVG, curve

TITLE = 'How Booking.com pay-at-hotel bookings work, and what a no-show costs you'
DESC = ('On Booking.com pay-at-hotel bookings, the guest pays nothing upfront. If the guest arrives, they pay you the full '
        '₹5,000 at the hotel, and at month end Booking.com invoices you ₹1,000 commission. If the guest does not arrive, '
        'mark the booking as a no-show in the extranet within 48 hours of the check-in date and no commission is due. '
        'If you do not mark it, Booking.com assumes the guest stayed and bills ₹1,000 anyway, and unpaid invoices can get the account suspended.')
STATUS = ['1. A guest books and pays nothing upfront', '2. They arrive and pay you ₹5,000',
          '3. Month end: you pay Booking.com ₹1,000', '4. No-show: mark it within 48 hours']
WIN = [(0.0, 0.22), (0.22, 0.44), (0.44, 0.66), (0.66, 0.98)]


def wide(animate):
    w = SVG('bph', '')
    w.card(2, 122, 172, 96, 'Guest books', ['pays nothing', 'upfront'], head='On Booking.com')
    w.line('M176,170 H206', 'hot')
    w.card(210, 134, 156, 72, 'Guest arrives?', ['on the check-in date'], kind='main')
    yes, no, miss = curve(368, 160, 418, 42), curve(368, 180, 418, 222), curve(368, 186, 418, 325)
    w.line(yes, 'hot'); w.line(no, 'hot'); w.line(miss, 'dash')
    w.card(420, 4, 292, 76, 'Guest pays you ₹5,000', ['at the hotel: cash, card or UPI'], head='Arrives')
    w.line('M566,82 V96', 'hot')
    w.card(420, 100, 292, 56, 'Month end: you pay ₹1,000', ['Booking.com\u2019s commission invoice'])
    w.card(420, 184, 292, 76, 'Mark it a no-show', ['within 48 hours: no commission due'], kind='out', head='No-show')
    w.card(420, 278, 292, 94, 'Billed ₹1,000 anyway', ['Unpaid invoices can get your', 'account suspended.'], head='No-show, not reported')
    if animate:
        w.dot('M60,170 H206', 0.04, 0.18)
        w.dot(yes, 0.24, 0.36)
        w.dot('M566,82 V96', 0.48, 0.56)
        w.dot(no, 0.68, 0.8)
        w.steps(2, 404, STATUS, WIN)
    return w.render('gd-wide', '0 0 715 416', TITLE, DESC, animate)


def tall(animate):
    t = SVG('bph', 'm')
    t.card(60, 10, 240, 62, 'Guest books on Booking.com', ['and pays nothing upfront'])
    t.line('M180,74 V98', 'hot')
    t.card(60, 102, 240, 62, 'Guest arrives?', ['on the check-in date'], kind='main')
    t.parts.append('<path class="gd-line" d="M180,166 V184 H24 V495"/>')
    t.line('M24,232 H44', 'hot')
    t.card(46, 196, 294, 76, 'Guest pays you ₹5,000', ['at the hotel: cash, card or UPI'], head='Arrives')
    t.line('M24,314 H44', 'hot')
    t.card(46, 286, 294, 56, 'Month end: you pay ₹1,000', ['Booking.com\u2019s commission invoice'])
    t.line('M24,396 H44', 'hot')
    t.card(46, 358, 294, 76, 'Mark it a no-show', ['within 48 hours: no commission due'], kind='out', head='No-show')
    t.line('M24,495 H44', 'dash')
    t.card(46, 450, 294, 94, 'Billed ₹1,000 anyway', ['Unpaid invoices can get your', 'account suspended.'], head='No-show, not reported')
    if animate:
        t.dot('M180,40 V98', 0.04, 0.18)
        t.dot('M180,166 V184 H24 V232 H44', 0.24, 0.36)
        t.dot('M24,232 V314 H44', 0.48, 0.56)
        t.dot('M180,166 V184 H24 V396 H44', 0.68, 0.8)
        t.steps(10, 574, STATUS, WIN)
    return t.render('gd-tall', '0 0 360 586', TITLE, DESC, animate)


def spec(animate):
    return dict(
        page='guides/ota/booking-com-hotel-listing-guide.html', fig_id='booking-pay-at-hotel-diagram',
        wide=wide(animate), tall=tall(animate), title=TITLE, desc=DESC,
        caption=('With pay-at-hotel, the guest pays you and you pay Booking.com its commission later. That makes the '
                 'no-show report your job: if you do not mark a no-show within 48 hours, you pay commission on money you never received.'),
        anchor_after='<h2 id="pay-at-hotel-model">The Pay-at-Hotel (Postpaid) Model</h2>',
        share_title='Booking.com pay-at-hotel and no-shows',
        share_sub='The guest pays you; you pay the commission. Unmarked no-shows still get billed.',
        image_slug='booking-com-pay-at-hotel',
        image_alt='Diagram: Booking.com pay-at-hotel flow, where the guest pays the hotel ₹5,000 and the hotel pays ₹1,000 commission, and an unmarked no-show is still billed',
    )


if __name__ == '__main__':
    gd.main(spec)
