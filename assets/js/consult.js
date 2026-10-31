(() => {
  const CFG = window.SITE_CONFIG, f = document.getElementById('consult-form'), st = document.getElementById('status'), btn = document.getElementById('send');
  const alt = document.getElementById('mail-alt'); alt.textContent = CFG.contactEmail; alt.href = 'mailto:' + CFG.contactEmail;
  const mailFallback = d => 'mailto:' + CFG.contactEmail + '?subject=' + encodeURIComponent('SRE consult: ' + d.topic) + '&body=' + encodeURIComponent(Object.entries(d).map(([k,v]) => k + ': ' + v).join('\n\n'));
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (d._honey) return;
    if (!d.name || !d.email || !/^\S+@\S+\.\S+$/.test(d.email) || (d.scenario||'').trim().length < 20) {
      st.className = 'form-status err'; st.textContent = 'Please add your name, a valid email and a few lines about the scenario (20+ characters).'; return;
    }
    delete d._honey;
    btn.disabled = true; btn.textContent = 'Sending…'; st.className = 'form-status'; st.textContent = '';
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.contactEmail), {
        method: 'POST', headers: {'Content-Type':'application/json', 'Accept':'application/json'},
        body: JSON.stringify({ ...d, _subject: `SRE consult [${d.urgency}] ${d.topic} — ${d.name}`, _replyto: d.email, _template: 'table', _captcha: 'false' })
      });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || String(res.success) === 'false') throw new Error(res.message || 'Request failed');
      f.reset(); st.className = 'form-status ok';
      st.textContent = '✦ Received. Thank you — I\'ll reply to ' + d.email + ' soon.';
    } catch (err) {
      st.className = 'form-status err';
      st.innerHTML = 'Couldn\'t send just now (' + esc(err.message) + '). <a style="color:var(--ok)" href="' + mailFallback(d) + '">Send it by email instead →</a>';
    } finally { btn.disabled = false; btn.textContent = 'Send scenario ✦'; }
  });
})();
