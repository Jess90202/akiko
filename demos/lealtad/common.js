/* Utilidades compartidas por la pantalla de clientes (index.html) y la del negocio (negocio.html). */
const $ = id => document.getElementById(id);
// El loader respeta un mínimo de 600 ms y un máximo de 8 s, incluso si la API falla.
const LOADER_STARTED = Date.now();
let LOADER_REQUESTED = false, LOADER_HIDDEN = false;
function hideLoader() {
  if (LOADER_REQUESTED || LOADER_HIDDEN) return;
  LOADER_REQUESTED = true;
  const loader = $('loader');
  if (!loader) { LOADER_HIDDEN = true; return; }
  const wait = Math.max(0, 600 - (Date.now() - LOADER_STARTED));
  setTimeout(() => { if (LOADER_HIDDEN) return; LOADER_HIDDEN = true; loader.classList.add('isHidden'); setTimeout(() => { loader.classList.add('hidden'); }, 650); }, wait);
}
if (typeof setTimeout === 'function') setTimeout(hideLoader, 8000);
const _q = new URLSearchParams(location.search);
const RID = (_q.get('r') || 'cafe-bruma').trim();
// Carpeta del sitio: de aquí salen los enlaces de tarjeta y de NFC (funciona con cualquier dominio).
const DIR = location.href.split('#')[0].split('?')[0].replace(/[^/]*$/, '');
// El enlace de la tarjeta usa el local desde el que se abre la pantalla (la tarjeta vale en todas las sucursales de la sede).
const cardUrl = c => DIR + '?r=' + encodeURIComponent(RID || c.rid) + '&t=' + encodeURIComponent(c.token);
const newKey = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'k' + Date.now() + Math.random().toString(36).slice(2, 12);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
const plural = n => n === 1 ? '1 visita' : n + ' visitas';
const money = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);

let BUSY = 0;
function busy(d) { BUSY += d; $('busy').classList.toggle('hidden', BUSY <= 0); }
let TOAST_T = null;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(TOAST_T); TOAST_T = setTimeout(() => t.classList.add('hidden'), 4500); }

async function api(fn, args) {
  if (!window.SELLO_API || /PEGA/.test(window.SELLO_API)) throw new Error('Falta configurar la dirección del servidor en config.js.');
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 35000);
  try {
    // text/plain evita la comprobación previa (preflight) de CORS, que Apps Script no admite.
    const r = await fetch(window.SELLO_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn, args }), signal: ctl.signal });
    let j; try { j = await r.json(); } catch (e) { throw new Error('Respuesta inesperada del servidor. Revisa que la implementación permita acceso a «Cualquier persona».'); }
    if (!j.ok) throw new Error(j.error || 'Error');
    return j.data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('El servidor tardó demasiado. Inténtalo de nuevo.');
    if (e instanceof TypeError) throw new Error('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.');
    throw e;
  } finally { clearTimeout(tm); }
}
function call(method, args, ok, quiet) {
  if (!quiet) busy(1);
  api(method, args).then(d => { if (!quiet) busy(-1); if (ok) ok(d); if (method === 'publicConfig') hideLoader(); }, e => { if (!quiet) busy(-1); hideLoader(); alert(e.message || String(e)); });
}
// QR generado en el dispositivo: el enlace personal (con token) no se envía a ningún servicio externo.
function qrImg(url) {
  try {
    if (typeof qrcode === 'undefined') return '<p class="hint center">QR no disponible; usa «Copiar enlace».</p>';
    const q = qrcode(0, 'M'); q.addData(url); q.make();
    return '<img class="qr" alt="Código QR de la tarjeta" src="' + q.createDataURL(6, 2) + '">';
  } catch (e) { return '<p class="hint center">QR no disponible; usa «Copiar enlace».</p>'; }
}
function copyLink(u) { const ask = () => uiPrompt('Copia este enlace:', { value: u, ok: 'Listo', cancel: '' }); if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => toast('Enlace copiado.')).catch(ask); else ask(); }

// Color de marca por restaurante. Acepta '#rrggbb' (un color) o '#rrggbb,#rrggbb' (degradado).
// · Colores vivos u oscuros (primarios): tiñen tarjeta y fondo, oscurecidos lo necesario para que el texto claro
//   y el dorado se lean; el acento sigue dorado.
// · Colores claros (pasteles): el pastel se vuelve el acento (botones, sellos, detalles) y el fondo toma un tono
//   profundo del mismo color. Así las letras nunca quedan claras sobre claro.
function selloTheme(val) {
  const cs = String(val || '').toLowerCase().split(',');
  if (!cs[0] || cs.length > 2 || !cs.every(c => /^#[0-9a-f]{6}$/.test(c))) return null;
  const W = [255, 255, 255], K = [0, 0, 0];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const hx = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const lum = a => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(a[0]) + .7152 * f(a[1]) + .0722 * f(a[2]); };
  const toHsl = a => { const [r, g, b] = a.map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2; if (!d) return [0, 0, l]; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, d / (1 - Math.abs(2 * l - 1)), l]; };
  const hsl = (h, s, l) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, k = Math.floor(h / 60) % 6; const p = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k]; return p.map(v => (v + m) * 255); };
  const tone = c => {
    const a = rgb(c);
    if (lum(a) > .4) { const [h, s] = toHsl(a), S = s < .05 ? 0 : Math.min(.55, Math.max(.28, s * .6)); return { pastel: true, a, h, S, c0: hsl(h, S, .07), c1: hsl(h, S, .12), c2: hsl(h, S, .24) }; }
    let b = a, k = 0; while (lum(b) > .07 && k++ < 60) b = mix(b, K, .05);
    return { pastel: false, a: b, c0: mix(b, K, .3), c1: mix(b, W, .04), c2: mix(b, W, .18) };
  };
  const A = tone(cs[0]), B = cs[1] ? tone(cs[1]) : null, P = [A, B].find(t => t && t.pastel);
  const t = { c0: hx(B ? B.c1 : A.c0), c1: hx(A.c1), c2: hx(A.c2), glow: hx(A.c2), glow2: hx(B ? B.c2 : A.c2), acc: null };
  if (P) {
    let g = P.a, k = 0; while (lum(g) < .45 && k++ < 40) g = mix(g, W, .05);
    t.acc = { gold: hx(g), gold2: hx(mix(g, W, .5)), gold3: hx(mix(g, K, .16)), goldInk: hx(hsl(P.h, P.S, .13)), accRGB: g.map(Math.round).join(','), sparkRGB: mix(g, W, .4).map(Math.round).join(',') };
  }
  return t;
}
// (selloTheme se conserva para la vista previa de un Extra.html anterior que aún no se haya actualizado en Apps Script.)

// Tema claro V7 (estilo «arcilla»). Del color del negocio salen: el acento y su degradado (botones, sellos),
// la tinta que se lee ENCIMA del acento, un tono del acento que se lee sobre blanco (4.5:1), un tono profundo
// para los bloques oscuros (acceso, boleto premiado), un tinte pálido y el fondo de la página.
function brandTheme(val) {
  const cs = String(val || '').toLowerCase().split(',');
  if (!cs[0] || cs.length > 2 || !cs.every(c => /^#[0-9a-f]{6}$/.test(c))) return null;
  const W = [255, 255, 255], K = [0, 0, 0], PAPER = [250, 250, 251], BG = [236, 238, 242];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const hx = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const lum = a => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(a[0]) + .7152 * f(a[1]) + .0722 * f(a[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const toHsl = a => { const [r, g, b] = a.map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2; if (!d) return [0, 0, l]; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, d / (1 - Math.abs(2 * l - 1)), l]; };
  const hsl = (h, s, l) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, k = Math.floor(h / 60) % 6; const p = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k]; return p.map(v => (v + m) * 255); };
  const a = rgb(cs[0]), b = cs[1] ? rgb(cs[1]) : mix(a, W, .24); // un solo color: degradado suave hacia un tono más claro
  const [h, s] = toHsl(a), S = s < .05 ? 0 : s;
  const dark = hx(hsl(h, Math.min(S, .5), .13));
  // Tinta sobre el acento: blanca si se lee en los dos extremos del degradado; si no, el tono oscuro del mismo color.
  const ink = Math.min(ratio(a, W), ratio(b, W)) >= 3 ? '#ffffff' : dark;
  let txt = a, k = 0; while (ratio(txt, PAPER) < 4.6 && k++ < 80) txt = mix(txt, K, .05);
  return { acc: hx(a), acc2: hx(b), accInk: ink, accTxt: hx(txt), accRGB: a.map(Math.round).join(','),
    deep: hx(hsl(h, Math.min(S, .42), .1)), deep2: hx(hsl(h, Math.min(S, .48), .2)), tint: hx(mix(a, W, .86)), bg: hx(mix(BG, a, .07)) };
}
function applyTheme(val) {
  const t = brandTheme(val); if (!t) return;
  const r = document.documentElement.style;
  Object.keys(t).forEach(k => r.setProperty('--' + k, t[k]));
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t.bg);
}

// Iconos SVG propios (sin servicios externos). Uso: <i data-i="star"></i> + iconize(raiz), o ico('star').
const ICONS = {
  star: '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17.4l-5.7 3 1.1-6.4L2.8 9.5l6.4-.9z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9S14.4 18.4 12 21c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/>',
  share: '<path d="M12 15V3.5M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/><path d="M7.5 8a2.5 2.5 0 010-5C10.5 3 12 8 12 8s1.5-5 4.5-5a2.5 2.5 0 010 5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  camera: '<path d="M4 8a2 2 0 012-2h1.5l1.2-2h6.6l1.2 2H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 010 6.4M18.5 14.4c1.9.8 3 2.6 3 5.6"/>',
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M5 9v11h14V9"/><path d="M4 9a2.67 2.67 0 005.33 0 2.67 2.67 0 005.34 0A2.67 2.67 0 0020 9"/><path d="M10 20v-5h4v5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5C17.3 1.3 16.3 1.2 15 1.2 11.8 1.2 10 3.1 10 6.6V9H7v4h3v8z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  download: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M12 7v7M9 11.5l3 3 3-3M10.5 18.5h3"/>'
};
const ico = (n, c) => '<svg class="ico ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || '') + '</svg>';
function iconize(root) { (root || document).querySelectorAll('[data-i]').forEach(e => { e.outerHTML = ico(e.dataset.i); }); }
// Inclinación 3D con brillo que sigue al dedo o al cursor (se desactiva con «reducir movimiento»).
function tiltCard(el) {
  if (!el || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const move = e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', ((px - .5) * 16).toFixed(1) + 'deg'); el.style.setProperty('--rx', ((.5 - py) * 16).toFixed(1) + 'deg');
    el.style.setProperty('--mx', (px * 100).toFixed(0) + '%'); el.style.setProperty('--my', (py * 100).toFixed(0) + '%'); el.classList.add('tilt'); };
  const reset = () => { el.classList.remove('tilt'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); };
  el.addEventListener('pointermove', move); ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => el.addEventListener(t, reset));
}
// Onda al tocar cualquier botón (respeta «reducir movimiento»).
const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
// Parallax discreto, limitado a 20 px y apagado con movimiento reducido.
if (!REDUCED) {
  let sceneTick = false;
  addEventListener('scroll', () => {
    if (sceneTick) return;
    sceneTick = true;
    requestAnimationFrame(() => { document.documentElement.style.setProperty('--scene-y', Math.min(20, scrollY * .035) + 'px'); sceneTick = false; });
  }, { passive: true });
}
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('button'); if (!b || REDUCED) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement('span');
  s.className = 'ripple'; s.style.width = s.style.height = d + 'px';
  s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
  b.appendChild(s); setTimeout(() => s.remove(), 650);
});
// Confeti con los colores del negocio cuando el cliente tiene un premio listo.
function celebrate() {
  if (REDUCED) return;
  const cs = getComputedStyle(document.documentElement), cols = ['--acc', '--acc2', '--tint', '--deep2'].map(v => cs.getPropertyValue(v).trim()).concat('#ffffff');
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length];
    p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px'); p.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
    p.style.setProperty('--d', (2 + Math.random() * 1.8) + 's'); p.style.setProperty('--delay', (Math.random() * .5) + 's');
    if (i % 3 === 0) p.style.borderRadius = '50%';
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 4500);
}

/* ── Ventanas propias: sustituyen alert/confirm/prompt del navegador y devuelven promesas ── */
function uiDialog(o) {
  return new Promise(done => {
    const d = document.createElement('dialog'); d.className = 'uiDialog';
    const field = o.input ? `<input class="uiInput" type="${o.secret ? 'password' : 'text'}"${o.numeric ? ' inputmode="numeric"' : ''} autocomplete="off" aria-label="${esc(o.msg)}">` : '';
    // «Aceptar» va primero en el documento para que Enter lo active; el CSS lo muestra a la derecha.
    d.innerHTML = `<form method="dialog"><p class="uiMsg"></p>${field}<div class="uiBtns"><button value="ok" class="primary">${esc(o.ok || 'Aceptar')}</button>${o.cancel ? `<button value="no" class="secondary" formnovalidate>${esc(o.cancel)}</button>` : ''}</div></form>`;
    d.querySelector('.uiMsg').textContent = o.msg;
    const inp = d.querySelector('.uiInput'); if (inp && o.value != null) inp.value = o.value;
    d.addEventListener('close', () => { const yes = d.returnValue === 'ok'; done(o.input ? (yes ? inp.value : null) : yes); d.remove(); });
    document.body.appendChild(d); d.showModal();
    if (inp) { inp.focus(); inp.select(); }
  });
}
const uiAlert = msg => uiDialog({ msg: String(msg) });
const uiConfirm = (msg, ok) => uiDialog({ msg, ok: ok || 'Continuar', cancel: 'Cancelar' });
const uiPrompt = (msg, o) => uiDialog(Object.assign({ msg, input: true, ok: 'Aceptar', cancel: 'Cancelar' }, o || {}));
window.alert = msg => { uiAlert(msg); }; // los avisos existentes usan la ventana propia (no necesitan respuesta)

/* ── Logo del negocio: arriba de la pantalla (y en la tarjeta) en lugar del cuadro de color ── */
const validLogo = u => /^https:\/\/[^\s"'<>()]+$/i.test(String(u || ''));
function setLogo(url) {
  const old = $('logo'); if (old) old.remove();
  document.documentElement.classList.remove('hasLogo');
  if (!validLogo(url)) return;
  const img = new Image(); img.id = 'logo'; img.alt = ''; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
  img.onload = () => document.documentElement.classList.add('hasLogo');
  img.onerror = () => { img.remove(); document.documentElement.classList.remove('hasLogo'); };
  img.src = url; $('brand').parentNode.insertBefore(img, $('brand'));
}

/* ── Instalar como app (pantalla de inicio) ── */
let INSTALL_EVT = null;
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const canInstall = () => !isStandalone() && (!!INSTALL_EVT || isIOS());
addEventListener('beforeinstallprompt', e => { e.preventDefault(); INSTALL_EVT = e; document.dispatchEvent(new Event('installready')); });
async function installApp() {
  if (INSTALL_EVT) { INSTALL_EVT.prompt(); try { await INSTALL_EVT.userChoice; } catch (e) {} INSTALL_EVT = null; document.dispatchEvent(new Event('installready')); return; }
  uiAlert('En iPhone: toca el botón Compartir (el cuadro con la flecha) y elige «Agregar a inicio».');
}
