const HOJA_RESPUESTAS = 'Respuestas';
const CABECERAS = ['Fecha', 'Evento', 'Nombre', 'Asiste', 'Personas', 'Mensaje', 'Pase'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const event = clean(p.evento, 100), name = clean(p.nombre, 100), attendance = clean(p.asiste, 2), pass = clean(p.pase, 100);
  const passes = JSON.parse(PropertiesService.getScriptProperties().getProperty('PASES_JSON') || '{}');
  const hasPass = Object.prototype.hasOwnProperty.call(passes, pass);
  const maxGuests = hasPass ? Math.max(1, Math.min(20, Number(passes[pass].lugares) || 1)) : (Object.keys(passes).length ? 1 : 20);
  const guests = attendance === 'no' ? 0 : parseInt(p.personas, 10);
  if (!event || !name || !['si', 'no'].includes(attendance) || (pass && !hasPass) || !Number.isInteger(guests) || guests < 0 || guests > maxGuests || (attendance === 'si' && guests < 1)) return json({ ok: false, error: 'Datos incompletos o fuera de los límites del pase' });
  const row = [new Date(), event, name, attendance, guests, clean(p.mensaje, 500), pass];
  const sheet = getSheet_();
  sheet.appendRow(row);
  return json({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion !== 'resumen') return json({ ok: true, mensaje: 'Servicio de confirmaciones Akiko' });
  const expected = PropertiesService.getScriptProperties().getProperty('CLAVE_PANEL');
  if (!expected || !constantTimeEqual_(clean(p.clave, 200), expected)) return json({ error: 'No autorizado' });
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).filter(r => r[2]).map(r => ({ fecha: r[0] instanceof Date ? r[0].toISOString() : '', evento: clean(r[1], 100), nombre: clean(r[2], 100), asiste: clean(r[3], 2), personas: Number(r[4]) || 0, mensaje: clean(r[5], 500), pase: clean(r[6], 100) }));
  const paseKeys = Object.keys(JSON.parse(PropertiesService.getScriptProperties().getProperty('PASES_JSON') || '{}'));
  const answered = new Set(rows.map(r => r.pase).filter(Boolean));
  const confirmados = rows.filter(r => r.asiste === 'si').length, noAsisten = rows.filter(r => r.asiste === 'no').length;
  return json({ totales: { pases: paseKeys.length, confirmados, noAsisten, pendientes: Math.max(0, paseKeys.length - answered.size) }, respuestas: rows, pases: JSON.parse(PropertiesService.getScriptProperties().getProperty('PASES_JSON') || '{}') });
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Configura SPREADSHEET_ID en Propiedades del script.');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(HOJA_RESPUESTAS);
  if (!sheet) sheet = ss.insertSheet(HOJA_RESPUESTAS);
  if (sheet.getLastRow() === 0) sheet.appendRow(CABECERAS);
  return sheet;
}
function clean(value, max) { return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max); }
function constantTimeEqual_(a, b) { if (a.length !== b.length) return false; let n = 0; for (let i = 0; i < a.length; i++) n |= a.charCodeAt(i) ^ b.charCodeAt(i); return n === 0; }
function json(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
