# Today — Product Landing Page

A responsive product landing page for **Today**, a simple to-do checklist. Built with HTML and CSS only; no installation or build tools are required.

## Files

- `index.html` — page content and sections
- `style.css` — layout, colors, typography, and responsive styles

## Run locally

Keep both files in the same folder and open `index.html` in a browser. The page loads DM Sans and DM Serif Display from Google Fonts; browser fallback fonts are included for offline use.

## Customize

Edit the copy and links in `index.html`. Adjust the colors in the `:root` variables near the beginning of `style.css`.

The calls to action scroll to the “How it works” section. Replace these links with your product URL when you have one. The preview is a CSS illustration, not a working app.

## Push to GitHub

Create an empty repository on GitHub. From this folder, run:

```bash
git init
git add index.html style.css README.md
git commit -m "Add day08 landing page"
git branch -M main
git remote add origin https://github.com/sundayfavour1890-hash/50-Projects-in-50-Days-Challenge.git
git push -u origin main