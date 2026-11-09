(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Menu ---------- */
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  if (burger && menu) {
    const main = $('main');
    const foot = $('footer');
    const setOpen = (open, restoreFocus = true) => {
      root.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.inert = !open;
      if (main) main.inert = open;
      if (foot) foot.inert = open;
      if (open) setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 80);
      else if (restoreFocus) burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setOpen(false); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false, false); });
    matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setOpen(false, false); });
  }

  /* ---------- The top bar settles into a slimmer bar once the page scrolls ---------- */
  let scrolled = null;
  const onScroll = () => {
    const s = scrollY > 16;
    if (s !== scrolled) { scrolled = s; root.classList.toggle('scrolled', s); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Phones: sections stack like iOS sheets ---------- */
  // Sticky positioning does the movement. This measures each section so a tall one only sticks once its end
  // is on screen, and dims whatever is being covered.
  const narrow = matchMedia('(max-width: 959px)');
  const sections = $$('main > section');
  if (sections.length > 1 && $('[data-hero]')) {
    const foot = $('footer');
    const covers = [...sections.slice(1), foot].filter(Boolean);
    // Markers sit in the normal flow just above each sheet, so in-page links can find a sheet's real place.
    const marks = covers.map((el) => { const m = document.createElement('div'); m.className = 'snap'; m.setAttribute('aria-hidden', 'true'); el.before(m); return m; });
    const lip = 24;
    const heroPhoto = $('.hero-photo');
    const pairs = [[heroPhoto, $('.hero-copy')], ...sections.map((s, i) => [s, covers[i]])].filter(([a, b]) => a && b);
    const measure = () => { sections.forEach((s) => s.style.setProperty('--h', `${s.offsetHeight}px`)); };
    new ResizeObserver(measure).observe($('main'));
    measure();
    const stickTop = () => parseFloat(getComputedStyle($('[data-bar]')).paddingTop) + parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) - 2 * parseFloat(getComputedStyle(root).getPropertyValue('--settle'));
    let queued = false;
    const dim = () => {
      queued = false;
      const stick = stickTop();
      for (const [under, over] of pairs) {
        // 0 while the next sheet is still just behind this one's end, 1 once it reaches the header.
        const from = Math.max(stick + 1, under.getBoundingClientRect().bottom - lip);
        const p = Math.min(1, Math.max(0, (from - over.getBoundingClientRect().top) / (from - stick)));
        under.style.setProperty('--dim', (p * p * 0.32).toFixed(3));
      }
    };
    const onScrollDim = () => { if (!queued) { queued = true; requestAnimationFrame(dim); } };
    const setMode = () => {
      root.classList.toggle('sheets', narrow.matches);
      if (narrow.matches) { measure(); addEventListener('scroll', onScrollDim, { passive: true }); dim(); }
      else { removeEventListener('scroll', onScrollDim); pairs.forEach(([under]) => under.style.removeProperty('--dim')); }
    };
    narrow.addEventListener('change', setMode);
    setMode();
    // In-page links go to the sheet's own place in the page, not where a stuck sheet happens to be drawn.
    const goTo = (section, smooth) => {
      const mark = marks[covers.indexOf(section)];
      if (!mark) return false;
      scrollTo({ top: mark.offsetTop - lip - stickTop(), behavior: smooth ? 'smooth' : 'instant' });
      return true;
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a || !narrow.matches || a.pathname !== location.pathname) return;
      const target = document.getElementById(a.hash.slice(1));
      if (target && goTo(target, !matchMedia('(prefers-reduced-motion: reduce)').matches)) { e.preventDefault(); history.pushState(null, '', a.hash); }
    });
    if (location.hash && narrow.matches) { const t = document.getElementById(location.hash.slice(1)); if (t) addEventListener('load', () => goTo(t, false), { once: true }); }
  }

  /* ---------- Desktop: a line under the nav link for the section in view ---------- */
  const ink = $('[data-ink]');
  const links = $$('.nav-wide a[href^="#"]');
  if (!ink || !links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  let current = null;
  const place = (animate = true) => {
    if (!current) { ink.style.opacity = 0; return; }
    if (!animate) ink.style.transition = 'none';
    ink.style.transform = `translateX(${current.offsetLeft}px) scaleX(${current.offsetWidth})`;
    ink.style.opacity = 1;
    if (!animate) { ink.getBoundingClientRect(); ink.style.transition = ''; }
  };
  // A thin band across the upper middle of the screen decides which section is "in view".
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const wasHidden = !current;
      current = byId.get(e.target.id) || null;
      links.forEach((a) => (a === current ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
      place(!wasHidden);
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('[data-hero], main section[id]').forEach((s) => io.observe(s));
  addEventListener('resize', () => place(false));
  document.fonts?.ready.then(() => place(false));
})();
