// Builds posts/index.json from the Markdown files in posts/.
// Runs automatically on every push (see .github/workflows/deploy.yml).
// Run it yourself with:  node scripts/build-posts.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'posts';
const posts = [];

for (const file of readdirSync(dir)) {
  if (!file.endsWith('.md') || file.startsWith('_')) continue;
  const src = readFileSync(join(dir, file), 'utf8').replace(/^﻿/, '');
  const m = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta = {};
  const body = m ? m[2] : src;
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':'); if (i < 0) continue;
    const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
    meta[k] = v;
  }
  if (String(meta.draft) === 'true') continue;
  const slug = file.replace(/\.md$/, '');
  if (!/^[a-z0-9-]+$/i.test(slug)) { console.warn(`Skipping ${file}: use only letters, numbers and dashes in file names.`); continue; }
  posts.push({
    slug,
    title: meta.title || slug,
    date: meta.date || '1970-01-01',
    tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
    summary: meta.summary || body.replace(/[#>*`_\[\]]/g, '').trim().split('\n').find(Boolean)?.slice(0, 160) || '',
    readingTime: Math.max(1, Math.round(body.trim().split(/\s+/).length / 220)),
  });
}

posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
writeFileSync(join(dir, 'index.json'), JSON.stringify(posts, null, 2) + '\n');
console.log(`posts/index.json → ${posts.length} post(s)`);
