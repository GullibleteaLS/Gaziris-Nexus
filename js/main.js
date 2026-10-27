(() => {
  'use strict';
  const pages = [...document.querySelectorAll('.page')];
  const pager = document.querySelector('.pager');
  const previous = pager.querySelector('.previous');
  const next = pager.querySelector('.next');
  const status = pager.querySelector('.page-status');
  const index = document.querySelector('.index');
  const links = [...index.querySelectorAll('a')];
  let current = 0;
  let touch = null;
  const interactive = target => target instanceof Element && !!target.closest('a, button, input, select, textarea, video, audio, summary, [contenteditable], [role="slider"]');
  const fromHash = () => pages.findIndex(page => `#${page.id}` === location.hash);

  function show(number, { focus = true, updateHash = true } = {}) {
    if (number < 0 || number >= pages.length) return;
    const direction = number >= current ? '12px' : '-12px';
    pages.forEach((page, i) => {
      if (i !== number) page.querySelectorAll('video, audio').forEach(media => media.pause());
      page.hidden = i !== number;
    });
    current = number;
    pages[current].style.setProperty('--entry', direction);
    previous.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    status.textContent = `${current + 1} de ${pages.length}`;
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    index.open = false;
    if (updateHash && location.hash !== `#${pages[current].id}`) history.pushState(null, '', `#${pages[current].id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (focus) pages[current].querySelector('h1, h2').focus({ preventScroll: true });
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  links.forEach((link, i) => link.addEventListener('click', event => { event.preventDefault(); show(i); }));
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); show(0); });
  window.addEventListener('hashchange', () => { const page = fromHash(); if (page >= 0 || !location.hash) show(Math.max(0, page), { updateHash: false }); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && index.open) { index.open = false; index.querySelector('summary').focus(); return; }
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || interactive(event.target) || index.open) return;
    if (event.key === 'ArrowRight' && current < pages.length - 1) { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft' && current > 0) { event.preventDefault(); show(current - 1); }
  });
  document.querySelector('main').addEventListener('touchstart', event => {
    touch = event.touches.length === 1 && !interactive(event.target) ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now(), vertical: false } : null;
  }, { passive: true });
  document.querySelector('main').addEventListener('touchmove', event => {
    if (!touch) return;
    if (event.touches.length !== 1) { touch = null; return; }
    const dx = Math.abs(event.touches[0].clientX - touch.x);
    const dy = Math.abs(event.touches[0].clientY - touch.y);
    if (dy > 15 && dy > dx) touch.vertical = true;
  }, { passive: true });
  document.querySelector('main').addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (!touch.vertical && Date.now() - touch.time < 800 && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.8) show(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  document.querySelector('main').addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  document.addEventListener('click', event => { if (index.open && !index.contains(event.target)) index.open = false; });
  document.documentElement.classList.add('js');
  pager.hidden = false;
  show(Math.max(0, fromHash()), { focus: false, updateHash: false });
})();
