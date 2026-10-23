# Cantina El Chaparral

Website for **Cantina El Chaparral**, a professional event bartending service by Miguel Hermosillo & Lili Alvarez in Reno, Sparks and Carson City, NV.

It's a static site (HTML/CSS/JS) with no build step, so Vercel deploys it as-is.

## Features
- English / Spanish toggle (EN | ES). It remembers each visitor's choice, auto-detects Spanish browsers, and `?lang=es` forces Spanish
- Packages: Basic $300, Standard $500, Custom quote
- Signature drinks menu
- Event videos with tap-to-play and sound
- Photo gallery with a lightbox (swipe / arrow keys)
- Booking form that emails cantinaelchaparral@gmail.com through [FormSubmit](https://formsubmit.co)
- Instagram & Facebook links, click-to-call, and a sticky mobile "Book Now" bar

## Booking form setup (one time)
The **first** form submission sends an activation email to `cantinaelchaparral@gmail.com`. Click **Activate Form** in that email. Every booking request after that goes straight to the inbox.
To change the receiving email, edit `BOOKING_EMAIL` in `js/main.js`.

## Editing
- English text: `index.html`
- Spanish text: `js/i18n.js`
- Photos: `assets/img/`. Videos: `assets/video/`

## Deploy
Import the repo in Vercel and set the Framework Preset to **Other**. There's no build command, and the output directory is the repo root.
