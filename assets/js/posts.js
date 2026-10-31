/* Markdown post helpers — front matter parsing + safe rendering */
window.parsePost = function (src) {
  const m = src.replace(/^﻿/, '').match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta = {};
  if (!m) return { meta, body: src };
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':'); if (i < 0) return;
    const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      v = v.replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
    }
    meta[k] = v;
  });
  return { meta, body: m[2] };
};
window.readingTime = body => Math.max(1, Math.round((body.trim().split(/\s+/).length || 0) / 220));
window.renderMarkdown = function (md) {
  const html = window.marked ? marked.parse(md, { gfm: true, breaks: false }) : '<pre>' + esc(md) + '</pre>';
  return window.DOMPurify ? DOMPurify.sanitize(html) : html;
};
