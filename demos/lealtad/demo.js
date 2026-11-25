/* Demo público: reemplaza el servidor de Apps Script por datos de ejemplo guardados en este navegador. */
const DEMO_KEY = 'akiko-lealtad-demo-v2';
const DEMO_PIN = '123456';
const COOLDOWN_MS = 2 * 60 * 1000;

const hex32 = () => Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const nowLabel = () => new Date().toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function demoSeed() {
  const clients = [['Ana Ruiz', '5500112233', 5], ['Toño Méndez', '5500223344', 6], ['Lucía Pardo', '5500334455', 2], ['Memo Salas', '5500445566', 4], ['Vale Cruz', '5500556677', 1], ['Óscar Díaz', '5500667788', 3]]
    .map(([name, phone, points], i) => ({ id: 'C' + (i + 1), token: hex32(), name, phone, points: Math.min(points, 6), prizeAvailable: points >= 6, last: 0 }));
  return {
    cfg: { name: 'Café Bruma', goal: 6, prize: 'una bebida de la casa gratis', minPurchase: 0 },
    clients, visits: 18, redemptions: 3,
    recent: [{ type: 'VISITA', detail: 'Ana Ruiz · 5 de 6', date: 'hoy' }, { type: 'CANJE', detail: 'Toño Méndez canjeó una bebida', date: 'ayer' }],
    employees: [{ id: 'E1', name: 'Dueño (demo)', role: 'ADMIN' }]
  };
}

let DB;
try { DB = JSON.parse(localStorage.getItem(DEMO_KEY)); } catch (e) { DB = null; }
if (!DB || !Array.isArray(DB.clients)) DB = demoSeed();
const demoSave = () => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(DB)); } catch (e) {} };

function publicCfg() {
  return { ...DB.cfg, google: 'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20Coyoac%C3%A1n', web: '../cafeteria/', instagram: '', facebook: '', tiktok: '', color: '', noticeVersion: 'demo' };
}
function cardOf(c) {
  return { id: c.id, token: c.token, rid: RID, name: c.name, phone: c.phone, points: c.points, goal: DB.cfg.goal, prize: DB.cfg.prize, prizeAvailable: c.prizeAvailable, restaurant: DB.cfg.name, since: c.since || '' };
}
function find(id) {
  const c = DB.clients.find(x => x.id === id);
  if (!c) throw new Error('Cliente no encontrado.');
  return c;
}
function log(type, detail) { DB.recent.unshift({ type, detail, date: nowLabel() }); DB.recent = DB.recent.slice(0, 8); }
function addVisit(c) {
  if (c.prizeAvailable) throw new Error(c.name + ' tiene un premio disponible: canjéalo primero.');
  if (Date.now() - c.last < COOLDOWN_MS) throw new Error('Ya se registró una visita de ' + c.name + ' hace menos de 2 minutos.');
  c.points += 1;
  c.last = Date.now();
  c.prizeAvailable = c.points >= DB.cfg.goal;
  DB.visits += 1;
  log('VISITA', c.name + ' · ' + c.points + ' de ' + DB.cfg.goal);
}

const DEMO_API = {
  publicConfig: () => publicCfg(),
  registerClient: (rid, d) => {
    const name = String(d.name || '').trim(), phone = String(d.phone || '').replace(/\D/g, '');
    if (name.length < 2) throw new Error('Escribe tu nombre.');
    if (phone.length < 10) throw new Error('Escribe un teléfono de 10 dígitos.');
    if (DB.clients.some(c => c.phone === phone)) throw new Error('Ese teléfono ya tiene tarjeta. Usa «Ya tengo una tarjeta».');
    const c = { id: 'C' + Date.now(), token: hex32(), name, phone, points: 0, prizeAvailable: false, last: 0, mine: true, since: new Date().toLocaleDateString('en-CA') };
    DB.clients.unshift(c);
    return cardOf(c);
  },
  getClientByToken: (rid, t) => { const c = DB.clients.find(x => x.token === t); return c ? cardOf(c) : null; },
  recoverCard: (rid, phone, name) => {
    const c = DB.clients.find(x => x.phone === String(phone).replace(/\D/g, '') && norm(x.name).startsWith(norm(name).split(' ')[0]));
    if (!c) throw new Error('No encontramos una tarjeta con ese celular y nombre.');
    return cardOf(c);
  },
  deleteMyCard: (rid, t) => { DB.clients = DB.clients.filter(c => c.token !== t); log('BAJA', 'Un cliente borró su tarjeta'); return true; },
  employeeLogin: (rid, name, pin) => {
    if (pin !== DEMO_PIN) throw new Error('PIN incorrecto. En el demo el PIN es ' + DEMO_PIN + '.');
    return { token: 'demo', role: 'ADMIN', ext: false, name: String(name || '').trim() || 'Demo' };
  },
  employeeLogout: () => true,
  dashboard: () => ({ restaurant: publicCfg(), branches: false, rulesFromHq: false, shared: false, clients: DB.clients.length, visits: DB.visits, redemptions: DB.redemptions, revenue: 0, recent: DB.recent }),
  findClients: (rid, t, q) => {
    const n = norm(q), d = String(q).replace(/\D/g, '');
    return DB.clients.filter(c => norm(c.name).includes(n) || (d && c.phone.includes(d)) || norm(c.id) === n)
      .map(c => ({ id: c.id, name: c.name + (c.mine ? ' (tú)' : ''), phone: c.phone, points: c.points, goal: DB.cfg.goal, prizeAvailable: c.prizeAvailable }));
  },
  registerVisit: (rid, t, id) => { addVisit(find(id)); return true; },
  redeem: (rid, t, id) => {
    const c = find(id);
    if (!c.prizeAvailable) throw new Error(c.name + ' todavía no tiene premio.');
    c.points = 0; c.prizeAvailable = false; DB.redemptions += 1;
    log('CANJE', c.name + ' canjeó ' + DB.cfg.prize);
    return true;
  },
  getClientCard: (rid, t, id) => cardOf(find(id)),
  forgetClient: (rid, t, id) => { DB.clients = DB.clients.filter(c => c.id !== id); log('BAJA', 'Datos de un cliente eliminados'); return true; },
  saveSettings: (rid, t, s) => {
    const goal = Math.round(Number(s.goal)), prize = String(s.prize || '').trim();
    if (!(goal >= 1 && goal <= 30)) throw new Error('En el demo la meta va de 1 a 30 visitas.');
    if (!prize) throw new Error('Escribe el premio.');
    DB.cfg = { ...DB.cfg, goal, prize, minPurchase: Math.max(0, Number(s.minPurchase) || 0) };
    let adjusted = 0;
    DB.clients.forEach(c => { const won = c.points >= goal; if (won !== c.prizeAvailable && won) adjusted++; c.prizeAvailable = c.prizeAvailable || won; c.points = Math.min(c.points, goal); });
    return { adjusted };
  },
  listEmployees: () => DB.employees.map((e, i) => ({ ...e, self: i === 0, locked: false })),
  addEmployee: (rid, t, name, pin, role) => {
    if (!String(name).trim()) throw new Error('Escribe el nombre.');
    if (!/^\d{6,8}$/.test(pin)) throw new Error('El PIN debe tener de 6 a 8 dígitos.');
    DB.employees.push({ id: 'E' + Date.now(), name: String(name).trim(), role });
    return true;
  },
  deactivateEmployee: (rid, t, id) => { DB.employees = DB.employees.filter(e => e.id !== id); return true; },
  resetEmployeePin: () => true,
  unlockEmployee: () => true,
  changeMyPin: () => 'En el demo el PIN siempre es ' + DEMO_PIN + '.'
};

api = async (fn, args) => {
  const handler = DEMO_API[fn];
  if (!handler) throw new Error('Esta opción no está disponible en el demo.');
  await new Promise(r => setTimeout(r, 150));
  const out = handler(...args);
  demoSave();
  return out;
};

function resetDemo() {
  try { localStorage.removeItem(DEMO_KEY); Object.keys(localStorage).filter(k => /^(card_|cfg_|akiko_last)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  location.reload();
}
