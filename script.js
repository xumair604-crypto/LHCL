(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menu */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) toggle.textContent = 'Menu';
  }));

  /* entrances: parts of each section rise in turn, once */
  const items = [...document.querySelectorAll('[data-r]')];
  items.forEach(el => {
    const sibs = [...(el.parentElement?.querySelectorAll(':scope > [data-r]') || [])];
    el.style.setProperty('--i', Math.max(0, sibs.indexOf(el)));
  });
  document.querySelectorAll('.hero [data-r]').forEach(el => requestAnimationFrame(() => el.classList.add('in')));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => el.classList.add('in')), 4000);
  } else {
    items.forEach(el => el.classList.add('in'));
  }

  /* the stage changes with the section being read */
  const stage = document.querySelector('.split-b .stage');
  if (stage && 'IntersectionObserver' in window) {
    const panels = [...stage.querySelectorAll('.stage-panel')];
    const show = scene => panels.forEach(p => p.classList.toggle('on', p.dataset.scene === scene));
    const so = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach(e => show(e.target.dataset.scene));
    }, { rootMargin: '-40% 0px -50% 0px' });
    document.querySelectorAll('.split-b .sec[data-scene]').forEach(s => so.observe(s));
  }

  /* wordmark: scales down a few percent as the first screen leaves */
  const word = document.getElementById('wordmark');
  if (word && !reduce) {
    let tick = false;
    const run = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      word.style.transform = `scale(${1 - 0.07 * p})`;
      tick = false;
    };
    window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* test finder: search, filter and add to the enquiry */
  const search = document.getElementById('testSearch');
  const rows = [...document.querySelectorAll('.test-item')];
  const chips = [...document.querySelectorAll('.chip')];
  const none = document.getElementById('noResults');
  const picked = document.getElementById('picked');
  const message = document.getElementById('message');
  const chosen = new Set();
  let category = 'all';

  const filter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    rows.forEach(r => {
      const ok = (r.dataset.name || '').toLowerCase().includes(q) &&
        (category === 'all' || (r.dataset.category || '').split(' ').includes(category));
      r.hidden = !ok;
      if (ok) shown++;
    });
    if (none) none.hidden = shown > 0;
  };
  const sync = () => {
    const list = [...chosen];
    if (message) {
      const base = message.value.replace(/^Tests: .*\n?/, '');
      message.value = (list.length ? `Tests: ${list.join(', ')}\n` : '') + base;
    }
    if (picked) {
      picked.innerHTML = list.length
        ? `${list.length} selected. <a href="#booking">Continue to the enquiry</a>`
        : '';
    }
  };
  search?.addEventListener('input', filter);
  chips.forEach(c => c.addEventListener('click', () => {
    category = c.dataset.filter || 'all';
    chips.forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
    filter();
  }));
  rows.forEach(r => {
    r.setAttribute('role', 'button');
    r.setAttribute('aria-selected', 'false');
    r.addEventListener('click', ev => {
      ev.preventDefault();
      const name = r.querySelector('.nm').textContent.trim();
      if (chosen.has(name)) chosen.delete(name); else chosen.add(name);
      r.setAttribute('aria-selected', String(chosen.has(name)));
      sync();
    });
    r.addEventListener('keydown', ev => { if (ev.key === ' ') { ev.preventDefault(); r.click(); } });
  });

  /* enquiry opens WhatsApp with the message ready */
  const form = document.getElementById('bookingForm');
  form?.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const lines = [
      'Assalam-o-Alaikum Lahore Health Care Lab, I would like to make an enquiry.', '',
      `Name: ${d.get('name')}`, `Phone/WhatsApp: ${d.get('phone')}`, `Enquiry type: ${d.get('service')}`,
      d.get('date') ? `Preferred date: ${d.get('date')}` : '',
      d.get('area') ? `Area: ${d.get('area')}` : '',
      d.get('message') ? `Details: ${d.get('message')}` : '',
      '', 'Please confirm availability, price and next steps. Thank you.'
    ].filter(Boolean);
    const fb = document.getElementById('formFeedback');
    if (fb) fb.textContent = 'Opening WhatsApp. Review the message and press send there.';
    window.open(`https://wa.me/923009449677?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  });

  /* the email runs margin to margin on desktop */
  const email = document.getElementById('email');
  const fit = () => {
    if (!email) return;
    if (window.innerWidth <= 560) { email.style.fontSize = ''; return; }
    email.style.fontSize = '100px';
    const w = email.parentElement.clientWidth - 48;
    email.style.fontSize = Math.floor(100 * w / email.scrollWidth) + 'px';
  };
  fit();
  window.addEventListener('resize', fit);
  document.fonts?.ready.then(fit);

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
