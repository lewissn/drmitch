# drmitch.co.uk

Website for Mitch, a chiropractor and sports massage therapist in the UK. Lewis is building it and holds it to the same standard as his own brands: meticulous visual design, motion and UX. Most visitors arrive on a phone, so design and test phone first.

## Commands

- `npm run dev` builds and serves at http://localhost:3000
- `npm run build` writes `dist/` and lists every placeholder still empty
- No dependencies. Plain HTML, CSS and JavaScript, built by `build.mjs`. Hosted on Vercel via `vercel.json`.

## Where things are

- `site.config.json`: every fact Mitch must supply. Pages read from here. Never hard-code these.
- `src/pages/`: page bodies. `build.mjs` holds the shared head, header, menu, footer, JSON-LD, robots.txt and sitemap.
- `src/assets/css/site.css`: all styles, phone first, wide layout from 960px.
- `src/assets/js/site.js`: menu, top bar, booking dock, scroll scene. `book.js`: booking flow. `legal.js`: menu on simple pages.
- `src/assets/seq/`: 64 scroll frames at 720 and 1080 wide. `tools/render/` regenerates them (a C++ SDF renderer, then `seq.py`).

## Design

- Plaster spine on cobalt. Tokens are at the top of `site.css`: cobalt `#1A2BA8`, deep `#121E78`, bone `#F2EEE6`, plaster `#F1F2F5`, ink `#12163A`. The frames have cobalt baked in, so changing it means re-rendering.
- Type: Libre Caslon Display for headings, Libre Caslon Text italic for small labels, Hanken Grotesk for reading. Fonts are self-hosted on purpose; don't link Google Fonts.
- Red (`--ember`) is reserved for the 999 warning.
- One bold idea per page. The scroll scene is it. No entrance animations on ordinary sections.
- Motion uses transform, opacity and clip-path, and always respects `prefers-reduced-motion`.
- Touch targets at least 44px. Use `svh`, safe-area insets and real form attributes (`autocomplete`, `inputmode`).

## Legal rules that shape the copy

- UK ad rules (CAP/ASA) and the General Chiropractic Council: "Dr" must be immediately followed by "Doctor of Chiropractic", and must be clearly qualified as a courtesy title with no general medical qualification held. Never show "Dr Mitch" alone or "Dr Mitch DC". This applies everywhere public, including titles, meta descriptions and social posts. A non-medical doctorate does not remove this requirement.
- Only claim the conditions already listed on the homepage; they follow ASA guidance on chiropractic. Adding one needs strong evidence.
- Never imply chiropractic "realigns", "corrects" or "straightens" the spine, or mention subluxations. The spine animation shows looking, not fixing.
- The red-flag 999 wording stays on the homepage and first booking step.
- Mitch should review all clinical wording. A solicitor or CAP Copy Advice should review the legal pages before launch.

## Privacy and SEO rules

- The site sets no cookies, so it has no banner. Don't add analytics, embedded maps, fonts from other hosts or tracking without updating `src/pages/cookies.html` and adding the required consent or opt-out.
- Booking within 14 days needs the express-request tick box on the payment step.
- `launched: false` in the config blocks indexing. Only set it to true when every placeholder is filled.
- Google no longer shows FAQ rich results, so there is no FAQPage markup.
- The clinic JSON-LD only includes filled-in facts. Never invent an address, reviews or ratings.

## Next steps

Started in a Claude session, handed to Claude Code part-way. Not yet checked:

- The full scroll scene with all 64 frames, on a real iPhone and in Safari. Only tested in Chromium's phone emulation, and only with the early frames. Check for jank, memory and ghosting between frames.
- The hero at desktop width after its last type-size change.
- The close-up spine image in the blue "Chiropractic can help with" band at phone width.
- Lighthouse scores, keyboard use and screen reader pass.

Re-rendering frames on a Mac: from `tools/render`, run `clang++ -O3 -ffast-math spine_seq.cpp -o spine_seq`, then `python3 seq.py 1200 1667 64 seq 1080,720` (needs `numpy` and `pillow`). Apple's compiler has no OpenMP, so it runs on one core and takes a good while. Copy the results into `src/assets/seq/`.

## Status

- `/book/` is a working front-end preview with no real diary or payment. The plan is Cliniko with Stripe; set `bookingUrl` to send every Book button there.
- Still needed from Mitch: see the placeholders listed by `npm run build`, his real photo, and a map image.
- Waiting on which doctorate Mitch holds. If he has a medical degree and GMC registration, the "Dr" wording can change.
