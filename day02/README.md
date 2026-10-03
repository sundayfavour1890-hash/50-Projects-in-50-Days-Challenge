Registration Form
A responsive registration page made with HTML and CSS. It includes first and last name, email, optional phone number, password, confirmation, a required terms checkbox, and browser-based required-field validation. The design works on phones and desktop screens.
Files
index.html — page structure and form fields
style.css — colors, layout, and responsive styling
Run locally
Download and extract the project ZIP, or place index.html and style.css in the same folder.
Double-click index.html to open it in a browser. You can also use VS Code's Live Server extension.
Important: this is a frontend demo
The form does not create an account or save any data. Before accepting real registrations, connect the form to a backend, validate that both passwords match on the server, hash passwords securely, protect against abuse, and provide working Terms, Privacy, and login pages. Never commit passwords, API secrets, or .env files to GitHub.
Push to a new GitHub repository
Sign in to GitHub and create a new empty repository called registration-form. Leave README, .gitignore, and license unchecked because this project already has a README.
Open the project folder in VS Code, then open Terminal → New Terminal. Make sure the terminal is in the folder containing index.html.
Run these commands, replacing YOUR_USERNAME with your GitHub username:
git init
git add index.html style.css README.md
git commit -m "Add responsive registration form"
git branch -M main
git remote add origin https://github.com/sundayfavour1890-hash/registration-form.git
git push -u origin main
If Git asks for your identity, run git config --global user.name "Your Name" and git config --global user.email "you@example.com", then repeat the commit and remaining commands. GitHub may ask you to sign in through your browser.
If you already created the repository with a README
Use git clone https://github.com/sundayfavour1890-hash/registration-form.git, copy index.html and style.css into that cloned folder, open a terminal inside the cloned folder, and run:
git add index.html style.css
git commit -m "Add responsive registration form"
git push origin main
Publish with GitHub Pages (optional)
In your GitHub repository, open Settings → Pages, choose Deploy from a branch, select main and / (root), then save. Your demo page should become available at https://sundayfavour1890-hash.github.io/registration-form/ after deployment finishes. GitHub Pages hosts the frontend only; it cannot process registrations by itself.