(() => {
  const CFG = window.SITE_CONFIG, $ = id => document.getElementById(id);
  const DRAFT = 'blog-draft-v1';
  const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70);
  $('w-date').value = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Kolkata'});
  if (!CFG.githubUser || CFG.githubUser.startsWith('YOUR')) $('cfgwarn').textContent = 'Set githubUser and githubRepo in config.js to enable one-click publishing.';
  try { const d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); if (d) for (const k in d) if ($(k)) $(k).value = d[k]; } catch {}
  let slugTouched = !!$('w-slug').value;
  $('w-slug').addEventListener('input', () => slugTouched = true);
  function build(){
    const title = $('w-title').value.trim(), tags = $('w-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    if (!slugTouched) $('w-slug').value = slugify(title);
    const q = s => JSON.stringify(s);
    const md = `---\ntitle: ${q(title)}\ndate: ${$('w-date').value}\ntags: [${tags.map(q).join(', ')}]\nsummary: ${q($('w-sum').value.trim())}\n---\n\n${$('w-body').value.trim()}\n`;
    return {title, tags, md, slug: slugify($('w-slug').value || title)};
  }
  function preview(){
    const p = build();
    $('p-title').textContent = p.title || 'Untitled';
    $('p-meta').innerHTML = [esc(fmtDate($('w-date').value)), readingTime($('w-body').value) + ' min read', ...p.tags.map(t => '<span class="chip">' + esc(t) + '</span>')].join('<span class="dot"></span>');
    $('p-body').innerHTML = renderMarkdown($('w-body').value || '*Start writing on the left…*');
    try { localStorage.setItem(DRAFT, JSON.stringify(Object.fromEntries(['w-title','w-date','w-slug','w-tags','w-sum','w-body'].map(k => [k, $(k).value])))); } catch {}
  }
  ['w-title','w-date','w-slug','w-tags','w-sum','w-body'].forEach(k => $(k).addEventListener('input', preview));
  preview();
  const say = (m, ok) => { $('wstatus').className = 'form-status ' + (ok ? 'ok' : 'err'); $('wstatus').textContent = m; };
  const valid = p => {
    if (!p.title || !$('w-body').value.trim()) { say('Add a title and some body text first.'); return false; }
    if (!p.slug) { say('Add a URL slug using English letters or numbers.'); return false; }
    return true;
  };
  $('publish').onclick = () => {
    const p = build(); if (!valid(p)) return;
    if (!CFG.githubUser || CFG.githubUser.startsWith('YOUR')) return say('Set githubUser / githubRepo in config.js first, or use Download .md.');
    const url = `https://github.com/${CFG.githubUser}/${CFG.githubRepo}/new/${CFG.githubBranch || 'main'}/posts?filename=${encodeURIComponent(p.slug + '.md')}&value=${encodeURIComponent(p.md)}`;
    if (url.length > 7500) { navigator.clipboard?.writeText(p.md); open(`https://github.com/${CFG.githubUser}/${CFG.githubRepo}/new/${CFG.githubBranch || 'main'}/posts?filename=${encodeURIComponent(p.slug + '.md')}`, '_blank', 'noopener');
      return say('Long post: the Markdown is copied to your clipboard. Paste it into the GitHub editor that just opened, then click Commit.', true); }
    open(url, '_blank', 'noopener'); say('GitHub opened in a new tab: click "Commit changes". The post goes live in about a minute.', true);
  };
  $('download').onclick = () => { const p = build(); if (!valid(p)) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([p.md], {type:'text/markdown'})); a.download = p.slug + '.md'; a.click(); say('Downloaded. Put it in the posts/ folder and push.', true); };
  $('copy').onclick = () => { const p = build(); if (!valid(p)) return; navigator.clipboard.writeText(p.md).then(() => say('Copied to clipboard.', true)); };
})();
