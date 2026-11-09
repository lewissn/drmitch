(() => {
  'use strict';
  const root = document.documentElement;
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  if (!burger || !menu) return;
  const main = document.querySelector('main');
  const foot = document.querySelector('footer');
  const setOpen = (open, focus = true) => {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.inert = !open; main.inert = open; foot.inert = open;
    if (open) setTimeout(() => menu.querySelector('a').focus({ preventScroll: true }), 80);
    else if (focus) burger.focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setOpen(false); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false, false); });
})();
