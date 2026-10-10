# Grade Calculator

A responsive weighted grade calculator. The page uses HTML and CSS, with a small JavaScript script inside `index.html` to perform the calculation.

## Files

- `index.html` — page structure and calculation script
- `style.css` — layout and responsive styling
- `README.md` — project instructions

## Run locally

Keep all three files in the same folder. Open `index.html` in a browser. No installation is required.

## How to use

Enter a score and weight for each assessment. Scores and weights must be between 0 and 100, and the three weights must add up to 100%. Click **Calculate grade** to see the weighted percentage and letter grade.

For example, scores of 80, 90, and 70 with weights of 30, 30, and 40 produce:

`(80 × 0.30) + (90 × 0.30) + (70 × 0.40) = 79%`

The letter-grade scale is A: 90–100, B: 80–89.99, C: 70–79.99, D: 60–69.99, and F: below 60. Change the thresholds in the script if your school uses a different scale.

## Push to GitHub

Create an empty repository on GitHub. Run these commands from the folder containing the files:

```bash
git init
git add index.html style.css README.md
git commit -m "Add day10 grade calculator"
git branch -M main
git remote add origin https://github.com/sundayfavour1890-hash/50-Projects-in-50-Days-Challenge.git
git push -u origin main
```