(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const STEPS = ['service', 'time', 'details', 'pay', 'done'];
  const NEXT = ['Choose a time', 'Enter your details', 'Go to payment', 'Pay deposit'];
  const SVC = { new: 'New patient consultation', follow: 'Follow-up treatment', massage: 'Sports massage' };
  const form = $('[data-form]');
  const state = { step: 0, day: null, slot: null };

  // Working days from tomorrow, for the preview diary
  const days = [];
  for (let d = new Date(); days.length < 12;) { d = new Date(d.getTime() + 864e5); if (d.getDay() !== 0) days.push(d); }
  state.day = days[0];
  const fmt = (d, o) => d.toLocaleDateString('en-GB', o);
  const whenText = () => state.slot ? `${fmt(state.day, { weekday: 'long', day: 'numeric', month: 'long' })}, ${state.slot}` : 'Time not chosen yet';
  const within14 = () => (state.day.getTime() - Date.now()) < 14 * 864e5;

  const dayBox = $('[data-days]'), slotBox = $('[data-slots]');
  const renderDays = () => {
    $('[data-month]').textContent = fmt(state.day, { month: 'long' });
    dayBox.replaceChildren(...days.map((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(d === state.day));
      b.setAttribute('aria-label', fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }));
      b.innerHTML = `<small>${fmt(d, { weekday: 'short' })}</small><b>${d.getDate()}</b>`;
      b.onclick = () => { state.day = d; state.slot = null; renderDays(); renderSlots(); summary(); };
      return b;
    }));
  };
  const TIMES = ['09:00', '09:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00'];
  const renderSlots = () => {
    $('[data-slotlabel]').textContent = `Available on ${fmt(state.day, { weekday: 'long', day: 'numeric', month: 'long' })}`;
    const seed = state.day.getDate();
    slotBox.replaceChildren(...TIMES.filter((_, i) => (i + seed) % 3).map((t) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t;
      b.setAttribute('aria-pressed', String(t === state.slot));
      b.onclick = () => { state.slot = t; $('[data-err-time]').hidden = true; renderSlots(); summary(); };
      return b;
    }));
  };
  const svcValue = () => form.elements.svc.value;
  const summary = () => {
    $('[data-sum-svc]').textContent = SVC[svcValue()];
    $('[data-sum-when]').textContent = whenText();
    // Phones show a one-line summary above the buttons instead of the summary panel
    $('[data-navsum]').textContent = state.slot ? `${SVC[svcValue()]} · ${whenText()}` : SVC[svcValue()];
  };
  form.addEventListener('change', summary);

  const validate = (input) => {
    const box = input.closest('.f'); const err = $('.err', box);
    const ok = input.checkValidity() && (input.type !== 'tel' || input.value.replace(/\D/g, '').length >= 10);
    err.hidden = ok; input.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  $$('.fields input').forEach((i) => {
    i.addEventListener('blur', () => { if (i.value) validate(i); });
    i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') validate(i); });
  });

  const show = (i, focus) => {
    state.step = i;
    $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== STEPS[i]; });
    const inFlow = i < 4;
    $('[data-steplabel]').textContent = `Step ${i + 1} of 4`;
    $('[data-steplabel]').hidden = !inFlow;
    $$('.book-prog i').forEach((b, n) => b.classList.toggle('on', n <= i));
    $('.book-prog').hidden = !inFlow;
    $('[data-nav]').hidden = !inFlow;
    $('[data-sum]').hidden = !inFlow;
    $('[data-back]').hidden = i === 0;
    $('[data-book]').classList.toggle('finished', !inFlow);
    document.body.classList.toggle('done', !inFlow);
    if (inFlow) $('[data-next]').textContent = NEXT[i];
    if (i === 3) $('[data-consent-wrap]').hidden = !within14();
    if (i === 4) {
      $('[data-echo-email]').textContent = form.elements.email.value || 'your inbox';
      $('[data-echo-svc]').textContent = SVC[svcValue()];
      $('[data-echo-when]').textContent = whenText();
    }
    scrollTo(0, 0);
    if (focus) { const h = $(`[data-panel="${STEPS[i]}"] h1`); h.tabIndex = -1; h.focus({ preventScroll: true }); }
  };

  const go = (i) => { location.hash = `step-${STEPS[i]}`; };
  addEventListener('hashchange', () => {
    const i = STEPS.indexOf(location.hash.replace('#step-', ''));
    show(i < 0 ? 0 : i, true);
  });
  $('[data-back]').addEventListener('click', () => history.back());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = state.step;
    if (s === 1 && !state.slot) { $('[data-err-time]').hidden = false; return; }
    if (s === 2) {
      const bad = $$('.fields input').map((i) => [i, validate(i)]).find(([, ok]) => !ok);
      if (bad) { bad[0].focus(); return; }
    }
    if (s === 3 && within14() && !$('[data-consent]').checked) { $('[data-err-consent]').hidden = false; return; }
    go(s + 1);
  });
  $('[data-consent]').addEventListener('change', () => { $('[data-err-consent]').hidden = true; });

  // A treatment link from the homepage (?service=massage) arrives with that treatment already chosen.
  const chosen = new URLSearchParams(location.search).get('service');
  if (chosen && SVC[chosen]) form.elements.svc.value = chosen;

  renderDays(); renderSlots(); summary(); show(0, false);
  if (location.hash && location.hash !== '#step-service') history.replaceState(null, '', location.pathname);
})();
