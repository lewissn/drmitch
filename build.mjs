// Builds the static site into dist/. Usage: node build.mjs [--preview]
// --preview writes links as explicit index.html files for hosts without clean URLs.
import fs from 'node:fs';
import path from 'node:path';

const preview = process.argv.includes('--preview');
const cfg = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const out = preview ? 'dist-preview' : 'dist';
const url = cfg.siteUrl.replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const todo = (label) => `<span class="todo">[${label}]</span>`;
const v = (key, label) => (cfg[key] ? esc(cfg[key]) : todo(label));
const money = (key) => (cfg[key] ? esc(cfg[key]) : todo('£00'));

const address = [cfg.clinicName, cfg.street, cfg.town, cfg.county, cfg.postcode].filter(Boolean).join(', ');
const where = cfg.town ? `in ${cfg.town}` : '';
const DR = '“Dr” is a courtesy title. Mitch is a Doctor of Chiropractic and does not hold a general medical qualification.';
// The brand name matches Mitch's logo: "Dr Mitch", always followed straight away by "Doctor of Chiropractic".
// His surname (site.config.json) is used where a full name helps: Google's clinic data and the home-screen name.
const NAME = 'Dr Mitch';
const BRAND = `${NAME}, Doctor of Chiropractic`;
// The Dr Mitch symbol (a ring around a dumbbell cross). It takes its colour from the text around it.
// The same drawing is in brand/drmitch-symbol.svg for use outside the website.
const SYMBOL = '<svg class="mark" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><g fill="currentColor"><path fill-rule="evenodd" d="M0-48a48 48 0 1 1 0 96a48 48 0 1 1 0-96zM0-42.74a42.74 42.74 0 1 0 0 85.48a42.74 42.74 0 1 0 0-85.48z"/><rect x="-3" y="-20" width="6" height="40"/><rect x="-18" y="-3" width="36" height="6"/><rect x="-9.8" y="-32.7" width="19.6" height="13.5" rx="3"/><rect x="-9.8" y="19.2" width="19.6" height="13.5" rx="3"/><rect x="-31" y="-9.8" width="13.7" height="19.6" rx="3"/><rect x="17.3" y="-9.8" width="13.7" height="19.6" rx="3"/></g></svg>';
const directions = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
const tel = cfg.phone ? cfg.phone.replace(/[^\d+]/g, '') : '';

const tokens = {
  surname: v('surname', 'Surname'),
  gcc: v('gccNumber', '00000'),
  town: v('town', 'Town'),
  address: address ? esc(address) : todo('Clinic name and full address'),
  hours: v('openingHours', 'Opening hours'),
  parking: v('parking', 'Parking and access'),
  phone: cfg.phone ? `<a href="tel:${tel}">${esc(cfg.phone)}</a>` : todo('Phone'),
  email: cfg.email ? `<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>` : todo('Email at drmitch.co.uk'),
  // Until the phone, email or address is filled in, these show as inert buttons; the missing facts are already listed as placeholders.
  callBtn: cfg.phone ? `<a class="btn btn-quiet" href="tel:${tel}">Call Mitch</a>` : '<span class="btn btn-quiet" aria-disabled="true">Call Mitch</span>',
  emailBtn: cfg.email ? `<a class="btn btn-quiet" href="mailto:${esc(cfg.email)}">Email Mitch</a>` : '<span class="btn btn-quiet" aria-disabled="true">Email Mitch</span>',
  bio: v('bio', 'Two or three sentences in Mitch’s own words: why he does this, who he mostly sees, what he’s like in the room.'),
  degree: v('degree', 'Doctorate, institution, year'),
  massageQ: v('massageQualification', 'Qualification and awarding body'),
  association: v('association', 'Professional association, if any'),
  insurers: v('insurers', 'Which insurers recognise Mitch, if any'),
  legalName: v('legalName', 'Legal name of the business'),
  businessType: v('businessType', 'Sole trader or limited company'),
  companyNumber: cfg.companyNumber ? ` Company number ${esc(cfg.companyNumber)}.` : '',
  ico: v('icoNumber', 'ICO registration number'),
  retention: v('recordsRetention', 'How long records are kept, confirmed by Mitch'),
  notice: v('cancellationNotice', 'Notice period'),
  deposit: money('deposit'),
  newMin: esc(cfg.newMinutes), newPrice: money('newPrice'),
  followMin: esc(cfg.followMinutes), followPrice: money('followPrice'),
  massageMin: esc(cfg.massageMinutes), massagePrice: money('massagePrice'),
  dr: DR,
  brand: esc(BRAND),
  updated: new Date(cfg.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  directions: directions ? `<a class="btn btn-quiet" href="${directions}" rel="noopener">Directions</a>` : '<span class="btn btn-quiet" aria-disabled="true">Directions</span>'
};

const pages = [
  { src: 'index.html', out: 'index.html', route: '', nest: 0, title: `Chiropractor ${where ? where + ' ' : ''}and sports massage | ${BRAND}`.replace('  ', ' '), desc: `Chiropractic and sports massage${where ? ` ${where}` : ''}. See prices and book online. ${DR}`, scripts: ['site.js'] },
  { src: 'book.html', out: 'book/index.html', route: 'book/', nest: 1, title: `Book an appointment | ${BRAND}`, desc: `Book a chiropractic or sports massage appointment online. ${DR}`, scripts: ['site.js', 'book.js'], noindex: !cfg.bookingUrl },
  { src: 'privacy.html', out: 'privacy/index.html', route: 'privacy/', nest: 1, title: `Privacy notice | ${BRAND}`, desc: 'How Mitch collects, uses and protects your information, and the rights you have over it.', scripts: ['site.js'] },
  { src: 'cookies.html', out: 'cookies/index.html', route: 'cookies/', nest: 1, title: `Cookies | ${BRAND}`, desc: 'This website sets no advertising or analytics cookies. Here is what happens when you pay for a booking.', scripts: ['site.js'] },
  { src: 'terms.html', out: 'terms/index.html', route: 'terms/', nest: 1, title: `Booking terms | ${BRAND}`, desc: 'Deposits, cancelling and changing an appointment, and how to make a complaint.', scripts: ['site.js'] },
  { src: '404.html', out: '404.html', route: null, nest: 0, title: `Page not found | ${BRAND}`, desc: 'This page does not exist.', scripts: ['site.js'], noindex: true }
];

const jsonLd = () => {
  const d = {
    '@context': 'https://schema.org', '@type': 'MedicalClinic',
    '@id': `${url}/#clinic`,
    name: cfg.clinicName || BRAND,
    url: `${url}/`,
    image: `${url}/assets/img/og.jpg`,
    medicalSpecialty: 'Chiropractic',
    description: `Chiropractic and sports massage. ${DR}`,
    availableService: [
      { '@type': 'MedicalProcedure', name: 'Chiropractic consultation and treatment' },
      { '@type': 'MedicalTherapy', name: 'Sports massage' }
    ]
  };
  if (cfg.street && cfg.town && cfg.postcode) d.address = { '@type': 'PostalAddress', streetAddress: cfg.street, addressLocality: cfg.town, addressRegion: cfg.county || undefined, postalCode: cfg.postcode, addressCountry: 'GB' };
  if (cfg.latitude && cfg.longitude) d.geo = { '@type': 'GeoCoordinates', latitude: Number(cfg.latitude), longitude: Number(cfg.longitude) };
  if (cfg.phone) d.telephone = cfg.phone;
  if (cfg.email) d.email = cfg.email;
  if (cfg.surname) d.founder = { '@type': 'Person', name: `Mitch ${cfg.surname}`, jobTitle: 'Chiropractor' };
  return JSON.stringify(d);
};

const header = (p) => `<a class="skip" href="#main">Skip to content</a>
<header class="bar" data-bar>
  <a class="brand" href="{{link:home}}">${SYMBOL}<span class="brand-text"><b>${esc(NAME)}<span class="vh">,</span></b><small>Doctor of Chiropractic</small></span></a>
  <nav class="nav-wide" aria-label="Main">
    <a href="{{link:home}}#treat">Treatments</a><a href="{{link:home}}#about">About</a><a href="{{link:home}}#questions">Questions</a><a href="{{link:home}}#visit">Visit</a><a class="btn btn-small" href="{{link:book}}">Book</a>
    <span class="nav-ink" aria-hidden="true" data-ink></span>
  </nav>
  <div class="bar-end">
    <a class="btn btn-small bar-book" href="{{link:book}}">Book</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu" data-burger><span></span><span></span><span></span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu inert>
  <div class="menu-in">
    <nav aria-label="Menu">
      <ul>
        <li><a href="{{link:home}}#treat">Treatments</a></li>
        <li><a href="{{link:home}}#first">Your first visit</a></li>
        <li><a href="{{link:home}}#about">About Mitch</a></li>
        <li><a href="{{link:home}}#questions">Questions</a></li>
        <li><a href="{{link:home}}#visit">Visit</a></li>
      </ul>
    </nav>
    <div class="menu-foot">
      <a class="btn" href="{{link:book}}">Book an appointment</a>
      <p>${cfg.phone ? tokens.phone : todo('Phone')}</p>
    </div>
  </div>
</div>`;

const footer = `<footer class="foot">
  <div class="foot-in">
    <div class="sign">${SYMBOL}<p>${esc(NAME)}<span class="vh">,</span><small>Doctor of Chiropractic</small></p></div>
    <div class="foot-col">
      <h2 class="foot-h">Contact</h2>
      <address class="foot-contact">
        <p>{{phone}}</p>
        <p>{{email}}</p>
        <p>{{address}}</p>
        <p>{{hours}}</p>
      </address>
    </div>
    <nav class="foot-col" aria-label="Footer">
      <h2 class="foot-h">Visit the site</h2>
      <ul>
        <li><a href="{{link:home}}#treat">Treatments and prices</a></li>
        <li><a href="{{link:home}}#first">Your first visit</a></li>
        <li><a href="{{link:home}}#about">About Mitch</a></li>
        <li><a href="{{link:home}}#questions">Questions</a></li>
        <li><a href="{{link:home}}#visit">Finding the clinic</a></li>
        <li><a href="{{link:book}}">Book an appointment</a></li>
      </ul>
    </nav>
    <div class="foot-col">
      <h2 class="foot-h">Policies</h2>
      <ul>
        <li><a href="{{link:privacy}}">Privacy</a></li>
        <li><a href="{{link:cookies}}">Cookies</a></li>
        <li><a href="{{link:terms}}">Booking terms</a></li>
        <li><a href="https://www.gcc-uk.org/" rel="noopener">Check the GCC register</a></li>
      </ul>
    </div>
    <div class="foot-small">
      <p>${DR} Registered with the General Chiropractic Council, no. {{gcc}}. Online payments are processed by Stripe.</p>
      <p>© ${new Date().getFullYear()} {{legalName}}</p>
    </div>
  </div>
</footer>`;

const fonts = ['newsreader.woff2', 'hanken-400.woff2'];
const layout = (p, body) => {
  const canonical = p.route === null ? '' : `<link rel="canonical" href="${url}/${p.route}">`;
  const noindex = (!cfg.launched || p.noindex) ? '<meta name="robots" content="noindex">' : '';
  const preload = fonts.map((f) => `<link rel="preload" href="{{base}}assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F3F1EC">
${noindex}
${canonical}
<meta property="og:type" content="website">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}/${p.route ?? ''}">
<meta property="og:image" content="${url}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{{base}}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{{base}}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{{base}}apple-touch-icon.png">
<link rel="manifest" href="{{base}}site.webmanifest">
${preload}
<link rel="stylesheet" href="{{base}}assets/css/site.css">
${p.src === 'index.html' ? `<script type="application/ld+json">${jsonLd()}</script>` : ''}
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-${p.src.replace('.html', '')}">
${header(p)}
<main id="main">
${body}
</main>
${footer}
${p.scripts.map((s) => `<script src="{{base}}assets/js/${s}" defer></script>`).join('\n')}
</body>
</html>
`;
};

const links = { home: preview ? 'index.html' : '', book: cfg.bookingUrl || (preview ? 'book/index.html' : 'book/'), privacy: preview ? 'privacy/index.html' : 'privacy/', cookies: preview ? 'cookies/index.html' : 'cookies/', terms: preview ? 'terms/index.html' : 'terms/' };
const render = (s, base, home) => s
  .replace(/\{\{link:home\}\}#/g, home ? '#' : '{{link:home}}#')
  .replace(/\{\{link:home\}\}/g, home ? '#main' : '{{link:home}}')
  .replace(/\{\{link:(\w+)\}\}/g, (_, k) => (/^https?:/.test(links[k]) ? links[k] : (base + links[k]) || './'))
  .replace(/\{\{base\}\}/g, base)
  .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync('src/assets', `${out}/assets`, { recursive: true });
for (const f of fs.readdirSync('src/root')) fs.copyFileSync(`src/root/${f}`, `${out}/${f}`);
const manifest = { name: BRAND, short_name: cfg.surname ? `Mitch ${cfg.surname}` : 'Mitch', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }], theme_color: '#F3F1EC', background_color: '#F3F1EC', display: 'browser' };
fs.writeFileSync(`${out}/site.webmanifest`, JSON.stringify(manifest));

// Text pages with four or more sections get an "On this page" list, and every section heading gets an id
// so other pages can link straight to it (for example the cancellation rules in the booking terms).
const slug = (s) => s.replace(/<[^>]+>/g, '').toLowerCase().replace(/&[a-z]+;|[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const withContents = (body) => {
  if (!body.includes('class="prose"')) return body;
  const heads = [...body.matchAll(/<h2>(.*?)<\/h2>/g)];
  if (heads.length < 4) return body;
  const list = heads.map((m) => `<li><a href="#${slug(m[1])}">${m[1]}</a></li>`).join('');
  const nav = `<nav class="toc" aria-label="On this page"><p class="label">On this page</p><ol>${list}</ol></nav>\n  `;
  body = body.replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${slug(t)}">${t}</h2>`);
  return body.replace(/<h2 id=/, nav + '<h2 id=');
};

for (const p of pages) {
  const body = withContents(fs.readFileSync(`src/pages/${p.src}`, 'utf8'));
  const base = p.nest ? '../'.repeat(p.nest) : '';
  let html = render(layout(p, body), base, p.src === 'index.html');
  if (preview && p.out === 'index.html') {
    // The preview host supplies the document skeleton for its entry page.
    html = html.replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">/, '').replace('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', '<meta name="claude:viewport-fit-sides" content="cover">').replace(/<\/head>\s*<body class="([^"]*)">/, '<div class="$1">').replace(/<\/body>\s*<\/html>\s*$/, '</div>');
  }
  fs.mkdirSync(path.dirname(`${out}/${p.out}`), { recursive: true });
  fs.writeFileSync(`${out}/${p.out}`, html);
}

fs.writeFileSync(`${out}/robots.txt`, cfg.launched
  ? `User-agent: *\nAllow: /\nDisallow: /book/\n\nSitemap: ${url}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
const indexed = pages.filter((p) => p.route !== null && !p.noindex);
fs.writeFileSync(`${out}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((p) => `  <url><loc>${url}/${p.route}</loc><lastmod>${cfg.lastUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const left = [...new Set(pages.flatMap((p) => [...render(layout(p, fs.readFileSync(`src/pages/${p.src}`, 'utf8')), '').matchAll(/class="todo">\[([^\]]+)\]/g)].map((m) => m[1])))];
// photo-*.webp are temporary stock photos (credited in README.md); replace each with Mitch's own before launch.
const stock = [...new Set(fs.readdirSync('src/assets/img').filter((f) => f.startsWith('photo-')).map((f) => f.replace(/-\d+\.webp$/, '')))];
left.push(...stock.map((f) => `Temporary stock photo: ${f}`));
console.log(`Built ${out}. ${left.length} placeholders left to fill.`);
if (left.length) console.log(left.map((l) => `  - ${l}`).join('\n'));
