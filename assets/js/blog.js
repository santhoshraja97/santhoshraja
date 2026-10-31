(() => {
  let all = [], tag = null;
  const list = document.getElementById('list'), q = document.getElementById('q'), tags = document.getElementById('tags');
  function render(){
    const term = q.value.trim().toLowerCase();
    const shown = all.filter(p => (!tag || (p.tags||[]).includes(tag)) && (!term || (p.title + ' ' + (p.summary||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(term)));
    list.innerHTML = shown.length ? shown.map(postCard).join('') : '<div class="empty">No posts match that yet.</div>';
    observeReveal(list);
  }
  fetch('posts/index.json').then(r => r.json()).then(d => {
    all = d;
    const ts = [...new Set(d.flatMap(p => p.tags || []))].sort();
    tags.innerHTML = '<button class="on" data-t="">All</button>' + ts.map(t => `<button data-t="${esc(t)}">${esc(t)}</button>`).join('');
    tags.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; tag = b.dataset.t || null; tags.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); render(); });
    render();
  }).catch(() => { list.innerHTML = '<div class="empty">Posts couldn\'t be loaded. (Previewing from a file? Run a local server — see README.)</div>'; });
  q.addEventListener('input', render);
})();
