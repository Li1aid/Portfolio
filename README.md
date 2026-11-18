# aidenyang.me

Bilingual portfolio of **Aiden Yang**, Design Engineer in Sydney — with an AI assistant that answers questions about the work.

<img src="Assets/portfolio-preview.jpg" width="720">

**Live:** [aidenyang.me](https://aidenyang.me) · EN / 中文
**Case study:** [aidenyang.me/projects/this-site.html](https://aidenyang.me/projects/this-site.html)

## What's in it

- **Homepage** — eight case studies: four shipped products and four design projects.
- **Interactive case studies** — each product page has a clickable architecture diagram; the Chunks page has a working replica of the app.
- **AI assistant** — a chat widget grounded in `knowledge.md`, running on a Cloudflare Worker. Costs about $3 a month.
- **Bilingual** — every piece of copy carries `data-en` / `data-zh`; the toggle swaps them in place.

## How it works

```
GitHub Pages (this repo)  ──►  static HTML / CSS / JS, no build step
Cloudflare Worker (worker/) ──►  proxies the Anthropic API · logs chats to D1 · admin behind Cloudflare Access
```

- **Front-end** — static HTML, local Instrument Sans, responsive WebP artwork and vanilla JavaScript.
- **Chatbot** — `knowledge.md` is the single source of truth for what it may say; conversations are stored in D1 and purged after 30 days.
- **Availability** — the contact section reads `status.json`, editable from the Worker admin panel.

## Layout

```
index.html · home.css                 homepage
style.css · script.js                 shared styles, language and chat
projects/                             one html/css/js set per case study
Assets/                               posters and images
knowledge.md                          chatbot knowledge base
worker/                               Cloudflare Worker (deployed separately)
sitemap.xml · robots.txt              SEO
```

## Develop

Serve the repository root with `python3 -m http.server` and open the local address it prints.

Worker:

```bash
cd worker
npm install
npm run dev       # local
npm run deploy    # production
```

`npm run deploy` rebuilds `src/knowledge.js` from `knowledge.md` first, so the chatbot never drifts from the site copy. The Anthropic key is set with `wrangler secret put` and never committed.

## Adding copy in both languages

```html
<p data-en="English text" data-zh="中文文本">English text</p>
```

## Contact

aidenyang5995@gmail.com · [LinkedIn](https://www.linkedin.com/in/aiden-yang-ty)

© 2026 Aiden Yang
