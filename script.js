(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '×' : '☰';
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = '☰';
  }));

  const search = document.getElementById('testSearch');
  const cards = [...document.querySelectorAll('.test-item')];
  const chips = [...document.querySelectorAll('.chip')];
  const noResults = document.getElementById('noResults');
  let category = 'all';
  function filterTests() {
    const query = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const categories = (card.dataset.category || '').split(' ');
      const matches = name.includes(query) && (category === 'all' || categories.includes(category));
      card.hidden = !matches;
      if (matches) shown++;
    });
    if (noResults) noResults.hidden = shown > 0;
  }
  search?.addEventListener('input', filterTests);
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    if (search) search.value = '';
    category = 'all';
    chips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === 'all'));
    filterTests(); search?.focus();
  });
  chips.forEach(chip => chip.addEventListener('click', () => {
    category = chip.dataset.filter || 'all';
    chips.forEach(item => item.classList.toggle('active', item === chip));
    filterTests();
  }));

  const form = document.getElementById('bookingForm');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = [
      'Assalam-o-Alaikum Lahore Health Care Lab, I would like to make an enquiry.',
      '', `Name: ${data.get('name')}`, `Phone/WhatsApp: ${data.get('phone')}`,
      `Enquiry type: ${data.get('service')}`,
      data.get('date') ? `Preferred date: ${data.get('date')}` : '',
      data.get('area') ? `Area: ${data.get('area')}` : '',
      data.get('message') ? `Details: ${data.get('message')}` : '',
      '', 'Please confirm availability, price and next steps. Thank you.'
    ].filter(Boolean);
    const message = encodeURIComponent(lines.join('\n'));
    const feedback = document.getElementById('formFeedback');
    if (feedback) feedback.textContent = 'Opening WhatsApp. Review the message and press Send there to submit your enquiry.';
    window.open(`https://wa.me/923009449677?text=${message}`, '_blank', 'noopener,noreferrer');
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
