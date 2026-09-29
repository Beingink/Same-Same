# Same Same

**50 B2B taglines, one vocabulary.**

A small interactive site showing how many B2B brands have claimed the same tagline words and phrases: *the future*, *what's next*, *progress*, *together*, *AI*, and more.

46 of the 50 brands on the list share at least one tagline word with a rival.

## What's on the page

- **Shared lines / shared words.** One phrase or word, set large, with a ghost copy behind it for every brand that uses it. Shuffle to see another. The list of fifty brands lights up to show who's using it.
- **Seven territories.** Words grouped by what they promise (Forward, Makers, Momentum, Better world, Change, Reassurance, AI and data), with a count of the brands in each.
- **Write a B2B tagline.** Builds a new line only from words these brands already use, with a count on each word.
- **Guess who said it.** A quiz where the wrong answers come from the same sector.
- **Words only one brand used.** The rare, distinctive ones.

## Project structure

```
index.html      page markup
css/style.css   all styles (light and dark themes)
js/data.js      the 50 brands and their lines  ← edit this to update
js/app.js       counting, grouping and interaction logic
favicon.svg
.nojekyll       tells GitHub Pages to serve files as-is
```

No build step, no dependencies. Fonts (Bodoni Moda, Schibsted Grotesk) load from Google Fonts.

## Updating the taglines

Open `js/data.js`. Each brand looks like this:

```js
{n:"ABB", s:"Industrial", l:"Engineered to Outrun",
 also:[["Let's write the future. Together.","earlier line"]]}
```

- `n` brand name
- `s` sector, used to pick harder wrong answers in the quiz
- `l` the line the brand leads with today
- `k` optional note, e.g. `"mission"`, `"purpose"`, `"earlier line"`
- `also` optional extra lines, each `["text", "note"]`

Every count, territory, quiz question and "only one brand" word is recalculated from this list automatically.

To change which phrases appear under **Shared lines**, edit the `PHRASES` list in `js/app.js`. To change the territories, edit `TERR` in the same file.

## Host it on GitHub Pages

1. Create a new repository on GitHub (for example `same-same`).
2. Upload everything in this folder to the repository root, keeping the `css` and `js` folders.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/same-same/`.

To use a custom domain, add it under **Settings → Pages → Custom domain** and point a CNAME record at `<your-username>.github.io`.

It also works as-is on Netlify, Vercel or Cloudflare Pages: drag the folder in, no settings needed.

## Run it locally

Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Method

Lines were collected from brand websites, press releases and annual reports, and reflect what each brand leads with as of September 2026. Earlier lines, mission statements and purpose statements are included where relevant and marked on the page. Counting is by brand, not by line, and close variants are grouped ("building" with "build", "engineered" with "engineering").

Taglines change often. If one has moved on, update `js/data.js`.

Brand names and taglines belong to their respective owners and are quoted here for commentary.
