# drmitch.co.uk

Website for Mitch, a chiropractor and sports massage therapist in the UK. Lewis is building it and holds it to the same standard as his own brands: meticulous visual design, motion and UX. Most visitors arrive on a phone, so design and test phone first.

## Commands

- `npm run dev` builds and serves at http://localhost:3000
- `npm run build` writes `dist/` and lists every placeholder still empty
- No dependencies. Plain HTML, CSS and JavaScript, built by `build.mjs`. Hosted on Vercel via `vercel.json`.
- A preview is published to GitHub Pages (https://lewissn.github.io/drmitch/) by `.github/workflows/pages.yml` on every push to `main` or `redesign-ceramic`. The site is served from a subfolder there, so never use root-relative paths (`/...`) for assets or links.

## Where things are

- `site.config.json`: every fact Mitch must supply. Pages read from here. Never hard-code these.
- `src/pages/`: page bodies. `build.mjs` holds the shared head, header, menu, footer, JSON-LD, robots.txt and sitemap.
- `src/assets/css/site.css`: all styles, phone first, wide layout from 960px.
- `src/assets/js/site.js`: loaded on every page. Menu, the top bar settling on scroll, and the desktop section indicator. `book.js`: booking flow only.
- `brand/`: Mitch's logo files (not part of the website). The symbol (a ring around a dumbbell cross, redrawn in November 2026 from a cleaner ChatGPT version of his original badge), the full logo with "The Body Mechanic", a reversed version, and a compliant lockup with "Dr Mitch / Doctor of Chiropractic". Text in these files is converted to outlines. `brand/README.md` explains which to use.

## Design

- "Ceramic", the same family as Lewis's own apps (chosen 9 November 2026): calm, precise and beautifully made. Warm paper ground, ink type, hairlines and whitespace, no shadows, and one sparing accent. Cards and panels (12–16px corners, a hairline border) are only for the treatments list and the visit details. Tokens are at the top of `site.css`: paper `#F3F1EC`, paper-2 `#ECE9E2`, ink `#17171A`, muted `#67635B`, hair `#D3CFC6`, tick `#A9A49A`, night `#121214` (menu, footer, booking summary), accent `#2F5A8F` (the logo's blue, deepened).
- The accent is for the Book buttons, the booking progress, the trust ticks, step numbers and FAQ icons. Never use it for decoration or body text.
- Type: Newsreader (a variable serif with an optical-size axis, regular and italic) for headings and Mitch's own words, Hanken Grotesk for reading, and `.label` (Hanken 600, 12px, 0.08em tracked capitals, muted) for small labels. Headings are regular weight; never bold or condensed capitals. Numbers inside circles use the "Step Num" face (Hanken 600 with equal space above and below its digits), because Newsreader's old-style, unevenly spaced numerals never sit centred. Fonts are self-hosted on purpose; don't link Google Fonts.
- Red (`--ember`) is reserved for the 999 warning.
- Layout: every section heading sits above its own content (small label, serif heading, optional intro). Never put a heading in a left column beside its content: Lewis found that alignment uncomfortable.
- Rhythm: sections alternate paper, sand (`#EAE4D8`) and one deep blue block (`#1D3149`, the conditions list), with photos beside text and cards for treatments. Avoid long runs of plain text sections.
- Photos make it feel human. Images are `photo-*.webp` at 800 and 1400 wide, with 12px corners. The current ones are temporary Unsplash stock (credited in `README.md`), and `npm run build` lists them as placeholders until Mitch's own replace them. Never use a stock photo of a person where it would read as Mitch himself, and never use white coats or stethoscopes.
- Hero: headline "Understand what’s going on. Then decide.", then a first line in ink that says what and where ("Chiropractic and sports massage in [Town].") before the rest of the paragraph. Phones: photo first (no overlay), headline, paragraph, one Book button, "See prices" arrow link, then a facts list (first appointment, regulator, GP referral). Desktop: text beside the photo, facts as a three-column strip below. The first screen must say what and where and show the Book button, even on an iPhone SE (375×667). Familiar UX patterns stay: an unusual "editorial" hero (headline first, photo pushed down, facts far from the button) was tried and rejected as worse. Make it feel premium through type, spacing and copy, not by breaking conventions. Also avoid template tells: a dark fade with text over the photo, labels above every headline, tick-mark rows.
- Phones and tablets (under 960px): every section is an iOS-style sheet with 24px rounded top corners that slides up over the one before, and the hero text sheet rises over the hero photo. The movement is native `position: sticky` (smooth on iOS); never drive positions from JavaScript per frame. `site.js` measures each section (`--h`) so it keeps scrolling until its end has risen to `--hold` (38% down the screen) before it stops and the next sheet covers it (stopping at the screen's bottom edge made the end of each section hard to read), adds `.snap` markers (used only to find each sheet's place for in-page links), dims the section being covered (`--dim`, opacity only), and routes in-page links to each sheet's place in the page. No scroll snapping: Lewis found even proximity snapping too strong and frustrating on iOS. Every section needs an opaque background, or the stacked ones show through.
- Treatments: on phones, one inset list (16px corners) like iOS. On desktop, three equal cards side by side (Lewis's choice over rows), with titles aligned (the tag has a reserved row), a hairline above the price, length and a round arrow, and a gentle lift on hover. The whole row or card is the link. Each whole row links to `book/?service=new|follow|massage`, and `book.js` preselects that treatment. The consultation row carries a "New patients start here" tag, and a line underneath points the unsure to the consultation or a phone call. If `bookingUrl` (Cliniko) is set, check that its links still make sense with `?service=` added.
- Conditions: grouped by body area (Back, Neck and head, Shoulders, Muscles and joints) on soft panels: one column on phones, two on tablets, four on desktop. The wording of each condition must stay exactly as the ASA-safe list; grouping only. The accident-or-injury warning is its own callout, not small print.
- Photo-and-text sections (`.feature`): on phones the photo sits above the heading (Lewis prefers it that way); on desktop they sit side by side, alternating sides. Sports massage lists its three moments (before an event, after one, during a heavy training block) and has one solid Book button linking to `?service=massage`, with the length and price beside it.
- Your first visit: an intro line from the config ("Your first appointment lasts {{newMin}} minutes."), the four steps as a sequence (numbered circles joined by a thin line), then a "Book a new patient consultation" button linking to `?service=new`.
- About Mitch: the bio is in Mitch's own words, signed "— Mitch". The GCC number has a "Check the register" link so visitors can verify it. It points to the GCC homepage for now; switch it to the register search for his entry once his number is in the config, but don't guess the URL format.
- Questions: a centred reading column. The answers are one group (`<details name="faq">`), so opening one closes the others. The "Dr" answer is open by default. Appointment lengths come from the config. A "Still have a question?" box with Call and Email buttons (`{{callBtn}}`, `{{emailBtn}}`) closes the section. Only add clinical questions in Mitch's own words.
- Visit: labelled details (address, opening hours, parking, phone, email), then Book, with Call and Directions beside each other. Until those facts are filled in, Call, Email and Directions show as muted inert buttons (`aria-disabled`). The map stays a static image, never an embedded map (no cookies).
- Footer: the symbol with the name lockup, then Contact, "Visit the site" and Policies columns (four columns on desktop, the two link columns side by side on phones), then a strip with the required "Dr" statement, the GCC number and "© year, legal name". It is the last sheet on phones.
- Legal pages: `build.mjs` gives every section heading an id (from its text) and adds an "On this page" list to text pages with four or more sections. Renaming a heading changes its address, so check links such as the homepage cancellation answer (`terms/#changing-or-cancelling-after-that`).
- Desktop balance: every block either spans the full layout width or is balanced across it. Never leave a narrow block hanging on the left with empty space beside it; Lewis finds that lopsided.
- Speak to patients, not chiropractors: no anatomy diagrams or clinical jargon in the design. A fine-line spine scale was tried and dropped as confusing.
- The symbol (`SYMBOL` in `build.mjs`, also `brand/drmitch-symbol.svg`) is inline SVG coloured by `currentColor`: blue in the header lockup, light in the footer and the open menu. It is also the favicon and the app icons. On the site it is always paired with "Dr Mitch" and "Doctor of Chiropractic" directly beneath, never "Dr Mitch" alone and never with "The Body Mechanic". In both lockups the ring overshoots the lettering (cap top of the name to the baseline of the line below) by about 6% at each end; keep that if the type sizes change (header symbol 40px, footer 47px).
- The brand name is "Dr Mitch", to match his logo (`NAME` and `BRAND` in `build.mjs`), always followed directly by "Doctor of Chiropractic". Never type it out in pages; use `{{brand}}`. His surname (`surname` in `site.config.json`) appears only in Google's clinic data ("Mitch Ede") and as the home-screen name "Mitch Ede", where there is no room for the qualifier. The build writes `site.webmanifest`.
- Header: 72px tall at the top of the page (84px on desktop), settling by 20px (24px on desktop) once the page scrolls, using transforms only (the `scrolled` class on `html`). It always stays visible. Phones get a Book pill beside the menu button, so there is no bottom booking bar. On desktop, a fine accent line slides under the nav link for the section in view.
- Lewis rejected two earlier directions: cobalt with a scroll-scrubbed spine animation (boring and janky), and a black hero with the badge and heavy condensed capitals ("gym bro"). Don't bring back scroll-scrubbed frame sequences or loud, heavy type.
- Motion is quiet and short with no bounce (`--out`), uses transform, opacity and clip-path, and always respects `prefers-reduced-motion`.
- Touch targets at least 44px. Use `svh`, safe-area insets and real form attributes (`autocomplete`, `inputmode`).

## Legal rules that shape the copy

- UK ad rules (CAP/ASA) and the General Chiropractic Council: "Dr" must be immediately followed by "Doctor of Chiropractic", and must be clearly qualified as a courtesy title with no general medical qualification held. Never show "Dr Mitch" alone or "Dr Mitch DC". This applies everywhere public, including titles, meta descriptions and social posts. A non-medical doctorate does not remove this requirement.
- Only claim the conditions already listed on the homepage; they follow ASA guidance on chiropractic. Adding one needs strong evidence.
- Never imply chiropractic "realigns", "corrects" or "straightens" the spine, or mention subluxations.
- The full logo says "Dr Mitch" and "The Body Mechanic" without "Doctor of Chiropractic", so it stays off the website. Before Mitch uses it publicly (signage, social media, adverts), a solicitor or CAP Copy Advice must confirm it is acceptable, and that "The Body Mechanic" doesn't imply fixing the body. Until then, use `brand/drmitch-logo-compliant.svg`. The dumbbells also form a cross, which some may read as a medical cross; raise it at the same review.
- The red-flag 999 wording stays on the homepage and first booking step. On the homepage the symptoms are a list (same words), with a warning icon, a "Call 999" (`tel:999`) button on phones only, and an NHS 111 line for urgent non-emergencies. Mitch should confirm he is happy with the 111 line.
- Mitch should review all clinical wording. A solicitor or CAP Copy Advice should review the legal pages before launch.

## Privacy and SEO rules

- The site sets no cookies, so it has no banner. Don't add analytics, embedded maps, fonts from other hosts or tracking without updating `src/pages/cookies.html` and adding the required consent or opt-out.
- Booking within 14 days needs the express-request tick box on the payment step.
- `launched: false` in the config blocks indexing. Only set it to true when every placeholder is filled.
- Google no longer shows FAQ rich results, so there is no FAQPage markup.
- The clinic JSON-LD only includes filled-in facts. Never invent an address, reviews or ratings.

## Next steps

Started in a Claude session, handed to Claude Code part-way. Not yet checked:

- The Ceramic design on a real iPhone in Safari, especially the menu reveal and the sheets.
- Mitch's own photos to replace the four temporary stock photos, then regenerate `og.jpg`, which uses the hero photo.
- Mitch should review the hero line "Mitch will listen, examine you properly and explain what's going on before any treatment starts" and the trust points under it.
- Mitch's approval of the redrawn symbol and logo files.
- Lighthouse scores and a VoiceOver pass on a real iPhone. The keyboard pass is done.

## Status

- `/book/` is a working front-end preview with no real diary or payment. Its treatment picker is the same inset list as the homepage, with radio circles; selections are blue, never black. The 999 note is a red alert. On phones a one-line summary sits above the buttons instead of the summary panel. The confirmation has a tick. No Book buttons appear in the header while booking. The plan is Cliniko with Stripe; set `bookingUrl` to send every Book button there.
- Still needed from Mitch: see the placeholders listed by `npm run build`, his real photo (the About section has an empty frame for it), and a map image.
- Lewis believes Mitch may also be a physiotherapist; he is checking with Mitch. "Physiotherapist" is a protected title (HCPC registration required), so never mention physiotherapy anywhere on the site until Mitch confirms his HCPC registration and number.
- Waiting on which doctorate Mitch holds. If he has a medical degree and GMC registration, the "Dr" wording can change.
