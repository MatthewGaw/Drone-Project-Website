# Drone build website

A static site (plain HTML, CSS and JavaScript, no build step) for GitHub Pages.

## Pages

| File | What it is |
|------|------------|
| `index.html` | Home: interactive drone drawing, current status, timeline, latest updates |
| `roadmap.html` | All eight phases with dates and "done when" checklists |
| `parts.html` | Shopping list by batch, with budget bar and status filters |
| `updates.html` | Build log |
| `how-it-works.html` | System diagram, control loop, software, modes, failsafes, PCB |
| `gallery.html` | Photos and drawings, with a full-screen viewer |
| `flying-safely.html` | UK rules and the test procedure |
| `present.html` | Presenting mode (full-screen slides) |

## Updating it

**You only need to edit `assets/js/data.js`.** All the pages, the presentation, the progress numbers and the budget are worked out from it.

- Tick off a milestone: `done: false` → `done: true`
- Bought a part: `status: "needed"` → `"ordered"` → `"arrived"` (and fix `price` to what you actually paid)
- New phase started: old phase `status: "done"`, new phase `status: "active"`
- Post an update: copy an entry in `updates` to the top and change it
- Add a photo: put it in `assets/img/photos/` (resize to about 1600 px wide first), then add
  `{ src: "assets/img/photos/name.jpg", caption: "...", date: "2026-12-05" }` to `gallery`
- Change `lastUpdated` in `config` whenever you edit

## Presenting mode

Turn on the **Presenting** switch in the top bar (or press **P** on any page).

- Next: → , Space, or click the right side of the screen. Back: ←
- **F** for full screen, **Esc** (or the switch) to go back to the page you were on
- Swipe on a phone or tablet. The control bar hides itself after a couple of seconds.

## Publishing on GitHub Pages

1. On github.com, create a new **public** repository, for example `drone-build`.
2. Upload the *contents* of this `website` folder (so `index.html` is at the top level of the repo). The easiest way is "Add file → Upload files" and drag everything in. With git:
   ```bash
   cd website
   git init && git add . && git commit -m "First version of the site"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/drone-build.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. After a minute it's live at `https://YOUR-NAME.github.io/drone-build/`.
5. Put that address in `siteUrl` (and the repo link in `githubUrl`) in `data.js`.

To update later: edit `data.js`, then upload it again (or `git commit` and `git push`).

## Testing it locally

Opening `index.html` directly works. Or run a small server from this folder:
```bash
python3 -m http.server 8000
```
and open http://localhost:8000.

## Privacy

The site is public. Don't put your address, your exact flying spots, your Flyer or Operator ID numbers, or photos that show your house number in it.
