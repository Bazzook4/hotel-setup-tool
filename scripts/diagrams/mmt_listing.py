"""MakeMyTrip listing guide: registration timeline. Facts from the guide's
own 5 steps and its time/cost and rejection sections."""
import gd
from layouts import timeline

TITLE = 'How to list your hotel on MakeMyTrip, step by step'
DESC = ('Listing a hotel on MakeMyTrip takes five steps and about two weeks from sign-up to the first booking. '
        'Register free on the GoMMT extranet in about 30 minutes; complete KYC with GSTIN, PAN, a cancelled cheque and a trade licence, '
        'which takes 3 to 7 working days; build the listing with room types, policies and at least 25 photos; load rates and availability; '
        'then go live on both MakeMyTrip and Goibibo. Expect a slow first month until the first 5 to 10 reviews.')


def spec(animate):
    wide, tall = timeline(
        'mmtl', title=TITLE, desc=DESC, animate=animate,
        steps=[
            dict(title='Register', wide=['GoMMT extranet', '30 min, free'], tall='GoMMT extranet, 30 min, free'),
            dict(title='KYC check', wide=['3 to 7', 'working days'], tall='GSTIN, PAN, cheque, licence: 3 to 7 days'),
            dict(title='Build listing', wide=['rooms, policies,', '25+ photos'], tall='rooms, policies, 25+ photos'),
            dict(title='Load rates', wide=['extranet or', 'channel mgr'], tall='in the extranet or a channel manager'),
            dict(title='Go live', wide=['on MakeMyTrip', 'and Goibibo'], tall='on MakeMyTrip and Goibibo together'),
        ],
        span='About two weeks from sign-up to your first booking',
        notes=[
            dict(step=1, title='Why KYC gets delayed', lines=[
                'Bank account name differs from PAN', 'Trade licence expired (most common)',
                'Blurred or cropped document scans', 'Under 25 photos, or below 1280×960px']),
            dict(step=4, title='Expect a slow first month', lines=[
                'New listings have no reviews, so', 'MakeMyTrip ranks them lower.',
                'Bookings usually pick up after', 'the first 5 to 10 reviews.']),
        ],
        status=['1. Register free on the GoMMT extranet', '2. Upload GSTIN, PAN, cheque and licence',
                '3. Add rooms, policies and 25+ photos', '4. Load rates and open your dates',
                '5. Go live on MakeMyTrip and Goibibo'],
    )
    return dict(
        page='guides/ota/makemytrip-hotel-listing.html', fig_id='mmt-listing-diagram',
        wide=wide, tall=tall, title=TITLE, desc=DESC,
        caption=('Registering on MakeMyTrip is free and the form takes about 30 minutes. Most of the two weeks is '
                 'KYC verification, so have clean scans of every document ready, and keep the bank account name '
                 'identical to the PAN name.'),
        anchor_after='<h2 id="how-to-list-hotel-makemytrip">How to Register and List Your Hotel on MakeMyTrip: 5 Steps</h2>',
        share_title='How to list your hotel on MakeMyTrip',
        share_sub='Five steps, free to register, about two weeks to your first booking.',
        image_slug='makemytrip-hotel-listing-steps',
        image_alt='Diagram: the five steps to list a hotel on MakeMyTrip, from free GoMMT extranet registration and KYC to going live on MakeMyTrip and Goibibo',
    )


if __name__ == '__main__':
    gd.main(spec)
