// Listing editor shared by the vendor portal and the admin page.
// Admins get the extra moderation fields; what a vendor can change is
// enforced by the database guard trigger, not by hiding fields here.
import {
  supabase, BUCKET, MAX_SCREENSHOTS, publicUrl, esc, checkImage, extOf, toast,
} from './supabase.js';

const STATUS_TEXT = {
  draft: 'Draft — not visible to hoteliers yet. Complete your listing and submit it for review.',
  pending: 'Submitted — the OnlineHotelier team is reviewing your listing.',
  approved: 'Live — your listing is published. Changes you save go live immediately.',
  rejected: 'Changes requested — see the note below, update your listing and resubmit.',
  suspended: 'Suspended — your listing is hidden. Contact the OnlineHotelier team.',
};

export async function renderEditor(root, companyId, { isAdmin = false, onChange } = {}) {
  root.innerHTML = '<p class="muted">Loading listing…</p>';

  const [companyRes, catsRes, servicesRes, shotsRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', companyId).single(),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('company_services').select('*').eq('company_id', companyId),
    supabase.from('company_screenshots').select('*').eq('company_id', companyId).order('sort_order'),
  ]);
  const err = companyRes.error || catsRes.error || servicesRes.error || shotsRes.error;
  if (err) {
    root.innerHTML = `<p class="error">Could not load this listing: ${esc(err.message)}</p>`;
    return;
  }

  const c = companyRes.data;
  const services = new Map(servicesRes.data.map((s) => [s.category_id, s.description || '']));
  const shots = shotsRes.data;
  const canSubmit = !isAdmin && ['draft', 'rejected'].includes(c.status);

  root.innerHTML = `
    <div class="status status-${c.status}">
      <strong>${esc(c.status.toUpperCase())}</strong>
      <span>${esc(STATUS_TEXT[c.status])}</span>
    </div>
    ${c.admin_note && !isAdmin ? `<div class="note"><strong>Note from OnlineHotelier:</strong> ${esc(c.admin_note)}</div>` : ''}

    <form id="listing-form" novalidate>
      ${isAdmin ? `
      <section class="card">
        <h2>Moderation</h2>
        <div class="grid-2">
          <div><label for="f-status">Status</label>
            <select id="f-status">${['draft', 'pending', 'approved', 'rejected', 'suspended']
              .map((s) => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div><label for="f-slug">URL slug</label><input id="f-slug" value="${esc(c.slug)}" pattern="[a-z0-9]+(-[a-z0-9]+)*"></div>
          <div><label for="f-owner">Vendor email (owner)</label><input id="f-owner" type="email" value="${esc(c.owner_email)}"></div>
          <div><label>Linked account</label><p class="muted">${c.owner_id ? 'Yes — vendor has signed in' : 'Not yet — links on first sign-in'}</p></div>
        </div>
        <label for="f-note">Note to vendor (shown on their dashboard)</label>
        <textarea id="f-note" rows="2">${esc(c.admin_note)}</textarea>
      </section>` : ''}

      <section class="card">
        <h2>Company</h2>
        <div class="logo-row">
          <div class="logo-box" id="logo-box">${c.logo_path
            ? `<img src="${esc(publicUrl(c.logo_path))}" alt="${esc(c.name)} logo">`
            : '<span class="muted">No logo</span>'}</div>
          <div>
            <label class="btn btn-secondary" for="f-logo">${c.logo_path ? 'Replace logo' : 'Upload logo'}</label>
            <input id="f-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
            <p class="hint">Square PNG, SVG or WebP, at least 256×256 px, under 5 MB.</p>
          </div>
        </div>
        <label for="f-name">Company name *</label>
        <input id="f-name" required maxlength="80" value="${esc(c.name)}">
        <label for="f-tagline">One-line summary</label>
        <input id="f-tagline" maxlength="140" value="${esc(c.tagline)}" placeholder="e.g. Cloud PMS and channel manager for Indian independent hotels">
        <div class="grid-3">
          <div><label for="f-website">Website</label><input id="f-website" type="url" value="${esc(c.website_url)}" placeholder="https://"></div>
          <div><label for="f-hq">Headquarters</label><input id="f-hq" maxlength="80" value="${esc(c.headquarters)}" placeholder="e.g. Bengaluru"></div>
          <div><label for="f-founded">Founded</label><input id="f-founded" type="number" min="1950" max="2100" value="${esc(c.founded_year)}"></div>
        </div>
        <label for="f-desc">About the company</label>
        <textarea id="f-desc" rows="6" maxlength="5000" placeholder="What you do, who you serve, which OTAs and systems you integrate with.">${esc(c.description)}</textarea>
      </section>

      <section class="card">
        <h2>Services you provide</h2>
        <p class="hint">Tick every category you offer. The short description appears on your listing under that category.</p>
        <div class="services">
          ${catsRes.data.map((cat) => `
          <div class="service ${services.has(cat.id) ? 'on' : ''}">
            <label class="check"><input type="checkbox" data-cat="${cat.id}" ${services.has(cat.id) ? 'checked' : ''}> ${esc(cat.name)}</label>
            <textarea data-desc="${cat.id}" rows="2" maxlength="500" placeholder="What you offer in ${esc(cat.name)}">${esc(services.get(cat.id))}</textarea>
          </div>`).join('')}
        </div>
      </section>

      <section class="card">
        <h2>Screenshots <span class="muted">(${shots.length}/${MAX_SCREENSHOTS})</span></h2>
        <p class="hint">Product screens hoteliers will recognise: dashboard, booking calendar, reports. 16:10 landscape works best.</p>
        <div class="shots">
          ${shots.map((s) => `
          <figure class="shot" data-id="${s.id}">
            <img src="${esc(publicUrl(s.path))}" alt="${esc(s.caption || 'Screenshot')}" loading="lazy">
            <input data-caption="${s.id}" maxlength="140" value="${esc(s.caption)}" placeholder="Caption" aria-label="Caption">
            <button type="button" class="btn btn-link" data-remove="${s.id}" data-path="${esc(s.path)}">Remove</button>
          </figure>`).join('')}
        </div>
        ${shots.length < MAX_SCREENSHOTS ? `
          <label class="btn btn-secondary" for="f-shots">Add screenshots</label>
          <input id="f-shots" type="file" multiple accept="image/png,image/jpeg,image/webp" hidden>` : ''}
      </section>

      <div class="actions">
        <button class="btn btn-primary" type="submit">Save changes</button>
        ${canSubmit ? '<button class="btn btn-secondary" type="button" id="submit-review">Save and submit for review</button>' : ''}
      </div>
    </form>`;

  const $ = (sel) => root.querySelector(sel);
  const reload = () => renderEditor(root, companyId, { isAdmin, onChange });

  root.querySelectorAll('[data-cat]').forEach((box) => box.addEventListener('change', () => {
    box.closest('.service').classList.toggle('on', box.checked);
  }));

  $('#f-logo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const problem = checkImage(file);
    if (problem) return toast(problem, true);
    const path = `${c.id}/logo-${Date.now()}.${extOf(file)}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000' });
    if (up.error) return toast(`Logo upload failed: ${up.error.message}`, true);
    const { error } = await supabase.from('companies').update({ logo_path: path }).eq('id', c.id);
    if (error) return toast(`Logo saved but not linked: ${error.message}`, true);
    if (c.logo_path) await supabase.storage.from(BUCKET).remove([c.logo_path]);
    toast('Logo updated');
    onChange?.();
    reload();
  });

  $('#f-shots')?.addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, MAX_SCREENSHOTS - shots.length);
    let order = shots.length ? Math.max(...shots.map((s) => s.sort_order)) + 1 : 0;
    for (const file of files) {
      const problem = checkImage(file);
      if (problem) { toast(problem, true); continue; }
      const path = `${c.id}/shots/${crypto.randomUUID()}.${extOf(file)}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000' });
      if (up.error) { toast(`${file.name}: ${up.error.message}`, true); continue; }
      const { error } = await supabase.from('company_screenshots')
        .insert({ company_id: c.id, path, sort_order: order++ });
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        toast(`${file.name}: ${error.message}`, true);
      }
    }
    reload();
  });

  root.querySelectorAll('[data-remove]').forEach((btn) => btn.addEventListener('click', async () => {
    if (!confirm('Remove this screenshot?')) return;
    const { error } = await supabase.from('company_screenshots').delete().eq('id', btn.dataset.remove);
    if (error) return toast(error.message, true);
    await supabase.storage.from(BUCKET).remove([btn.dataset.path]);
    reload();
  }));

  async function save(submit) {
    const name = $('#f-name').value.trim();
    const website = $('#f-website').value.trim();
    if (name.length < 2) return toast('Company name is required.', true);
    if (website && !/^https?:\/\//i.test(website)) return toast('Website must start with https://', true);

    const patch = {
      name,
      tagline: $('#f-tagline').value.trim() || null,
      website_url: website || null,
      headquarters: $('#f-hq').value.trim() || null,
      founded_year: $('#f-founded').value ? Number($('#f-founded').value) : null,
      description: $('#f-desc').value.trim() || null,
    };
    if (submit) patch.status = 'pending';
    if (isAdmin) {
      patch.status = $('#f-status').value;
      patch.slug = $('#f-slug').value.trim() || null;
      patch.owner_email = $('#f-owner').value.trim().toLowerCase() || null;
      patch.admin_note = $('#f-note').value.trim() || null;
    }

    const upd = await supabase.from('companies').update(patch).eq('id', c.id);
    if (upd.error) return toast(`Save failed: ${upd.error.message}`, true);

    const checked = [...root.querySelectorAll('[data-cat]:checked')].map((b) => Number(b.dataset.cat));
    const rows = checked.map((id) => ({
      company_id: c.id,
      category_id: id,
      description: root.querySelector(`[data-desc="${id}"]`).value.trim() || null,
    }));
    const unchecked = catsRes.data.map((cat) => cat.id).filter((id) => !checked.includes(id));
    const [ups, del] = await Promise.all([
      rows.length ? supabase.from('company_services').upsert(rows) : { error: null },
      unchecked.length
        ? supabase.from('company_services').delete().eq('company_id', c.id).in('category_id', unchecked)
        : { error: null },
    ]);
    if (ups.error || del.error) return toast(`Services not saved: ${(ups.error || del.error).message}`, true);

    const captions = [...root.querySelectorAll('[data-caption]')]
      .filter((inp) => inp.value.trim() !== (shots.find((s) => s.id === inp.dataset.caption)?.caption || ''));
    for (const inp of captions) {
      await supabase.from('company_screenshots').update({ caption: inp.value.trim() || null }).eq('id', inp.dataset.caption);
    }

    if (submit && !checked.length) toast('Saved. Tip: add at least one service so hoteliers can find you.');
    else toast(submit ? 'Submitted for review' : 'Saved');
    onChange?.();
    reload();
  }

  $('#listing-form').addEventListener('submit', (e) => { e.preventDefault(); save(false); });
  $('#submit-review')?.addEventListener('click', () => save(true));
}
