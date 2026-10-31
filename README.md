# Santhosh Raja — Personal Site

Black, white and gold portfolio with a page-load counter, an SRE consulting form, and a Markdown blog.
No frameworks and no build tools to install: GitHub does the small blog build for you.

```
index.html        Home (profile, experience, latest posts, consulting band)
consult.html      SRE consulting request form
blog.html         All posts, with search and tag filter
post.html         Single post page (post.html?p=<slug>)
write.html        Private blog composer (not linked in the menu)
config.js         ← the only file you need to edit
posts/            Your blog posts, one Markdown file each
assets/           Shared CSS and JS, plus marked and DOMPurify in assets/vendor
scripts/          Builds posts/index.json from posts/*.md
.github/workflows Auto-deploy to GitHub Pages on every push
```

Only the files listed in the workflow's **Assemble site** step are published. If you add a new top-level folder for the site, add it there too. `assets/img` isn't published either, so add it to that step if a page starts using an image from it.

---

## 1. First-time setup (about 5 minutes)

1. **Edit `config.js`** and set `githubUser` and `githubRepo` to your GitHub username and repo name.
2. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
   (Not "Deploy from a branch": the included workflow builds the blog index and deploys.)
4. Open the **Actions** tab and wait for the green tick. Your site is live at
   `https://<your-username>.github.io/<repo-name>/`.

> Name the repo `<your-username>.github.io` if you want the site at the root URL.

---

## 2. Page-load counter

- Every page load on the live site adds 1 to the counter, using the free [Abacus](https://abacus.jasoncameron.dev) API. No signup is needed.
- The count appears in the hero badge, the "Page loads" tile in the hero panel, and the footer of every page.
- Previews on `localhost` or opened from a file only *read* the counter and never increase it, so your own testing doesn't inflate the number.
- To restart the count from zero, change `counterNamespace` in `config.js`.
- Ad blockers on some visitors' browsers may block it. Those visitors see "—" and aren't counted.

## 3. Consulting requests

- `consult.html` has the full request form: topic, environment, urgency, scenario, what was tried, and email or call preference.
- Requests are emailed to `contactEmail` in `config.js` through [FormSubmit](https://formsubmit.co). There's no account, but **one step is required**:
  **after the site is live, submit the form once yourself.** FormSubmit sends a confirmation email to your inbox. Click the link, and every later request arrives as a formatted email you can reply to directly.
- If the service is ever unreachable, visitors get a one-click "send by email instead" link with their answers pre-filled.

## 4. Adding blog posts

### Option A: from the browser (easiest, works on your phone too)
1. Open `https://<your-site>/write.html`. It isn't in the menu, so bookmark it.
2. Write the title, tags, summary and body in Markdown, with a live preview. Drafts autosave in your browser.
3. Click **Publish to GitHub**. GitHub opens with the file ready. Click **Commit changes**.
4. The post is live in about a minute.

### Option B: by hand
Create `posts/my-post-name.md`:

```markdown
---
title: "My post title"
date: 2026-11-01
tags: [SRE, Observability]
summary: "One line shown on the blog card."
---

Your post in **Markdown**. Use ## headings, lists, > quotes, tables, `code` and images.
```

Commit and push, or use **Add file → Create new file** inside the `posts` folder on github.com.

- The file name becomes the URL: `post.html?p=my-post-name`. Use lowercase letters, numbers and dashes only.
- Add `draft: true` to the header to keep a post off the site. It's still readable in the repo if the repo is public.
- Posts are sorted newest first. The home page shows the latest three.
- Delete a post by deleting its `.md` file.

---

## Previewing locally

Pages load posts with `fetch`, so open the site through a tiny local server instead of double-clicking the file:

```bash
node scripts/build-posts.mjs     # refresh the post list
python3 -m http.server 8000      # then open http://localhost:8000
```

## Security

- Every page has a Content Security Policy in a `<meta>` tag, so scripts can only load from this site. Keep JavaScript in `assets/js/`: inline `<script>` blocks are blocked.
- If you add a new external service, add its domain to `connect-src` in the policy on all five pages.
- Never put a key or token in `config.js` or any other site file. Everything here is public.

## Customising
- Colours are CSS variables at the top of `assets/css/site.css`. `--ok` is the gold accent.
- Profile content is in `index.html`. Consulting topics and copy are in `consult.html`.
