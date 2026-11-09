# drmitch.co.uk

A static site with no framework. The source is in `src/`, and `npm run build` writes the finished site to `dist/`. Run `npm run dev` to view it at http://localhost:3000. `CLAUDE.md` is the project brief for Claude Code.

## To change anything Mitch needs to supply

Edit `site.config.json`, then run `node build.mjs`. The build lists every placeholder still empty.
Replace `src/assets/img/spine-neck.webp` with the real photo of Mitch, and add a map image in the Visit section.

## Before launch

1. Fill `site.config.json` and have Mitch check the clinical wording.
2. Have a solicitor or the CAP Copy Advice team check the privacy notice, booking terms and the use of "Dr".
3. Set up Cliniko with Stripe and put the booking link in `bookingUrl`. Until then, `/book/` is a preview and isn't indexed.
4. Register with the ICO (data protection fee) if Mitch hasn't already.
5. Set `launched` to `true`. This opens `robots.txt` and removes the `noindex` tags.
6. Deploy to Vercel, point drmitch.co.uk at it, then submit `sitemap.xml` in Google Search Console.
7. Create the Google Business Profile with the same name, address and phone number as the site.

## Cookies

The site sets no cookies, so it has no banner. Adding analytics or an embedded map changes that: update `src/pages/cookies.html` and add a consent or opt-out control first.

## The scroll scene

`src/assets/seq/` holds 64 frames at two sizes. `src/assets/js/site.js` draws them to a canvas as the page scrolls. People who prefer reduced motion get the first frame, with no scroll scene.
