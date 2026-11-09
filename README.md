# drmitch.co.uk

A static site with no framework. The source is in `src/`, and `npm run build` writes the finished site to `dist/`. Run `npm run dev` to view it at http://localhost:3000. `CLAUDE.md` is the project brief for Claude Code.

## To change anything Mitch needs to supply

Edit `site.config.json`, then run `node build.mjs`. The build lists every placeholder still empty.
Put the real photo of Mitch in the empty frame in the About section (`.photo` in `src/pages/index.html`), and add a map image in the Visit section.

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

## Temporary photos

These are free Unsplash photos (Unsplash Licence), used only until Mitch supplies his own. `npm run build` lists them as placeholders.

- `photo-hero`: Julius Toltesi, https://unsplash.com/photos/chiropractor-adjusting-patients-upper-back-and-neck-ZzkNkbUxFMc
- `photo-massage`: Jakub Klucký, https://unsplash.com/photos/massage-therapist-giving-a-back-massage-7yeqemd-p90
- `photo-examine`: yury kirillov, https://unsplash.com/photos/a-man-getting-his-leg-examined-by-a-doctor-pbUWW-CBoqY
- `photo-room`: Kimiya Sabbaghan, https://unsplash.com/photos/a-white-room-with-a-bed-and-a-desk-o4OJfrmMC0o

## The logo

The logo files are in `brand/`. See `brand/README.md` for which one to use where. The website draws the symbol inline from `build.mjs`.
