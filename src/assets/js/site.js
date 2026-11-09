(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  /* ---------- Top bar and booking dock ---------- */
  const bar = $('[data-bar]');
  const scene = $('[data-scene]');
  const dock = $('[data-dock]');
  const visit = $('[data-visit]');
  let visitOn = false;
  if (visit && dock) new IntersectionObserver(([e]) => { visitOn = e.isIntersecting; onScroll(); }, { rootMargin: '0px 0px -20% 0px' }).observe(visit);
  let last = scrollY;
  function onScroll() {
    const y = scrollY;
    const end = scene ? scene.offsetTop + scene.offsetHeight - innerHeight : 0;
    const past = !scene || y > end + 40;
    bar.classList.toggle('solid', past);
    bar.classList.toggle('away', past && y > last + 2 && !root.classList.contains('menu-open'));
    if (y < last - 2) bar.classList.remove('away');
    if (dock) dock.classList.toggle('show', past && !visitOn);
    last = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- The scroll scene ---------- */
  const canvas = $('[data-canvas]');
  if (!scene || !canvas || reduce) return;
  scene.classList.add('play');
  const stageH = () => $('.stage', scene).offsetHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  const N = 64;
  const base = $('.poster', scene).getAttribute('src').replace(/720-000\.webp$/, '');
  const frames = new Array(N).fill(null);
  const conn = navigator.connection || {};
  const thrifty = conn.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  const width = () => canvas.clientWidth * Math.min(devicePixelRatio || 1, 2.5);
  const size = width() > 800 ? 1080 : 720;

  // Coarse frames first, so the whole scroll works early and sharpens as more arrive.
  const order = [];
  const seen = new Set();
  for (const step of thrifty ? [8, 4, 2] : [16, 8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(N - 1)) order.push(N - 1);
  let cursor = 0;
  const pump = () => {
    if (cursor >= order.length) return;
    const i = order[cursor++];
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { frames[i] = im; dirty = true; kick(); pump(); };
    im.onerror = pump;
    im.src = `${base}${size}-${String(i).padStart(3, '0')}.webp`;
  };
  const startLoading = () => { for (let k = 0; k < 4; k++) pump(); };
  if (document.readyState === 'complete') startLoading(); else addEventListener('load', startLoading, { once: true });

  const fit = () => {
    const w = Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2));
    const h = Math.round(canvas.clientHeight * Math.min(devicePixelRatio || 1, 2));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; kick(); }
  };
  const paint = (im, alpha) => {
    const iw = im.naturalWidth, ih = im.naturalHeight, cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / iw, ch / ih), dw = iw * s, dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (cw - dw) / 2, (ch - dh) * 0.34, dw, dh);
  };

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const reel = $('[data-reel]');
  const subs = $$('[data-sub]');
  const cue = $('[data-cue]');
  let target = 0, cur = 0, shown = -1, running = false, dirty = true, chapter = 0, lastT = 0;

  const read = () => {
    const top = scene.getBoundingClientRect().top;
    const span = scene.offsetHeight - stageH();
    target = Math.min(1, Math.max(0, -top / span));
    if (cue) cue.classList.toggle('gone', -top > 40);
  };
  const draw = (idx) => {
    let lo = Math.floor(idx), hi = Math.ceil(idx);
    while (lo > 0 && !frames[lo]) lo--;
    while (hi < N - 1 && !frames[hi]) hi++;
    const a = frames[lo], b = frames[hi];
    if (!a && !b) return false;
    // Show the nearest frame. Blending frames while the camera moves shows a double image.
    const f = hi > lo ? (idx - lo) / (hi - lo) : 0;
    paint(!b || (a && f < 0.5) ? a : b, 1);
    return true;
  };
  const frame = (t) => {
    const dt = Math.min(50, t - (lastT || t)); lastT = t;
    cur += (target - cur) * (1 - Math.pow(0.0018, dt / 1000 * 2.2));
    if (Math.abs(target - cur) < 0.0004) cur = target;
    const idx = cur * (N - 1);
    if (dirty || Math.abs(idx - shown) > 0.002) { if (draw(idx)) { shown = idx; dirty = false; canvas.style.opacity = 1; } }
    const w = smooth(.30, .37, cur) + smooth(.62, .70, cur) + smooth(.86, .93, cur);
    reel.style.setProperty('--w', w.toFixed(4));
    const c = Math.round(w);
    if (c !== chapter) { subs[chapter].classList.remove('on'); subs[c].classList.add('on'); chapter = c; }
    if (cur !== target || dirty) requestAnimationFrame(frame);
    else { running = false; lastT = 0; }
  };
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  canvas.style.opacity = 0;
  addEventListener('scroll', () => { read(); kick(); }, { passive: true });
  addEventListener('resize', () => { fit(); read(); kick(); });
  new ResizeObserver(fit).observe(canvas);
  fit(); read(); kick();
})();
