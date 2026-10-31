/* Blog helpers shared by index, blog and post pages */
window.fmtDate = d => { const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}); };
window.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.postCard = p => `
  <a class="post-card card r" href="post.html?p=${encodeURIComponent(p.slug)}">
    <span class="ic">${esc(fmtDate(p.date))} · ${esc(p.readingTime || 3)} min read</span>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.summary || '')}</p>
    <div class="chips">${(p.tags||[]).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <span class="more">Read →</span>
  </a>`;

/* Shared behaviour for every page: background, nav, reveal, visitor counter */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = window.SITE_CONFIG || {};

  // observability background: gold service map with travelling traces + faint metric waves
  (function(){
    const c = document.getElementById('bg'), x = c.getContext('2d');
    let W, H, nodes = [], edges = [], packets = [], t = 0;
    const labels = ['api-gw','auth','orders','payments','eks','lambda','splunk','cloudwatch','pagerduty','redis','rds','queue','cdn','search'];
    function build(){
      const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
      c.width = W*d; c.height = H*d; x.setTransform(d,0,0,d,0,0);
      const n = W < 700 ? 9 : 14; nodes = [];
      for (let i = 0; i < n; i++) nodes.push({x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.12, vy:(Math.random()-.5)*.12, r: 2+Math.random()*2.5, label: labels[i%labels.length], ph: Math.random()*6});
      edges = [];
      nodes.forEach((a,i) => {
        nodes.map((b,j)=>({j,d:Math.hypot(a.x-b.x,a.y-b.y)})).filter(o=>o.j!==i).sort((p,q)=>p.d-q.d).slice(0,2)
          .forEach(o => { if (!edges.some(e=>(e[0]===o.j&&e[1]===i))) edges.push([i,o.j]); });
      });
    }
    build(); addEventListener('resize', build);
    function frame(){
      t += 1; x.clearRect(0,0,W,H);
      // metric waves
      for (let k = 0; k < 3; k++){
        x.beginPath();
        const base = H*(.25 + k*.27), amp = 18 + k*8;
        for (let px = 0; px <= W; px += 8){
          const y = base + Math.sin(px*.006 + t*.006*(k+1) + k) * amp + Math.sin(px*.021 + t*.01) * 5;
          px ? x.lineTo(px,y) : x.moveTo(px,y);
        }
        x.strokeStyle = `rgba(212,175,55,${.05 - k*.012})`; x.lineWidth = 1; x.stroke();
      }
      // move nodes
      nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x<0||n.x>W) n.vx*=-1; if (n.y<0||n.y>H) n.vy*=-1; });
      // edges
      edges.forEach(([i,j]) => { const a=nodes[i], b=nodes[j];
        x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(b.x,b.y);
        x.strokeStyle = 'rgba(212,175,55,.08)'; x.lineWidth = 1; x.stroke(); });
      // spawn trace packets
      if (Math.random() < .06 && edges.length) { const e = edges[Math.floor(Math.random()*edges.length)]; packets.push({e, p:0, s:.004+Math.random()*.006, rev:Math.random()<.5}); }
      packets = packets.filter(k => k.p <= 1);
      packets.forEach(k => { k.p += k.s; const [i,j] = k.rev ? [k.e[1],k.e[0]] : k.e, a=nodes[i], b=nodes[j];
        const px = a.x+(b.x-a.x)*k.p, py = a.y+(b.y-a.y)*k.p;
        const g = x.createRadialGradient(px,py,0,px,py,10); g.addColorStop(0,'rgba(249,231,167,.55)'); g.addColorStop(1,'rgba(212,175,55,0)');
        x.fillStyle = g; x.beginPath(); x.arc(px,py,10,0,7); x.fill();
        x.fillStyle = 'rgba(255,248,220,.8)'; x.beginPath(); x.arc(px,py,1.3,0,7); x.fill(); });
      // nodes
      x.font = '10px JetBrains Mono, monospace';
      nodes.forEach(n => { const pul = (Math.sin(t*.03+n.ph)+1)/2;
        x.beginPath(); x.arc(n.x,n.y,n.r+6+pul*6,0,7); x.strokeStyle = `rgba(212,175,55,${.12*(1-pul)})`; x.stroke();
        x.beginPath(); x.arc(n.x,n.y,n.r,0,7); x.fillStyle = 'rgba(212,175,55,.45)'; x.fill();
        x.fillStyle = 'rgba(163,157,144,.22)'; x.fillText(n.label, n.x+9, n.y+3); });
      if (!reduce) requestAnimationFrame(frame);
    }
    frame();
  })();


  // nav: border on scroll + mobile menu
  const nav = document.getElementById('nav');
  if (nav) {
    addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), {passive:true});
    const btn = nav.querySelector('.menu-btn');
    if (btn) btn.addEventListener('click', () => { const o = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    nav.querySelectorAll('.navlinks a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), {threshold: .12});
  window.observeReveal = root => (root || document).querySelectorAll('.r:not(.in)').forEach((n,i) => { n.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(n); });
  observeReveal();

  // card spotlight
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.card'); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // footer year + session uptime
  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
  const up = document.getElementById('uptime'), start = Date.now();
  if (up) setInterval(() => { const s = Math.floor((Date.now()-start)/1000); up.textContent = (s>=60?Math.floor(s/60)+'m ':'') + (s%60) + 's'; }, 1000);

  // ---- page-load counter (abacus.jasoncameron.dev) ----
  // Every page load increments the counter once; the value is shown in any [data-visits] element.
  const fmt = n => Number(n).toLocaleString('en-IN');
  const targets = document.querySelectorAll('[data-visits]');
  const ns = encodeURIComponent(CFG.counterNamespace || 'my-site'), key = encodeURIComponent(CFG.counterKey || 'page-loads');
  const isLocal = location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname);
  const url = `https://abacus.jasoncameron.dev/${isLocal ? 'get' : 'hit'}/${ns}/${key}`; // don't inflate the count while previewing locally
  function animateTo(el, to){
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), from = Math.max(0, to - 40);
    (function tick(t){ const p = Math.min(1,(t-t0)/1200); el.textContent = fmt(Math.round(from + (to-from)*(1-Math.pow(1-p,3)))); if (p<1) requestAnimationFrame(tick); })(t0);
  }
  if (targets.length || !isLocal) {
    fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => targets.forEach(el => animateTo(el, d.value)))
      .catch(() => targets.forEach(el => el.textContent = isLocal ? '0' : '—'));
  }
})();
