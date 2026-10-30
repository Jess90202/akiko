(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const data = window.INVITACION || {};

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  }

  function safeUrl(value) {
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
    } catch {
      return '#';
    }
  }

  function escapeCalendarText(value) {
    return String(value || '').replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  }

  function init() {
    document.body.classList.add('is-closed');

    if (!data.evento) {
      setText('eventTitle', 'Invitación');
      setupEnvelope();
      return;
    }

    Object.entries(data.tema || {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    const date = new Date(data.fechaISO || '');
    const validDate = !Number.isNaN(date.valueOf());
    setText('eventTitle', data.titulo);
    setText('eventNamesEnvelope', data.nombres);
    setText('eventCity', data.ciudad);
    setText('eventCity2', data.ciudad);
    setText('eventDate', data.fechaTexto);
    setText('eventYear', validDate ? date.getFullYear() : '');
    setText('dateDay', validDate ? new Intl.DateTimeFormat('es-MX', { day: '2-digit', timeZone: 'UTC' }).format(date) : '');
    setText('dateMonth', validDate ? new Intl.DateTimeFormat('es-MX', { month: 'long', timeZone: 'UTC' }).format(date) : '');
    setText('eventTime', data.hora);
    setText('eventNames', data.nombres);
    setText('eventNamesFooter', data.nombres);
    setText('eventQuote', data.frase);
    setText('eventEyebrow', data.tipo);
    setText('eventHeadline', data.titulo);
    setText('closingLine', data.cierre);
    setText('eventHashtag', data.hashtag);
    setText('eventNotes', data.notas);
    setText('dressType', data.vestimenta?.tipo);
    setText('dressWomen', data.vestimenta?.mujeres);
    setText('dressMen', data.vestimenta?.hombres);
    setText('giftNote', data.regalos?.nota);
    setText('eventLocationLabel', data.lugares?.length > 1 ? 'Ubicaciones' : 'Lugar');
    document.title = `${data.titulo || 'Invitación'} | Invitación Akiko`;

    if (data.portada) {
      const image = $('#coverPhoto');
      image.src = safeUrl(data.portada);
      image.alt = data.portadaAlt || 'Imagen de portada del evento';
      $('.cover')?.classList.add('has-photo');
      document.documentElement.style.setProperty('--cover-image', `url("${data.portada.replace(/"/g, '')}")`);
    }

    renderLocations();
    renderItinerary();
    renderDressColors();
    renderGallery();
    renderGiftLinks();
    hideEmptySections();
    setupBankDetails();
    setupRsvp(data.rsvp || {});
    buildCalendar(date, validDate);
    setupMotion();
    setupEnvelope();
    setupMusic();
  }

  function renderLocations() {
    const container = $('#locations');
    if (!container) return;

    (data.lugares || []).forEach((place) => {
      const article = document.createElement('article');
      article.className = 'location';
      const heading = document.createElement('h3');
      heading.textContent = place.nombre || 'Lugar';
      const address = document.createElement('p');
      address.textContent = [place.hora, place.direccion].filter(Boolean).join(' · ');
      const actions = document.createElement('div');
      actions.className = 'actions';
      const query = encodeURIComponent([place.nombre, place.direccion, data.ciudad].filter(Boolean).join(', '));

      [
        ['Ver mapa', `https://www.google.com/maps/search/?api=1&query=${query}`],
        ['Cómo llegar en Waze', `https://waze.com/ul?q=${query}&navigate=yes`]
      ].forEach(([label, url]) => {
        const link = document.createElement('a');
        link.className = 'button';
        link.textContent = label;
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        actions.append(link);
      });

      article.append(heading, address, actions);
      container.append(article);
    });
  }

  function renderItinerary() {
    const list = $('#itinerary');
    if (!list) return;

    (data.itinerario || []).forEach((item) => {
      const entry = document.createElement('li');
      const time = document.createElement('time');
      const title = document.createElement('strong');
      const note = document.createElement('div');
      time.textContent = item.hora || '';
      title.textContent = item.titulo || '';
      note.textContent = item.detalle || '';
      entry.append(time, title, note);
      list.append(entry);
    });
  }

  function renderDressColors() {
    const container = $('#dressColors');
    if (!container) return;

    (data.vestimenta?.coloresReservados || []).forEach((color) => {
      const swatch = document.createElement('i');
      swatch.style.backgroundColor = color;
      swatch.title = 'Color reservado';
      swatch.setAttribute('aria-label', 'Color reservado');
      container.append(swatch);
    });
  }

  function renderGallery() {
    const gallery = $('#gallery');
    if (!gallery) return;

    if (data.galeria?.length) {
      data.galeria.forEach((source, index) => {
        const image = document.createElement('img');
        image.src = safeUrl(source);
        image.alt = `Fotografía ${index + 1} del evento`;
        image.loading = 'lazy';
        gallery.append(image);
      });
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'gallery-placeholder';
      placeholder.textContent = 'Aquí irán sus fotografías';
      gallery.append(placeholder);
    }
  }

  function renderGiftLinks() {
    const links = $('#giftLinks');
    if (!links) return;

    (data.regalos?.enlaces || []).forEach((gift) => {
      const link = document.createElement('a');
      link.className = 'button';
      link.href = safeUrl(gift.url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = gift.nombre || 'Mesa de regalos';
      links.append(link);
    });
  }

  function hideEmptySections() {
    const rules = [
      ['#locations', Boolean(data.lugares?.length)],
      ['#itinerary', Boolean(data.itinerario?.length)],
      ['#dressType', Boolean(data.vestimenta?.tipo)],
      ['#giftNote', Boolean(data.regalos?.nota || data.regalos?.enlaces?.length || data.regalos?.datos)],
      ['#eventNotes', Boolean(data.notas)]
    ];

    rules.forEach(([selector, hasContent]) => {
      if (!hasContent) $(selector)?.closest('.section')?.setAttribute('hidden', '');
    });
  }

  function setupBankDetails() {
    const account = $('#bankData');
    const showButton = $('#showBank');
    if (!data.regalos?.datos || !account || !showButton) return;

    setText('bankAccount', data.regalos.datos);
    showButton.hidden = false;
    showButton.addEventListener('click', () => {
      account.hidden = false;
      showButton.setAttribute('aria-expanded', 'true');
    });
    $('#copyBank')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.regalos.datos);
        $('#copyBank').textContent = 'Copiado';
      } catch {
        $('#copyBank').textContent = 'Selecciona y copia los datos';
      }
    });
  }

  function setupRsvp(rsvp) {
    const passCode = new URLSearchParams(location.search).get('pase');
    const pass = passCode && rsvp.pases ? rsvp.pases[passCode] : null;
    const maximum = pass ? Number(pass.lugares) : (rsvp.nivel === 'pases' ? 1 : 20);
    const name = $('#guestName');
    const people = $('#guestCount');
    const passField = $('#passCode');

    if (pass) {
      setText('passGreeting', `${pass.nombre}, hemos reservado ${maximum} ${maximum === 1 ? 'lugar' : 'lugares'} para ustedes.`);
      $('#passGreeting').hidden = false;
  
      name.value = pass.nombre;
      name.readOnly = true;
      passField.value = passCode;
    } else {
      $('#passGreeting').hidden = true;
    }

    people.max = String(maximum);
    people.value = '1';
    const limit = $('#guestLimit');
    const label = document.createElement('p');
    label.className = 'eyebrow';
    label.textContent = pass
      ? `Pase para ${maximum} ${maximum === 1 ? 'persona' : 'personas'}`
      : (rsvp.nivel === 'pases' ? 'Confirmación individual' : 'Indica cuántas personas asistirán');
    limit.append(label);

    if (rsvp.nivel === 'whatsapp') {
      setText('rsvpIntro', 'Tu respuesta abrirá WhatsApp para enviarla a los anfitriones.');
    } else if (!rsvp.urlScript) {
      setText('demoNotice', 'Modo demostración: el formulario simulará el envío y no guardará respuestas.');
    }
    setupRsvpForm(rsvp, maximum, pass);
  }

  function setupRsvpForm(rsvp, maximum, pass) {
    const form = $('#rsvpForm');
    const status = $('#rsvpStatus');
    const key = `akiko-rsvp-${rsvp.eventId || location.pathname}${pass ? `-${new URLSearchParams(location.search).get('pase')}` : ''}`;
    let alreadyResponded = false;
    try {
      alreadyResponded = localStorage.getItem(key) === '1';
    } catch {
      alreadyResponded = false;
    }
    if (alreadyResponded) {
      form.hidden = true;
      status.textContent = 'Ya recibimos una respuesta desde este dispositivo. ¡Gracias!';
      return;
    }

    $('#attendance').addEventListener('change', (event) => {
      const count = $('#guestCount');
      count.disabled = event.target.value === 'no';
      if (count.disabled) count.value = '0';
      else if (count.value === '0') count.value = '1';
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = $('#submitRsvp');
      button.disabled = true;
      const payload = {
        nombre: $('#guestName').value.trim().slice(0, 100),
        asiste: $('#attendance').value,
        personas: $('#attendance').value === 'no' ? 0 : Math.min(maximum, Math.max(1, Number($('#guestCount').value) || 1)),
        mensaje: $('#guestMessage').value.trim().slice(0, 500),
        pase: $('#passCode').value.slice(0, 100)
      };
      if (!payload.nombre || !payload.asiste) {
        button.disabled = false;
        status.textContent = 'Completa tu nombre y respuesta.';
        return;
      }

      if (rsvp.nivel === 'whatsapp') {
        const attendance = payload.asiste === 'si' ? 'Sí asistiré' : 'No podré asistir';
        const count = payload.asiste === 'si' ? ` con ${payload.personas} persona(s)` : '';
        const message = `Hola, soy ${payload.nombre}. ${attendance}${count}.${payload.mensaje ? ` ${payload.mensaje}` : ''}`;
        const phone = String(rsvp.whatsapp || '').replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        status.textContent = 'Se abrió WhatsApp con tu respuesta.';
        button.disabled = false;
        return;
      }
      if (!rsvp.urlScript) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        markDone();
        status.textContent = '¡Gracias! Tu respuesta quedó registrada en modo demostración.';
        return;
      }
      try {
        await fetch(rsvp.urlScript, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ ...payload, evento: data.evento })
        });
        markDone();
        status.textContent = '¡Gracias! Recibimos tu respuesta.';
      } catch {
        status.textContent = 'No pudimos enviar tu respuesta. Puedes avisar por WhatsApp.';
        const link = document.createElement('a');
        const phone = String(rsvp.whatsapp || '').replace(/\D/g, '');
        link.href = `https://wa.me/${phone}?text=${encodeURIComponent(`${payload.nombre} — ${payload.asiste === 'si' ? 'Sí asistiré' : 'No podré asistir'}`)}`;
        link.textContent = ' Abrir WhatsApp';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        status.append(link);
        button.disabled = false;
      }
      function markDone() {
        try {
          localStorage.setItem(key, '1');
        } catch {
          // La respuesta sigue visible aunque el navegador bloquee el almacenamiento local.
        }
        form.hidden = true;
      }
    });
  }

  function buildCalendar(date, validDate) {
    const button = $('#calendarButton');
    if (!button) return;
    if (!validDate) {
      button.hidden = true;
      return;
    }
    button.addEventListener('click', () => {
      const end = new Date(date.getTime() + 3 * 60 * 60 * 1000);
      const format = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Akiko Tech//Invitacion//ES', 'BEGIN:VEVENT',
        `UID:${Date.now()}@akiko-tech.com`, `DTSTAMP:${format(new Date())}`, `DTSTART:${format(date)}`,
        `DTEND:${format(end)}`, `SUMMARY:${escapeCalendarText(data.titulo)}`,
        `LOCATION:${escapeCalendarText((data.lugares || []).map((place) => `${place.nombre} ${place.direccion}`).join(', '))}`,
        `DESCRIPTION:${escapeCalendarText(data.frase)}`, 'END:VEVENT', 'END:VCALENDAR'
      ];
      const file = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invitacion.ics';
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  function setupMotion() {
    const elements = $$('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    const cover = $('.cover');
    window.addEventListener('scroll', () => {
      if (innerWidth > 700 && cover) {
        cover.style.backgroundPosition = `center ${Math.min(70, 50 + scrollY * 0.015)}%`;
      }
    }, { passive: true });
  }

  function setupEnvelope() {
    const screen = $('#envelopeScreen');
    const envelope = $('.envelope');
    const seal = $('#openInvite');
    if (!screen || !envelope || !seal) return;
    seal.addEventListener('click', () => {
      if (seal.disabled) return;
      seal.disabled = true;
      seal.setAttribute('aria-label', 'Abriendo invitación');
      envelope.classList.add('open');
      playMusicOnOpen();
      const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
      window.setTimeout(() => {
        screen.hidden = true;
        document.body.classList.remove('is-closed');
        document.body.classList.add('is-open');
      }, delay);
    });
    seal.focus({ preventScroll: true });
  }

  function setupMusic() {
    const audio = $('#music');
    const button = $('#musicToggle');
    if (!audio || !button) return;
    if (data.musica) audio.src = safeUrl(data.musica);
    button.hidden = !data.musica;
    button.addEventListener('click', () => toggleMusic(audio, button));
  }

  function playMusicOnOpen() {
    if (!data.musica) return;
    const audio = $('#music');
    const button = $('#musicToggle');
    audio.play().then(() => {
      button.textContent = 'Ⅱ';
    }).catch(() => {
      button.textContent = '▶';
    });
  }

  function toggleMusic(audio, button) {
    if (audio.paused) {
      audio.play().then(() => {
        button.textContent = 'Ⅱ';
      }).catch(() => {
        button.textContent = '▶';
      });
    } else {
      audio.pause();
      button.textContent = '▶';
    }
  }

  function startCountdown() {
    const element = $('#countdown');
    const target = new Date(data.fechaISO || '');
    if (!element || Number.isNaN(target.valueOf())) {
      if (element) element.hidden = true;
      return;
    }
    const tick = () => {
      const milliseconds = Math.max(0, target - Date.now());
      const values = [
        Math.floor(milliseconds / 864e5), Math.floor(milliseconds / 36e5) % 24,
        Math.floor(milliseconds / 6e4) % 60, Math.floor(milliseconds / 1e3) % 60
      ];
      ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => setText(id, values[index]));
      if (milliseconds === 0) setText('countdownMessage', '¡Hoy es el gran día!');
    };
    tick();
    window.setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    startCountdown();
  });
})();
