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
- `src/assets/js/site.js`: loaded on every page. Menu, the top bar settling on scroll, and the desktop section indicator. `book.js`: booking flow only.
- `src/assets/img/logo-badge.webp`: Mitch's badge, cropped from the 625px JPEG he supplied.

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
- Footer: the badge with the name lockup, then Contact, "Visit the site" and Policies columns (four columns on desktop, the two link columns side by side on phones), then a strip with the required "Dr" statement, the GCC number and "© year, legal name". It is the last sheet on phones.
- Desktop balance: every block either spans the full layout width or is balanced across it. Never leave a narrow block hanging on the left with empty space beside it; Lewis finds that lopsided.
- Speak to patients, not chiropractors: no anatomy diagrams or clinical jargon in the design. A fine-line spine scale was tried and dropped as confusing.
- Mitch's badge is a maker's mark, not the headline: it sits in the dark footer beside "Dr Mitch Ede" and "Doctor of Chiropractic", and uses `mix-blend-mode: screen` to drop its black background. That only works on a dark ground. The header uses a type lockup instead: "Dr Mitch Ede" in the serif with "Doctor of Chiropractic" directly beneath. Lewis turned down an "ME" monogram (it reads as the word "me"); a real logomark may come later.
- The name comes from `surname` in `site.config.json` (`NAME` and `BRAND` in `build.mjs`), so never type it out in pages; use `{{brand}}`. The build writes `site.webmanifest`, with "Mitch Ede" as the home-screen name so "Dr" never shows without its qualifier.
- Header: 72px tall at the top of the page (84px on desktop), settling by 20px (24px on desktop) once the page scrolls, using transforms only (the `scrolled` class on `html`). It always stays visible. Phones get a Book pill beside the menu button, so there is no bottom booking bar. On desktop, a fine accent line slides under the nav link for the section in view.
- Lewis rejected two earlier directions: cobalt with a scroll-scrubbed spine animation (boring and janky), and a black hero with the badge and heavy condensed capitals ("gym bro"). Don't bring back scroll-scrubbed frame sequences or loud, heavy type.
- Motion is quiet and short with no bounce (`--out`), uses transform, opacity and clip-path, and always respects `prefers-reduced-motion`.
- Touch targets at least 44px. Use `svh`, safe-area insets and real form attributes (`autocomplete`, `inputmode`).

## Legal rules that shape the copy

- UK ad rules (CAP/ASA) and the General Chiropractic Council: "Dr" must be immediately followed by "Doctor of Chiropractic", and must be clearly qualified as a courtesy title with no general medical qualification held. Never show "Dr Mitch" alone or "Dr Mitch DC". This applies everywhere public, including titles, meta descriptions and social posts. A non-medical doctorate does not remove this requirement.
- Only claim the conditions already listed on the homepage; they follow ASA guidance on chiropractic. Adding one needs strong evidence.
- Never imply chiropractic "realigns", "corrects" or "straightens" the spine, or mention subluxations.
- The badge says "Dr Mitch" and "The Body Mechanic". On the site it only appears in the footer, directly beside "Dr Mitch, Doctor of Chiropractic". Before launch, the solicitor or CAP Copy Advice must confirm that this is enough, and that "The Body Mechanic" and the gear don't imply fixing the body. Never use the badge where the qualifier can't sit right next to it, such as the favicon or app icons.
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

- The Ceramic design on a real iPhone in Safari, especially the menu reveal and the badge's screen blend.
- Mitch's own photos to replace the four temporary stock photos, then regenerate `og.jpg`, which uses the hero photo.
- Mitch should review the hero line "Mitch will listen, examine you properly and explain what's going on before any treatment starts" and the trust points under it.
- A vector or high-resolution version of the badge from Mitch's designer. Ideally also a single-colour version, so the badge can sit on the paper ground.
- Lighthouse scores and a VoiceOver pass on a real iPhone. The keyboard pass is done.

## Status

- `/book/` is a working front-end preview with no real diary or payment. The plan is Cliniko with Stripe; set `bookingUrl` to send every Book button there.
- Still needed from Mitch: see the placeholders listed by `npm run build`, his real photo (the About section has an empty frame for it), and a map image.
- Waiting on which doctorate Mitch holds. If he has a medical degree and GMC registration, the "Dr" wording can change.
