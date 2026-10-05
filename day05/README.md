# Day 05 - Digital Clock

## Description

A responsive digital clock built as part of my **50 Projects in 50 Days Challenge**.

The clock displays the current local time and automatically updates every second.

It also displays the current day and date.

## Features

- Displays current hours
- Displays current minutes
- Displays current seconds
- AM/PM indicator
- Current day and date
- Updates automatically every second
- Responsive design
- Animated blinking colon
- Glass-style user interface
- Works on desktop and mobile devices

## Technologies Used

- HTML
- CSS
- JavaScript

## Files

- `index.html` - Contains the clock structure and JavaScript logic.
- `style.css` - Contains the clock design and responsive styling.
- `README.md` - Contains information about the project.

## How to View It

Open `index.html` in your browser.

If you are using the Live Server extension in VS Code:

1. Open `index.html`
2. Right-click anywhere inside the file
3. Select **Open with Live Server**

## How It Works

JavaScript uses the `Date()` object to retrieve the current local time.

The clock gets:

- Hours
- Minutes
- Seconds
- AM or PM
- Day
- Month
- Year

The `setInterval()` method runs the clock function every 1000 milliseconds, which means the clock updates every second.

## What I Learned

- How to work with JavaScript's `Date` object.
- How to use `setInterval()`.
- How to update HTML content using JavaScript.
- How to convert 24-hour time to 12-hour time.
- How to use `padStart()` to display two-digit numbers.
- How to create animations using CSS.
- How to create a responsive interface.

## 50 Projects in 50 Days

This project is part of my **50 Projects in 50 Days Challenge** to improve my HTML and CSS skills.