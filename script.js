// Menú móvil
const btn = document.querySelector('.menu-btn');
const list = document.querySelector('.nav ul');
if (btn && list) {
  btn.addEventListener('click', () => list.classList.toggle('open'));
  list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => list.classList.remove('open')));
}

// Banner de cookies (consentimiento guardado en el navegador)
(function () {
  const KEY = 'akiko_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) banner.classList.add('show');

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    banner.classList.remove('show');
    // Aquí podrías cargar analítica (ej. Google Analytics) SOLO si value === 'all'
  }
  document.getElementById('cookie-accept').addEventListener('click', () => save('all'));
  document.getElementById('cookie-reject').addEventListener('click', () => save('essential'));
})();
