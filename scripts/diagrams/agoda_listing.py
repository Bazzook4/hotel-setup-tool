"""Agoda listing guide: registration timeline. Facts from the guide's own
5 steps and its time/cost and rejection sections."""
import gd
from layouts import timeline

TITLE = 'How to list your hotel on Agoda, step by step'
DESC = ('Listing a hotel on Agoda takes five steps: about a week to go live and two weeks to the first booking. '
        'Apply free at agoda.com/list-my-property in 20 to 30 minutes; Agoda runs a fraud validation check of up to 72 hours, '
        'during which the listing is offline, then you sign the partner contract; build the listing in the Partner Portal; '
        'load rates and availability; and go live once Agoda approves the property. With a channel manager connected, '
        'never edit rates in the Partner Portal, because a manual edit overrides the sync.')


def spec(animate):
    wide, tall = timeline(
        'agl', title=TITLE, desc=DESC, animate=animate,
        steps=[
            dict(title='Apply', wide=['20 to 30 min,', 'free'], tall='agoda.com/list-my-property, free'),
            dict(title='Fraud check', wide=['up to 72 hours,', 'then contract'], tall='up to 72 hours offline, then the contract'),
            dict(title='Build listing', wide=['Partner Portal,', '200+ word text'], tall='Partner Portal, 200+ word description'),
            dict(title='Load rates', wide=['portal or', 'channel mgr'], tall='in the portal or a channel manager'),
            dict(title='Go live', wide=['after Agoda', 'approves it'], tall='after Agoda’s review team approves it'),
        ],
        span='About a week to go live, two weeks to your first booking',
        span_tall=['About a week to go live,', 'two weeks to your first booking'],
        notes=[
            dict(step=1, title='Why applications get delayed', lines=[
                'Bank account name differs from PAN', 'Trade licence expired (most common)',
                'Address differs from the one entered', 'Photos under 800×600px or over 4 MB']),
            dict(step=3, title='Change rates in one place only', lines=[
                'With a channel manager connected,', 'never edit rates in the Partner Portal.',
                'Agoda applies the latest update, so', 'a manual edit breaks the sync.']),
        ],
        status=['1. Apply free at agoda.com/list-my-property', '2. Fraud check up to 72 hours, then contract',
                '3. Build the listing in the Partner Portal', '4. Load rates and open your dates',
                '5. Go live once Agoda approves'],
    )
    return dict(
        page='guides/ota/agoda-hotel-listing.html', fig_id='agoda-listing-diagram',
        wide=wide, tall=tall, title=TITLE, desc=DESC,
        caption=('Registering on Agoda is free. The listing stays offline during the fraud check of up to 72 hours, '
                 'so allow about a week to go live and two weeks to your first booking.'),
        anchor_after='<h2 id="how-to-list-hotel-agoda">How to Register and List Your Hotel on Agoda: Step-by-Step</h2>',
        share_title='How to list your hotel on Agoda',
        share_sub='Five steps, free to register, about a week to go live.',
        image_slug='agoda-hotel-listing-steps',
        image_alt='Diagram: the five steps to list a hotel on Agoda, from the free application and fraud check to going live after Agoda approves the property',
    )


if __name__ == '__main__':
    gd.main(spec)
