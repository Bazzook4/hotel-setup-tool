"""Goibibo listing guide: one GoMMT registration lists the hotel on both
MakeMyTrip and Goibibo. Facts from the guide's relationship section."""
import gd
from gd import SVG, curve

TITLE = 'How one GoMMT registration lists your hotel on Goibibo and MakeMyTrip'
DESC = ('Goibibo and MakeMyTrip share the GoMMT extranet. One free registration lists your hotel on both. '
        'Rates and inventory you set apply to both platforms, bookings from both arrive in one reservations dashboard, '
        'payouts are settled together, and one commission contract covers both. The two brands keep separate apps and websites.')
SHARED = ['same rates and inventory', 'one bookings dashboard', 'payouts settled together', 'one commission contract']
STATUS = ['1. Register once on the GoMMT extranet', '2. Your rates and rooms go to both brands',
          '3. Bookings from both land in one dashboard', '4. One settlement, one contract']
WIN = [(0.0, 0.25), (0.25, 0.45), (0.45, 0.7), (0.7, 0.98)]


def wide(animate):
    w = SVG('gib', '')
    w.card(2, 110, 198, 80, 'GoMMT extranet', ['free, about 30 min'], head='Register once')
    w.line('M202,150 H228', 'hot')
    w.card(232, 72, 250, 156, 'One account', SHARED, kind='main', head='Shared by both brands')
    up, dn = curve(484, 150, 526, 70), curve(484, 150, 526, 230)
    w.line(up, 'hot'); w.line(dn, 'hot')
    w.card(528, 40, 184, 60, 'MakeMyTrip', ['own app and website'], kind='out')
    w.card(528, 200, 184, 60, 'Goibibo', ['own app and website'], kind='out')
    w.note(620, 146, ['Two brands,', 'one listing'], 'middle')
    if animate:
        w.dot('M60,150 H228', 0.06, 0.2)
        w.dot(up, 0.28, 0.4); w.dot(dn, 0.28, 0.4)
        w.dot(curve(526, 70, 484, 150), 0.5, 0.62); w.dot(curve(526, 230, 484, 150), 0.5, 0.62)
        w.highlight(232, 72, 250, 156, 0.7, 0.98)
        w.steps(2, 310, STATUS, WIN)
    return w.render('gd-wide', '0 0 715 322', TITLE, DESC, animate)


def tall(animate):
    t = SVG('gib', 'm')
    t.card(60, 10, 240, 72, 'GoMMT extranet', ['free, about 30 min'], head='Register once')
    t.line('M180,84 V108', 'hot')
    t.card(30, 112, 300, 140, 'One account', SHARED, kind='main', head='Shared by both brands')
    l, r = curve(180, 254, 95, 296, False), curve(180, 254, 265, 296, False)
    t.line(l, 'hot'); t.line(r, 'hot')
    t.card(20, 300, 150, 60, 'MakeMyTrip', ['own app, website'], kind='out')
    t.card(190, 300, 150, 60, 'Goibibo', ['own app, website'], kind='out')
    t.note(180, 388, ['Two brands, one listing'], 'middle')
    if animate:
        t.dot('M180,40 V108', 0.06, 0.2)
        t.dot(l, 0.28, 0.4); t.dot(r, 0.28, 0.4)
        t.dot(curve(95, 296, 180, 254, False), 0.5, 0.62); t.dot(curve(265, 296, 180, 254, False), 0.5, 0.62)
        t.highlight(30, 112, 300, 140, 0.7, 0.98)
        t.steps(10, 420, STATUS, WIN)
    return t.render('gd-tall', '0 0 360 432', TITLE, DESC, animate)


def spec(animate):
    return dict(
        page='guides/ota/goibibo-hotel-listing.html', fig_id='goibibo-gommt-diagram',
        wide=wide(animate), tall=tall(animate), title=TITLE, desc=DESC,
        caption=('You do not register on Goibibo separately. One GoMMT extranet account lists your hotel on Goibibo and '
                 'MakeMyTrip together, with the same rates, one bookings dashboard, payouts settled together and one contract.'),
        anchor_after='<h2 id="goibibo-makemytrip-relationship">The Goibibo and MakeMyTrip Relationship</h2>',
        share_title='Goibibo and MakeMyTrip: one registration',
        share_sub='One GoMMT extranet account lists your hotel on both brands.',
        image_slug='goibibo-gommt-registration',
        image_alt='Diagram: one GoMMT extranet registration lists a hotel on both Goibibo and MakeMyTrip, with shared rates, bookings dashboard, payouts and contract',
    )


if __name__ == '__main__':
    gd.main(spec)
