/* =========================================================
   Akiko · interacciones v2
   ========================================================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ---------- Menú móvil ----------
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.querySelector('header.site');
if (menuBtn && mobileMenu) {
  const setOpen = (open) => {
    mobileMenu.classList.toggle('open', open);
    if (header) header.classList.remove('hide');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

// ---------- Texto dividido en palabras ----------
function wrapWords(el, cls, inner) {
  const out = [];
  const walk = (node) => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = cls;
          if (inner) { const s = document.createElement('span'); s.textContent = part; w.appendChild(s); out.push(s); }
          else { w.textContent = part; out.push(w); }
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
  return out;
}
document.querySelectorAll('.split').forEach(el => {
  wrapWords(el, 'w', true).forEach((s, i) => s.style.setProperty('--wd', (i * 0.06).toFixed(2) + 's'));
});

// ---------- Aparición al hacer scroll ----------
const revealEls = document.querySelectorAll('.reveal, .split');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
// El hero entra de inmediato
requestAnimationFrame(() => document.querySelectorAll('.hero .reveal, .hero .split').forEach(el => el.classList.add('in')));

// ---------- Manifiesto: palabras que se encienden ----------
const scrub = document.querySelector('.scrub');
const scrubWords = scrub ? wrapWords(scrub, 'sw', false) : [];
if (reduceMotion) scrubWords.forEach(w => w.classList.add('on'));

// ---------- Marcas del dial ----------
function buildTicks(svg, c, rOut, rIn, rBig, n) {
  const g = svg.querySelector('.ticks');
  if (!g) return;
  let html = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const big = i % (n / 8) === 0;
    const r2 = big ? rBig : rIn;
    const x1 = c + Math.cos(a) * rOut, y1 = c + Math.sin(a) * rOut;
    const x2 = c + Math.cos(a) * r2, y2 = c + Math.sin(a) * r2;
    html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"${big ? ' class="big"' : ''}/>`;
  }
  g.innerHTML = html;
}
const chDial = document.querySelector('.dial');
if (chDial) buildTicks(chDial, 200, 199, 190, 180, 120);
const hdSvg = document.querySelector('.hd-svg');
if (hdSvg) buildTicks(hdSvg, 300, 300, 288, 270, 160);

// ---------- Capítulos de apps ----------
const chapters = document.querySelector('.chapters');
const chapterEls = [...document.querySelectorAll('.chapter')];
const screens = [...document.querySelectorAll('.ch-sticky .screen')];
const chCount = document.querySelector('.ch-count b');
const chArc = document.querySelector('.dial-arc');
let activeCh = -1;
function setChapter(i) {
  if (i === activeCh) return;
  activeCh = i;
  chapterEls.forEach((c, k) => c.classList.toggle('on', k === i));
  screens.forEach((s, k) => s.classList.toggle('on', k === i));
  if (chCount) chCount.textContent = String(i + 1).padStart(2, '0');
}
setChapter(0);

// ---------- Navegación: indicador y sección activa ----------
const navList = document.getElementById('menu');
const navLinks = navList ? [...navList.querySelectorAll('a')] : [];
const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href')));
let indicator = null;
if (navList) { indicator = document.createElement('span'); indicator.className = 'indicator'; navList.prepend(indicator); }
let activeNav = -2;
function setNav(i) {
  if (i === activeNav || !indicator) return;
  activeNav = i;
  navLinks.forEach((a, k) => a.classList.toggle('active', k === i));
  if (i < 0) { indicator.style.opacity = '0'; return; }
  const a = navLinks[i], prev = indicator.dataset.i !== undefined ? navLinks[+indicator.dataset.i] : null;
  indicator.dataset.i = i;
  indicator.style.opacity = '1';
  const settle = () => { indicator.classList.remove('stretch'); indicator.style.width = a.offsetWidth + 'px'; indicator.style.transform = `translateX(${a.offsetLeft}px)`; };
  if (prev && prev !== a && !reduceMotion) {
    // efecto líquido: primero cubre ambas opciones y luego se encoge sobre la nueva
    const l = Math.min(prev.offsetLeft, a.offsetLeft), r = Math.max(prev.offsetLeft + prev.offsetWidth, a.offsetLeft + a.offsetWidth);
    indicator.classList.add('stretch'); indicator.style.width = (r - l) + 'px'; indicator.style.transform = `translateX(${l}px)`;
    clearTimeout(indicator._t); indicator._t = setTimeout(settle, 230);
  } else settle();
}

// ---------- Navegación líquida (teléfono) ----------
const lnav = document.getElementById('lnav');
const lnItems = lnav ? [...lnav.querySelectorAll('li')] : [];
let lnActive = 0;
function setLiquid(i) {
  if (!lnav || i === lnActive || i < 0) return;
  lnActive = i;
  lnItems.forEach((li, k) => { li.classList.toggle('on', k === i); li.querySelector('a').toggleAttribute('aria-current', k === i); });
  const blob = lnav.querySelector('.lnBlob'); blob.classList.remove('moving'); void blob.offsetWidth; blob.classList.add('moving');
  lnav.style.setProperty('--x', i);
}
if (lnav) lnItems.forEach((li, k) => li.querySelector('a').addEventListener('click', () => setLiquid(k)));

// ---------- Mascotas que se separan ----------
const meetArt = document.querySelector('.meet-art');

// ---------- Bucle de scroll ----------
const bar = document.querySelector('.progress');
const wa = document.querySelector('.wa-float');
const cta = document.getElementById('contacto');
let lastY = window.scrollY, ticking = false;
function onScroll() {
  ticking = false;
  const y = window.scrollY, vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  // Header se oculta al bajar y aparece al subir
  if (header && !(mobileMenu && mobileMenu.classList.contains('open'))) {
    header.classList.toggle('hide', y > lastY && y > 240);
  }
  lastY = y;

  // Manifiesto
  if (scrub && !reduceMotion) {
    const r = scrub.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
    const n = Math.round(p * scrubWords.length);
    scrubWords.forEach((w, i) => w.classList.toggle('on', i < n));
  }

  // Capítulos
  if (chapters) {
    const mobile = window.innerWidth <= 900;
    const line = vh * (mobile ? 0.66 : 0.5);
    let idx = 0;
    chapterEls.forEach((c, i) => { if (c.getBoundingClientRect().top < line) idx = i; });
    setChapter(idx);
    const r = chapters.getBoundingClientRect();
    const p = clamp((vh * 0.5 - r.top) / (r.height - vh));
    if (chArc) chArc.style.strokeDashoffset = (100 - p * 100).toFixed(2);
  }

  // Sección activa en el menú
  let cur = -1;
  navTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < vh * 0.4) cur = i; });
  setNav(cur);
  if (lnav) {
    let li = 0;
    lnItems.forEach((it, k) => { const t = document.getElementById(it.querySelector('a').dataset.sec); if (t && k && t.getBoundingClientRect().top < vh * 0.45) li = k; });
    setLiquid(li);
    lnav.classList.toggle('tucked', !!(mobileMenu && mobileMenu.classList.contains('open')));
  }

  // WhatsApp flotante se esconde en el CTA final
  if (wa && cta) {
    const r = cta.getBoundingClientRect();
    wa.classList.toggle('away', r.top < vh * 0.7 || y < vh * 0.6);
  }

  // Tarjetas de la mascota
  if (meetArt && !reduceMotion) {
    const r = meetArt.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh + r.height)) * 2 - 1;
    meetArt.style.setProperty('--sx', (p * -24).toFixed(1) + 'px');
    meetArt.style.setProperty('--fx', (p * 24).toFixed(1) + 'px');
  }
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener('resize', () => { activeNav = -2; onScroll(); });
onScroll();

// ---------- Cómo funciona: dial con pasos ----------
(function () {
  const dial = document.querySelector('.how-dial');
  if (!dial) return;
  const steps = [...dial.querySelectorAll('.hd-step')];
  const pill = dial.querySelector('.hd-pill b');
  const arc = dial.querySelector('.hd-arc');
  const n = steps.length;
  let i = 0, timer = null, visible = false, hold = false;
  const go = (k) => {
    i = (k + n) % n;
    steps.forEach((s, j) => s.classList.toggle('on', j === i));
    if (pill) pill.textContent = i + 1;
    if (arc) arc.style.strokeDashoffset = (100 - ((i + 1) / n) * 100).toFixed(2);
  };
  const loop = () => { clearInterval(timer); if (visible && !hold && !reduceMotion) timer = setInterval(() => go(i + 1), 4800); };
  dial.querySelector('.next').addEventListener('click', () => { go(i + 1); loop(); });
  dial.querySelector('.prev').addEventListener('click', () => { go(i - 1); loop(); });
  dial.addEventListener('mouseenter', () => { hold = true; loop(); });
  dial.addEventListener('mouseleave', () => { hold = false; loop(); });
  let sx = null;
  dial.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  dial.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); loop(); }
  });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; loop(); }, { threshold: 0.4 }).observe(dial);
  go(0);
})();

// ---------- Video de demostración ----------
(function () {
  const video = document.querySelector('.phone-video video');
  if (!video) return;
  const btn = document.querySelector('.vid-sound');
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      const p = video.play(); if (p && p.catch) p.catch(() => {});
    } else video.pause();
  }, { threshold: 0.2, rootMargin: '150px 0px' }).observe(video);
  if (btn) btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.querySelector('use').setAttribute('href', video.muted ? '#i-mute' : '#i-sound');
    btn.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar');
    if (video.paused) video.play().catch(() => {});
  });
})();

// ---------- Líneas de luz (canvas) ----------
function flowField(canvas) {
  const ctx = canvas.getContext('2d');
  const colors = [[24, 212, 245], [47, 107, 255], [155, 60, 255]];
  let w, h, dpr, parts = [], running = false, t = 0;
  const mouse = { x: -9999, y: -9999 };
  const lerpColor = (k) => {
    const s = k * 2, i = Math.min(1, Math.floor(s)), f = s - i;
    const a = colors[i], b = colors[i + 1];
    return `rgba(${a[0] + (b[0] - a[0]) * f | 0},${a[1] + (b[1] - a[1]) * f | 0},${a[2] + (b[2] - a[2]) * f | 0},`;
  };
  const spawn = (p) => {
    p.x = Math.random() * w; p.y = Math.random() * h;
    p.life = 0; p.max = 120 + Math.random() * 260;
    p.v = 0.6 + Math.random() * 1.1;
    return p;
  };
  function resize() {
    dpr = 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(window.innerWidth < 700 ? 170 : 420, Math.round((w * h) / 3200));
    parts = Array.from({ length: n }, () => spawn({}));
  }
  function field(x, y) {
    return (Math.sin(x * 0.0023 + t * 0.6) + Math.cos(y * 0.0029 - t * 0.4) + Math.sin((x + y) * 0.0012 + t * 0.2)) * Math.PI * 0.7;
  }
  function frame() {
    if (!running) return;
    t += 0.0035;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.2;
    for (const p of parts) {
      let a = field(p.x, p.y);
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000) a += (1 - d2 / 22000) * 2.2;
      const nx = p.x + Math.cos(a) * p.v * 1.6, ny = p.y + Math.sin(a) * p.v * 1.6;
      const life = p.life / p.max;
      const alpha = Math.sin(life * Math.PI) * 0.8;
      ctx.strokeStyle = lerpColor(clamp(p.x / w)) + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.life++;
      if (p.life > p.max || nx < -10 || ny < -10 || nx > w + 10 || ny > h + 10) spawn(p);
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if (reduceMotion) { running = true; for (let k = 0; k < 90; k++) frame(); running = false; return; }
  new IntersectionObserver(([en]) => {
    const was = running; running = en.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);
}
document.querySelectorAll('canvas.flow').forEach(flowField);

// ---------- Detalles para mouse (solo escritorio) ----------
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
  const hero = document.querySelector('.hero');
  const mascot = document.getElementById('mascot-float');
  if (hero && mascot) {
    hero.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      mascot.style.translate = `${x * 26}px ${y * 18}px`;
      mascot.style.rotate = `${x * 5}deg`;
    });
    hero.addEventListener('mouseleave', () => { mascot.style.translate = ''; mascot.style.rotate = ''; });
  }
}

// ---------- Banner de cookies ----------
(function () {
  const KEY = 'akiko_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) setTimeout(() => banner.classList.add('show'), 1600);
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    banner.classList.remove('show');
    // Aquí podrías cargar analítica (ej. Google Analytics) SOLO si value === 'all'
  }
  document.getElementById('cookie-accept').addEventListener('click', () => save('all'));
  document.getElementById('cookie-reject').addEventListener('click', () => save('essential'));
})();


// ---------- Profundidad: capas que se mueven con el cursor y el scroll ----------
(function depth() {
  const layers = [...document.querySelectorAll('.depth')];
  if (!layers.length || reduceMotion) return;
  let mx = 0, my = 0, raf = 0;
  const paint = () => {
    raf = 0;
    const vh = window.innerHeight;
    layers.forEach(el => {
      const d = Number(el.dataset.depth) || 10, box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      const sc = (box.top + box.height / 2 - vh / 2) / vh; // -1 … 1 mientras la sección cruza la pantalla
      el.style.transform = `translate3d(${(mx * d).toFixed(1)}px, ${(my * d + sc * d * 3).toFixed(1)}px, 0)`;
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; ask(); }, { passive: true });
  addEventListener('scroll', ask, { passive: true });
  paint();
})();
