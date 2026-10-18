// Menú móvil
const btn = document.querySelector('.menu-btn');
const list = document.querySelector('.nav ul');
if (btn && list) {
  const setOpen = (open) => {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => setOpen(!list.classList.contains('open')));
  list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

// Header: cambia de estilo al hacer scroll
const header = document.querySelector('header.site');
if (header && document.body.classList.contains('home')) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Estrellas del hero
const stars = document.querySelector('.stars');
if (stars) {
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('span');
    const size = Math.random() * 2.5 + 1.5;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 85}%;width:${size}px;height:${size}px;animation-delay:${(Math.random() * 3).toFixed(2)}s;animation-duration:${(2 + Math.random() * 3).toFixed(2)}s`;
    stars.appendChild(s);
  }
}

// Animación de entrada al hacer scroll
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in'));
}

// Link activo en el menú según la sección visible
const links = document.querySelectorAll('.nav a.link');
const targets = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && targets.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach(t => spy.observe(t));
}

// Inclinación suave de la mascota con el mouse (solo escritorio)
const art = document.querySelector('.hero-art');
const mascot = document.getElementById('mascot-float');
if (art && mascot && window.matchMedia('(hover:hover) and (min-width:861px)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  art.addEventListener('mousemove', (e) => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mascot.style.translate = `${x * 18}px ${y * 12}px`;
    mascot.style.rotate = `${x * 4}deg`;
  });
  art.addEventListener('mouseleave', () => { mascot.style.translate = ''; mascot.style.rotate = ''; });
  mascot.style.transition = 'translate .25s ease-out, rotate .25s ease-out';
}

// Banner de cookies (consentimiento guardado en el navegador)
(function () {
  const KEY = 'akiko_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) setTimeout(() => banner.classList.add('show'), 1200);

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    banner.classList.remove('show');
    // Aquí podrías cargar analítica (ej. Google Analytics) SOLO si value === 'all'
  }
  document.getElementById('cookie-accept').addEventListener('click', () => save('all'));
  document.getElementById('cookie-reject').addEventListener('click', () => save('essential'));
})();
