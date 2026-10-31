(() => {
  const slug = new URLSearchParams(location.search).get('p') || '';
  const T = document.getElementById('title'), M = document.getElementById('meta'), B = document.getElementById('body');
  if (!/^[a-z0-9-]+$/i.test(slug)) { T.textContent = 'Post not found'; return; }
  fetch('posts/' + slug + '.md').then(r => { if (!r.ok) throw 0; return r.text(); }).then(src => {
    const {meta, body} = parsePost(src);
    document.title = (meta.title || slug) + ' — Santhosh Raja';
    T.textContent = meta.title || slug;
    M.innerHTML = [fmtDate(meta.date), readingTime(body) + ' min read', ...[].concat(meta.tags || []).map(t =>'<span class="chip">' + esc(t) + '</span>')].map((x,i) => i<2 ? esc(x) : x).join('<span class="dot"></span>');
    B.innerHTML = renderMarkdown(body);
    document.getElementById('share').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href);
  }).catch(() => { T.textContent = 'Post not found'; B.innerHTML = '<p>This post doesn\'t exist (yet). <a href="blog.html">Back to all posts</a>.</p>'; });
})();
