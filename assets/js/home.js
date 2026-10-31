(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // typed role
  const roles = ['Certified SRE Implementation Expert','SRE AI Specialist','Observability & Monitoring','AWS · Azure'];
  const el = document.getElementById('typed');
  let ri = 0, ci = 0, del = false;
  (function type(){
    const w = roles[ri];
    el.textContent = '$ ' + w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(type, 1800); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 28 : 55);
  })();

  // counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const b = e.target, to = parseFloat(b.dataset.count), dec = to % 1 ? 1 : 0, t0 = performance.now();
    (function tick(t){
      const p = Math.min(1, (t - t0) / 1400), v = to * (1 - Math.pow(1 - p, 3));
      b.textContent = v.toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    cio.unobserve(b);
  }), {threshold: .6});
  document.querySelectorAll('[data-count]').forEach(b => cio.observe(b));

  // latest posts
  fetch('posts/index.json').then(r => r.json()).then(list => {
    const box = document.getElementById('latest-posts');
    box.innerHTML = list.slice(0,3).map(window.postCard).join('') || '<p class="muted">First post coming soon.</p>';
    observeReveal(box);
  }).catch(() => { document.getElementById('writing').style.display = 'none'; });

  // live clock
  const clock = document.getElementById('clock');
  setInterval(() => { clock.textContent = new Date().toLocaleTimeString('en-GB', {timeZone:'Asia/Kolkata'}) + ' IST'; }, 1000);

  // latency graph
  const cv = document.getElementById('graph'), ctx = cv.getContext('2d'), p99 = document.getElementById('p99');
  let pts = Array.from({length: 80}, () => 200 + Math.random() * 30), W, H;
  function size(){ const d = devicePixelRatio || 1; W = cv.clientWidth; H = cv.clientHeight; cv.width = W*d; cv.height = H*d; ctx.setTransform(d,0,0,d,0,0); }
  size(); addEventListener('resize', size);
  let spike = 0;
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(58,50,34,.5)'; ctx.lineWidth = 1;
    for (let y = 30; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    // SLO line
    const sloY = H - (320 - 120) / 260 * H;
    ctx.setLineDash([4,4]); ctx.strokeStyle = 'rgba(247,243,234,.35)';
    ctx.beginPath(); ctx.moveTo(0,sloY); ctx.lineTo(W,sloY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(247,243,234,.55)'; ctx.font = '10px JetBrains Mono, monospace'; ctx.fillText('SLO 320ms', W - 70, sloY - 5);
    const step = W / (pts.length - 1), Y = v => H - (v - 120) / 260 * H;
    const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(212,175,55,.28)'); g.addColorStop(1,'rgba(212,175,55,0)');
    ctx.beginPath(); ctx.moveTo(0, Y(pts[0]));
    pts.forEach((v,i) => ctx.lineTo(i*step, Y(v)));
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); pts.forEach((v,i) => i ? ctx.lineTo(i*step, Y(v)) : ctx.moveTo(0, Y(v)));
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1.6; ctx.stroke();
    const lx = W, ly = Y(pts[pts.length-1]);
    ctx.beginPath(); ctx.arc(lx-2, ly, 3.5, 0, 7); ctx.fillStyle = '#d4af37'; ctx.fill();
  }
  draw();
  if (!reduce) setInterval(() => {
    const last = pts[pts.length-1];
    let v = last + (Math.random() - .5) * 18 + (210 - last) * .08;
    if (spike > 0) { v += 70 * Math.sin(spike / 6 * Math.PI); spike--; }
    pts.push(Math.max(140, Math.min(370, v))); pts.shift();
    p99.textContent = Math.round(pts[pts.length-1]) + 'ms';
    draw();
  }, 260);

  // log stream
  const log = document.getElementById('log');
  const lines = [
    ['ok','INFO','health-check passed · eks/prod-api'],
    ['i','INFO','autoscaler: +2 pods (cpu 71%)'],
    ['ok','INFO','synthetic check · uptrends · 200 OK'],
    ['w','WARN','p99 latency climbing · checkout-svc'],
    ['i','AIOPS','anomaly correlated → runbook #42 triggered'],
    ['ok','INFO','auto-remediation complete · latency nominal'],
    ['ok','INFO','lambda cold-starts within budget'],
    ['i','INFO','postmortem PM-118 published'],
    ['ok','INFO','error budget burn rate 0.4x'],
  ];
  let li = 0;
  function addLine(){
    const [c, lvl, msg] = lines[li++ % lines.length];
    if (lvl === 'WARN') spike = 6;
    const t = new Date().toLocaleTimeString('en-GB', {timeZone:'Asia/Kolkata'});
    const p = document.createElement('p');
    p.innerHTML = `<span class="t">${t}</span> <span class="${c}">${lvl.padEnd(5,' ')}</span> ${msg}`;
    log.appendChild(p);
    while (log.children.length > 4) log.removeChild(log.firstChild);
  }
  for (let i = 0; i < 3; i++) addLine();
  if (!reduce) setInterval(addLine, 2200);
})();
