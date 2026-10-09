# Quick Quiz

A five-question general knowledge quiz built with HTML and CSS only.

## Files

- `index.html` contains the questions, answer options, and page structure.
- `style.css` contains the layout, colors, and answer feedback styles.

## Run

Put both files in the same folder and open `index.html` in a browser. No installation is required.

Choose one option for each question. The selected option shows **Correct!** or **Not quite**. Count your correct answers for a score out of five. The **Start again** link reloads the page.

## Change the questions

Edit each `<legend>` and its four answer labels in `index.html`. Move the `correct` class to the right answer. Keep a unique radio `name` for each question (`q1`, `q2`, etc.) so each group allows only one selection.

## Limits

This version does not calculate a score automatically or save answers. Those features require JavaScript or a backend. The answer feedback uses the CSS `:has()` selector, so use a current browser.

## GitHub

Create an empty GitHub repository, then run these commands in this folder, replacing the URL with your repository URL:

```bash
git init
git add index.html style.css README.md
git commit -m "Add day09 quiz"
git branch -M main
git remote add origin https://github.com/sundayfavour1890-hash/50-Projects-in-50-Days-Challenge.git
git push -u origin main
```

