/**
 * OnlineHotelier — WhatsApp Chat Widget
 * Drop this script on any page to get the floating WhatsApp widget.
 * No dependencies required.
 */
(function () {
  // ── Styles ──────────────────────────────────────────────────────────────────
  var css = `
    #oh-wa-widget {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
      display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;
      font-family: 'Avenir', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #oh-wa-bubble {
      display: none; background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); padding: 1.25rem 1.5rem;
      width: 320px; animation: ohSlideUp 0.25s ease;
    }
    #oh-wa-bubble.oh-open { display: block; }
    @keyframes ohSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .oh-wa-header {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1rem; padding-bottom: 0.75rem;
      border-bottom: 1px solid #f0efe8;
    }
    .oh-wa-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, #3E3D35, #89826E);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }
    .oh-wa-name  { font-weight: 700; color: #3E3D35; font-size: 0.9rem; }
    .oh-wa-status {
      font-size: 0.78rem; color: #25D366;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .oh-wa-status::before {
      content: ""; width: 7px; height: 7px;
      border-radius: 50%; background: #25D366; display: inline-block;
    }
    .oh-wa-close {
      margin-left: auto; background: none; border: none;
      cursor: pointer; color: #aaa; font-size: 1.1rem; line-height: 1; padding: 0;
    }
    .oh-wa-intro { font-size: 0.88rem; color: #555; margin: 0 0 1rem; line-height: 1.6; }
    .oh-wa-fields { display: flex; flex-direction: column; gap: 0.65rem; }
    .oh-wa-label {
      font-size: 0.75rem; font-weight: 600; color: #89826E;
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;
    }
    .oh-wa-fields select,
    .oh-wa-fields input {
      width: 100%; padding: 0.6rem 0.85rem;
      border: 1.5px solid #ddd; border-radius: 8px;
      font-size: 0.88rem; font-family: inherit;
      background: #F8F8F4; color: #3E3D35; outline: none;
      transition: border-color 0.2s;
    }
    .oh-wa-fields select:focus,
    .oh-wa-fields input:focus { border-color: #89826E; }
    .oh-wa-send {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: #25D366; color: #fff; border: none; border-radius: 8px;
      padding: 0.75rem 1rem; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; width: 100%; font-family: inherit;
      margin-top: 0.25rem; transition: background 0.2s;
    }
    .oh-wa-send:hover { background: #20bd5a; }
    .oh-wa-note { font-size: 0.75rem; color: #aaa; text-align: center; margin-top: 0.4rem; }
    #oh-wa-fab {
      width: 58px; height: 58px; border-radius: 50%;
      background: #3E3D35; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(62,61,53,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0;
    }
    #oh-wa-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(62,61,53,0.5);
    }
    #oh-wa-fab img { width: 34px; height: 34px; }
    @media (max-width: 768px) {
      #oh-wa-widget { bottom: 1rem; right: 1rem; }
      #oh-wa-bubble { width: 290px; padding: 1rem 1.25rem; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HTML ─────────────────────────────────────────────────────────────────────
  var WA_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  var html = `
    <div id="oh-wa-widget">
      <div id="oh-wa-bubble">
        <div class="oh-wa-header">
          <div class="oh-wa-avatar">OH</div>
          <div>
            <div class="oh-wa-name">OnlineHotelier Team</div>
            <div class="oh-wa-status">Online now</div>
          </div>
          <button class="oh-wa-close" id="oh-wa-close-btn">✕</button>
        </div>
        <p class="oh-wa-intro">Hi! Tell us a little about your property and we'll get back to you right away.</p>
        <div class="oh-wa-fields">
          <div>
            <div class="oh-wa-label">I'm interested in</div>
            <select id="oh-wa-service">
              <option value="">Select a service…</option>
              <option value="OTA Listing (Airbnb, Booking.com, MakeMyTrip)">OTA Listing — Airbnb / Booking.com / MMT</option>
              <option value="Direct Booking Website">Direct Booking Website</option>
              <option value="Google My Business Setup">Google My Business Setup</option>
              <option value="Channel Manager Setup">Channel Manager Setup</option>
              <option value="OTA Management (ongoing)">OTA Management (ongoing)</option>
              <option value="multiple services — please advise">Not sure — need advice</option>
            </select>
          </div>
          <div>
            <div class="oh-wa-label">Property Type</div>
            <select id="oh-wa-proptype">
              <option value="">Select…</option>
              <option value="Homestay">Homestay</option>
              <option value="Independent Villa">Independent Villa</option>
              <option value="Holiday Apartment">Holiday Apartment</option>
              <option value="Boutique Hotel">Boutique Hotel</option>
              <option value="Farm Stay">Farm Stay</option>
              <option value="Eco Stay / Beach House">Eco Stay / Beach House</option>
              <option value="Heritage Property">Heritage Property</option>
              <option value="Service Apartment">Service Apartment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <div class="oh-wa-label">Number of Rooms / Units</div>
            <select id="oh-wa-inventory">
              <option value="">Select…</option>
              <option value="1 room">1 Room</option>
              <option value="2–10 rooms">2–10 Rooms</option>
              <option value="11–30 rooms">11–30 Rooms</option>
              <option value="30–50 rooms">30–50 Rooms</option>
              <option value="50+ rooms">50+ Rooms</option>
            </select>
          </div>
          <div>
            <div class="oh-wa-label">City / Location</div>
            <input type="text" id="oh-wa-location" placeholder="e.g. Goa, Manali, Coorg…" />
          </div>
          <div>
            <div class="oh-wa-label">Your Website (if any)</div>
            <input type="text" id="oh-wa-website" placeholder="e.g. https://myproperty.com" />
          </div>
          <div>
            <div class="oh-wa-label">How soon do you need this?</div>
            <select id="oh-wa-timeline">
              <option value="">Select…</option>
              <option value="ASAP — within a week">ASAP — within a week</option>
              <option value="within 2–4 weeks">Within 2–4 weeks</option>
              <option value="within 1–2 months">Within 1–2 months</option>
              <option value="just exploring for now">Just exploring for now</option>
            </select>
          </div>
          <button class="oh-wa-send" id="oh-wa-send-btn">
            ${WA_SVG}
            Send on WhatsApp
          </button>
          <div class="oh-wa-note">Opens WhatsApp with your details pre-filled</div>
        </div>
      </div>
      <button id="oh-wa-fab" aria-label="Chat on WhatsApp">
        <img src="https://static.wixstatic.com/media/fcb6f6_c584b0ee4aae4379ae4555ba7a5d4f61~mv2.png/v1/fill/w_118,h_118,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4017334_circle_logo_media_network_social_icon.png" alt="WhatsApp" />
      </button>
    </div>
  `;

  var container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // ── Logic ────────────────────────────────────────────────────────────────────
  var bubble = document.getElementById('oh-wa-bubble');
  var fab    = document.getElementById('oh-wa-fab');

  fab.addEventListener('click', function () {
    bubble.classList.toggle('oh-open');
  });

  document.getElementById('oh-wa-close-btn').addEventListener('click', function () {
    bubble.classList.remove('oh-open');
  });

  document.getElementById('oh-wa-send-btn').addEventListener('click', function () {
    var service   = document.getElementById('oh-wa-service').value;
    var proptype  = document.getElementById('oh-wa-proptype').value;
    var inventory = document.getElementById('oh-wa-inventory').value;
    var location  = document.getElementById('oh-wa-location').value.trim();
    var website   = document.getElementById('oh-wa-website').value.trim();
    var timeline  = document.getElementById('oh-wa-timeline').value;

    var parts = ['Hi! I came across OnlineHotelier Insights and would like to enquire.'];
    if (service)   parts.push('Service interested in: ' + service);
    if (proptype)  parts.push('Property type: ' + proptype);
    if (inventory) parts.push('Inventory: ' + inventory);
    if (location)  parts.push('Location: ' + location);
    if (website)   parts.push('Website: ' + website);
    if (timeline)  parts.push('Timeline: ' + timeline);
    parts.push('Please get in touch. Thank you.');

    var url = 'https://api.whatsapp.com/send?phone=918591756934&text=' + encodeURIComponent(parts.join('\n'));
    window.open(url, '_blank', 'noopener');
  });

  // Public API — pages can call ohWA.open() from their own CTAs
  window.ohWA = {
    open:   function () { bubble.classList.add('oh-open'); },
    close:  function () { bubble.classList.remove('oh-open'); },
    toggle: function () { bubble.classList.toggle('oh-open'); }
  };
})();
