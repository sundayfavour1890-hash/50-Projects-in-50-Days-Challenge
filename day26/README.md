# 🟢 QRCraft - QR Code Generator

A modern and responsive QR Code Generator built
using HTML, CSS, and JavaScript.

## Project Description

QRCraft is a simple web application that allows
users to create customizable QR codes.

Users can generate QR codes for websites,
plain text, email addresses, and phone numbers.

The application provides options to customize
QR code colors and sizes.

## Features

- Generate QR codes instantly
- Convert website URLs into QR codes
- Generate QR codes for text
- Generate email QR codes
- Generate phone number QR codes
- Customize QR code colors
- Change background colors
- Select QR code dimensions
- Download QR codes as PNG images
- Copy QR codes to clipboard
- Clear QR codes
- Responsive mobile-friendly interface

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- QRCode.js Library
- Canvas API
- Clipboard API

## Project Structure

QR-Code-Generator/
│
├── index.html
├── style.css
├── script.js
└── README.md

## How to Run

1. Download or clone the project.
2. Open the folder in Visual Studio Code.
3. Ensure all four files are in the folder.
4. Install the Live Server extension.
5. Right-click index.html.
6. Select "Open with Live Server".
7. Enter your text or website URL.
8. Click "Generate QR Code".
9. Download or copy the generated QR code.

## How It Works

1. Users enter information into the input field.
2. JavaScript validates the information.
3. The QRCode.js library generates a QR code.
4. The generated QR code appears in the preview.
5. Users can download the QR code as a PNG.
6. Users can also copy it to their clipboard.

## External Library

QRCode.js

https://github.com/davidshimjs/qrcodejs

The library is loaded from a CDN.

An internet connection is required to load
the library unless it has been cached.

## Browser Support

The app works in modern browsers including:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

Clipboard image copying requires a supported
browser and a secure context such as HTTPS
or localhost.

## Future Improvements

- QR code history
- Logo insertion into QR codes
- PDF download
- SVG download
- Wi-Fi QR code generator
- Contact card QR codes
- QR code scanner
- Dark mode

## Author

Created as part of a web development
coding challenge.

## License

This project is available for educational
and personal use.