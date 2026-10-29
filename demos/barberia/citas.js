/* Demo local de citas. En producción estos datos se guardarán en Cloudflare D1. */
(() => {
  const ZONE = 'America/Mexico_City';
  const KEY = 'elfilo-citas-v1';
  const BARBERS = ['Mateo Ruiz', 'Diego Salas', 'Julián Mora'];
  const SERVICES = [
    { id: 'corte', name: 'Corte clásico', price: 180, min: 40 },
    { id: 'fade', name: 'Fade / Degradado', price: 200, min: 45 },
    { id: 'barba', name: 'Barba con toalla caliente', price: 150, min: 30 },
    { id: 'combo', name: 'Corte + barba', price: 300, min: 60 },
    { id: 'nino', name: 'Corte niño', price: 150, min: 30 },
    { id: 'diseno', name: 'Diseño / Freestyle', price: 250, min: 50 }
  ];
  let memory = { citas: [], bloqueos: [] };

  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return memory;
      const value = JSON.parse(raw);
      if (Array.isArray(value)) return { citas: value, bloqueos: [] };
      return { citas: Array.isArray(value.citas) ? value.citas : [], bloqueos: Array.isArray(value.bloqueos) ? value.bloqueos : [] };
    } catch (_) { return memory; }
  };
  const write = (data) => {
    memory = data;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) { /* El demo sigue funcionando en memoria. */ }
  };
  const parts = (date = new Date()) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23'
  }).formatToParts(date).filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  const today = () => { const p = parts(); return `${p.year}-${p.month}-${p.day}`; };
  const addDays = (date, amount) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + amount); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; };
  const weekday = date => new Date(`${date}T12:00:00Z`).getUTCDay();
  const duration = service => Math.ceil((typeof service === 'object' ? service.min : SERVICES.find(x => x.id === service)?.min || 40) / 20) * 20;
  const mins = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const time = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const allFree = (date, service, barber, data) => {
    const day = weekday(date), close = day === 0 ? 15 * 60 : 20 * 60;
    if (day === 0 || day === 6 || (day >= 1 && day <= 5)) {
      const needed = duration(service), now = parts(), localToday = `${now.year}-${now.month}-${now.day}`;
      let first = 10 * 60;
      if (date === localToday) first = Math.max(first, Math.ceil((Number(now.hour) * 60 + Number(now.minute) + Number(now.second) / 60 + 20) / 20) * 20);
      const candidates = BARBERS.filter(x => barber === 'Cualquiera' || !barber || x === barber);
      const result = [];
      for (let start = first; start + needed <= close; start += 20) {
        const end = start + needed;
        const chosen = candidates.find(person => {
          const conflict = data.citas.some(c => c.fecha === date && c.barbero === person && c.estado !== 'cancelada' && start < mins(c.hora) + duration(c.servicio) && end > mins(c.hora));
          const blocked = data.bloqueos.some(b => b.fecha === date && b.barbero === person && start < mins(b.hasta) && end > mins(b.desde));
          return !conflict && !blocked;
        });
        if (chosen) result.push({ hora: time(start), barbero: chosen });
      }
      return result;
    }
    return [];
  };
  const serviceById = value => SERVICES.find(x => x.id === value) || SERVICES[0];
  const api = {
    zone: ZONE, services: SERVICES, barbers: BARBERS, today,
    dateLabel(date, options = {}) {
      const d = new Date(`${date}T12:00:00Z`);
      return new Intl.DateTimeFormat('es-MX', { timeZone: ZONE, weekday: options.short ? 'short' : 'long', day: 'numeric', month: options.month ? 'short' : undefined }).format(d);
    },
    slotsFor(date, service, barber = 'Cualquiera') { return allFree(date, service, barber, read()); },
    book(cita) {
      const data = read(), svc = serviceById(cita.servicio), free = allFree(cita.fecha, svc.id, cita.barbero, data);
      const slot = free.find(x => x.hora === cita.hora && (cita.barbero === 'Cualquiera' || x.barbero === cita.barbero));
      if (!slot) throw new Error('Ese horario acaba de ocuparse. Elige otra hora.');
      const saved = { ...cita, id: cita.id || id(), servicio: svc.id, barbero: slot.barbero, estado: 'pendiente', creada: new Date().toISOString() };
      data.citas.push(saved); write(data); return saved;
    },
    list(date) { const data = read(); return [...data.citas.filter(x => x.fecha === date), ...data.bloqueos.filter(x => x.fecha === date).map(x => ({ ...x, tipo: 'bloqueo' }))].sort((a, b) => (a.hora || a.desde).localeCompare(b.hora || b.desde)); },
    setStatus(idValue, estado) { const data = read(), cita = data.citas.find(x => x.id === idValue); if (!cita) return null; cita.estado = estado; write(data); return cita; },
    block(barbero, fecha, desde, hasta) { const data = read(); if (mins(hasta) <= mins(desde)) throw new Error('La hora final debe ser posterior a la inicial.'); if (data.citas.some(c => c.fecha === fecha && c.barbero === barbero && c.estado !== 'cancelada' && mins(desde) < mins(c.hora) + duration(c.servicio) && mins(hasta) > mins(c.hora))) throw new Error('El bloqueo se cruza con una cita existente.'); const bloque = { id: id(), barbero, fecha, desde, hasta, tipo: 'bloqueo' }; data.bloqueos.push(bloque); write(data); return bloque; },
    seedIfEmpty(force = false) {
      const data = read(); if (!force && (data.citas.length || data.bloqueos.length)) return;
      const names = ['Luis Hernández', 'Carlos García', 'Andrés López', 'Miguel Torres', 'Jorge Ramírez', 'Sergio Flores', 'Daniel Cruz', 'Emilio Reyes', 'Fernando Díaz', 'Raúl Castillo', 'Iván Morales'];
      const examples = [];
      const add = (date, barber, service, hora, n) => examples.push({ id: `demo-${date}-${barber}-${hora}`, servicio: service, barbero: barber, fecha: date, hora, nombre: names[n % names.length], tel: `55000000${String(n + 11).padStart(2, '0')}`, estado: n < 3 ? 'llego' : 'pendiente', creada: new Date().toISOString() });
      const barbers = BARBERS;
      [['10:00','11:20','13:00','15:00','17:00','18:20','19:00'], ['10:40','12:00','14:00']].forEach((times, day) => times.forEach((hora, i) => add(addDays(today(), day), barbers[(i + day) % 3], ['corte','fade','barba','combo','nino','diseno'][i % 6], hora, i + day * 7)));
      write({ citas: examples, bloqueos: [] });
    },
    resetDemo() { write({ citas: [], bloqueos: [] }); this.seedIfEmpty(true); },
    exportData() { return read(); }
  };
  window.CitasDemo = api;
})();
