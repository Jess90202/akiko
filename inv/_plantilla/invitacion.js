(function () {
  'use strict';

  // Marca que la plantilla cargó; el respaldo del index.html deja de actuar.
  window.AKIKO_INVITACION = true;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const data = window.INVITACION || {};
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Iconos de línea (texto fijo de la plantilla, nunca datos del usuario).
  const SVG = (body, width = 1.2) => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const ICONS = {
    iglesia: SVG('<path d="M24 4v8m-3-5h6M14 22l10-10 10 10M16 20v24h16V20M8 44h32M10 30l6-5m22 5-6-5M10 30v14m28-14v14"/><path d="M21 44v-8a3 3 0 0 1 6 0v8M24 24v4"/>'),
    copas: SVG('<path d="M12 6h10l-1 11a4 4 0 0 1-8 0L12 6Zm14 0h10l-1 11a4 4 0 0 1-8 0L26 6ZM17 21v17m14-17v17M12 42l5-4 5 4m4 0 5-4 5 4M12.5 12h9m5 0h9"/>'),
    anillos: SVG('<circle cx="18" cy="29" r="11"/><circle cx="30" cy="29" r="11"/><path d="m14 10 4-5 4 5-4 4Z"/>'),
    cena: SVG('<circle cx="24" cy="26" r="12"/><circle cx="24" cy="26" r="7"/><path d="M6 10v8a3 3 0 0 0 3 3v19M9 10v8m3-8v8a3 3 0 0 1-3 3M42 10c-3 2-4 7-4 12h4v18"/>'),
    baile: SVG('<path d="M18 36V10l20-4v26"/><circle cx="13" cy="36" r="5"/><circle cx="33" cy="32" r="5"/><path d="M18 16l20-4"/>'),
    pastel: SVG('<path d="M8 42h32M10 42V28h28v14M12 28v-6h24v6M10 34c4 3 7 3 10 0s7-3 10 0 7 3 8 1M18 22v-6m6 6v-6m6 6v-6"/><path d="M18 12c-1-2 0-4 0-5 1 1 2 3 0 5Zm6 0c-1-2 0-4 0-5 1 1 2 3 0 5Zm6 0c-1-2 0-4 0-5 1 1 2 3 0 5Z"/>'),
    luna: SVG('<path d="M34 34A15 15 0 0 1 20 9a15 15 0 1 0 19 19 15 15 0 0 1-5 6Z"/><path d="m36 10 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>'),
    fiesta: SVG('<path d="M8 42 18 14l16 16L8 42Zm6-17 9 9m-12-1 5 5M24 8v4m10-2-3 3m9 5h-4m-9-7c3-2 5 0 3 3m8 2c2 3 5 2 5-1"/>'),
    pin: SVG('<path d="M24 44s14-13 14-24a14 14 0 0 0-28 0c0 11 14 24 14 24Z"/><circle cx="24" cy="20" r="5"/>', 3),
    check: SVG('<path d="m13 25 7 7 15-16"/>', 3.4),
    gancho: SVG('<path d="M24 16a4 4 0 1 1 4-4c0 3-4 3-4 6v2L6 34h36L24 20"/>', 3),
    sobre: SVG('<rect x="6" y="12" width="36" height="25" rx="2"/><path d="m6 14 18 13 18-13M6 36l13-12m23 12L29 24"/>'),
    vestimenta: '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M17 6h6l-1 6 4 8-3 4 5 30H10l5-30-3-4 4-8-1-6Z"/><path d="M42 6h8l1 4 6 4v20h-4l-1 22h-4l-1-20h-1l-1 20h-4l-1-22h-4V14l6-4 1-4Z"/><path fill="#fff" d="m45 10 1 6 1-6Z"/></svg>'
  };
  const PLACE_ICONS = { ceremonia: 'iglesia', recepcion: 'copas', civil: 'anillos', fiesta: 'fiesta' };

  function iconFor(name) {
    return ICONS[name] || '';
  }

  function guessIcon(title) {
    const text = String(title || '').toLowerCase();
    if (/ceremonia|misa|iglesia/.test(text)) return 'iglesia';
    if (/civil|anillo|votos/.test(text)) return 'anillos';
    if (/cena|comida|banquete/.test(text)) return 'cena';
    if (/baile|vals|m[uú]sica|pista/.test(text)) return 'baile';
    if (/pastel|vela/.test(text)) return 'pastel';
    if (/cierre|despedida|fin/.test(text)) return 'luna';
    return 'copas';
  }

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

  /** Acepta 'fotos/a.webp' o {src, alt}. */
  function photo(entry, fallbackAlt) {
    if (!entry) return null;
    if (typeof entry === 'string') return { src: entry, alt: fallbackAlt };
    return entry.src ? { src: entry.src, alt: entry.alt || fallbackAlt } : null;
  }

  /** Lee la fecha tal como está escrita en fechaISO, sin convertir zonas horarias. */
  function dateParts(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return { year, month, day, weekday };
  }

  function initials(names) {
    return String(names || '').split(/\s*(?:&|\by\b)\s*/i).filter(Boolean).map((name) => name.trim()[0]).join('&');
  }

  function applyTheme() {
    const root = document.documentElement;
    Object.entries(data.tema || {}).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
    const fonts = data.tipografia || {};
    if (fonts.script) root.style.setProperty('--script', `'${fonts.script}', 'Segoe Script', 'Snell Roundhand', serif`);
    if (fonts.titulo) root.style.setProperty('--display', `'${fonts.titulo}', Georgia, serif`);
    if (data.estilo) root.dataset.estilo = data.estilo;
    if (data.tema?.papel) $('meta[name="theme-color"]')?.setAttribute('content', data.tema.papel);
  }

  function fillTexts(parts) {
    const pad = (value) => String(value).padStart(2, '0');
    const shortDate = parts ? `${pad(parts.day)}.${pad(parts.month)}.${parts.year}` : '';
    setText('eventTitle', data.tipo || data.titulo);
    setText('eventNamesEnvelope', data.nombres);
    setText('sealInitials', data.iniciales || initials(data.nombres));
    setText('coverCity', data.ciudad);
    setText('coverDate', shortDate);
    setText('eventCity', data.ciudad);
    setText('eventDateShort', shortDate);
    setText('eventEyebrow', data.tipo);
    setText('eventNames', data.nombres);
    setText('eventNumber', data.numero || '');
    setText('eventMessage', data.mensaje || '');
    setText('eventDayTime', [parts ? WEEKDAYS[parts.weekday] : '', data.hora].filter(Boolean).join(' · '));
    setText('eventQuote', data.frase);
    setText('eventNamesFooter', data.nombres);
    setText('closingLine', data.cierre);
    setText('eventHashtag', data.hashtag);
    setText('eventNotes', data.notas);
    setText('dressType', data.vestimenta?.tipo);
    setText('dressWomen', data.vestimenta?.mujeres);
    setText('dressMen', data.vestimenta?.hombres);
    setText('dressColorsNote', data.vestimenta?.notaColores || 'Colores reservados');
    setText('giftTitle', data.regalos?.titulo || 'Regalos');
    setText('giftNote', data.regalos?.nota);
    setText('placesTitle', data.lugares?.length > 1 ? '¿Dónde?' : 'El lugar');
    $('#openInvite')?.setAttribute('aria-label', `Abrir la invitación de ${data.nombres || 'este evento'}`);
    document.title = `${data.titulo || 'Invitación'} | Invitación Akiko`;

    const big = $('#eventDateBig');
    if (big && parts) {
      [pad(parts.day), pad(parts.month), parts.year].forEach((value, index) => {
        if (index) big.append(document.createElement('i'));
        const span = document.createElement('span');
        span.textContent = value;
        big.append(span);
      });
      big.setAttribute('aria-label', `${parts.day} de ${MONTHS[parts.month - 1]} de ${parts.year}`);
    }
    if (!data.mensaje) $('#eventMessage')?.setAttribute('hidden', '');
    if (!data.frase) $('#eventQuote')?.setAttribute('hidden', '');
  }

  function renderPhotos() {
    const cover = photo(data.portada, data.portadaAlt || `Fotografía de ${data.nombres || 'portada'}`);
    if (cover) {
      const source = safeUrl(cover.src);
      ['coverPhoto', 'heroPhoto'].forEach((id, index) => {
        const image = document.getElementById(id);
        if (!image) return;
        image.src = source;
        image.alt = index ? cover.alt : '';
      });
      document.documentElement.style.setProperty('--cover-image', `url("${source.replace(/"/g, '')}")`);
    } else {
      ['coverPhoto', 'heroPhoto'].forEach((id) => document.getElementById(id)?.setAttribute('hidden', ''));
    }

    const photos = (data.fotos || []).map((entry, index) => photo(entry, `Fotografía ${index + 1} de ${data.nombres || 'el evento'}`));
    $$('[data-foto]').forEach((figure) => {
      const item = photos[Number(figure.dataset.foto)];
      if (!item) return;
      const image = $('img', figure);
      image.alt = item.alt;
      image.src = safeUrl(item.src);
      image.addEventListener('load', () => {
        if (image.naturalWidth > image.naturalHeight) figure.classList.add('is-wide');
      }, { once: true });
      figure.hidden = false;
    });

    const closing = photos[2] || cover;
    const closingImage = $('#closingPhoto');
    if (closing && closingImage) {
      closingImage.src = safeUrl(closing.src);
      closingImage.alt = closing.alt;
      closingImage.hidden = false;
    }
  }

  function renderIcons() {
    $$('[data-icon]').forEach((slot) => {
      slot.innerHTML = iconFor(slot.dataset.icon);
    });
  }

  function init() {
    applyTheme();
    if (!data.evento) {
      setText('eventTitle', 'Invitación');
      setupEnvelope();
      return;
    }
    fillTexts(dateParts(data.fechaISO));
    renderPhotos();
    renderIcons();
    renderLocations();
    renderItinerary();
    renderDressColors();
    renderGallery();
    renderGiftLinks();
    hideEmptySections();
    setupBankDetails();
    setupRsvp(data.rsvp || {});
    const date = new Date(data.fechaISO || '');
    buildCalendar(date, !Number.isNaN(date.valueOf()));
    setupEnvelope();
    setupMusic();
  }

  function mapLink(label, url, className) {
    const link = document.createElement('a');
    link.className = className;
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function renderLocations() {
    const container = $('#locations');
    if (!container) return;

    (data.lugares || []).forEach((place) => {
      const [legacyTitle, legacyName] = String(place.nombre || '').split(' · ');
      const title = place.titulo || (legacyName ? legacyTitle : 'Lugar');
      const name = place.titulo ? place.nombre : (legacyName || legacyTitle);
      const article = document.createElement('article');
      article.className = 'place';
      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.innerHTML = iconFor(PLACE_ICONS[place.tipo] || guessIcon(title));
      const heading = document.createElement('h3');
      heading.textContent = title;
      const time = document.createElement('p');
      time.className = 'place__time';
      time.textContent = place.hora ? `Hora: ${place.hora}` : '';
      const venue = document.createElement('p');
      venue.className = 'place__name';
      venue.textContent = name || '';
      const address = document.createElement('p');
      address.className = 'place__address';
      address.textContent = place.direccion || '';
      const query = encodeURIComponent([name, place.direccion, data.ciudad].filter(Boolean).join(', '));
      const actions = document.createElement('div');
      actions.append(
        mapLink('Ver mapa', `https://www.google.com/maps/search/?api=1&query=${query}`, 'button small'),
        document.createElement('br'),
        mapLink('o abrir en Waze', `https://waze.com/ul?q=${query}&navigate=yes`, 'link-quiet')
      );
      article.append(icon, heading, time, venue, address, actions);
      container.append(article);
    });
  }

  function renderItinerary() {
    const list = $('#itinerary');
    if (!list) return;

    (data.itinerario || []).forEach((item) => {
      const entry = document.createElement('li');
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.innerHTML = iconFor(item.icono) || iconFor(guessIcon(item.titulo));
      const time = document.createElement('time');
      time.textContent = item.hora || '';
      const text = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = item.titulo || '';
      text.append(title);
      if (item.detalle) {
        const note = document.createElement('small');
        note.textContent = item.detalle;
        text.append(note);
      }
      entry.append(icon, time, text);
      list.append(entry);
    });
  }

  function renderDressColors() {
    const container = $('#dressColors');
    if (!container) return;
    const colors = data.vestimenta?.coloresReservados || [];
    colors.forEach((color) => {
      const swatch = document.createElement('i');
      swatch.style.backgroundColor = color;
      swatch.title = 'Color reservado';
      swatch.setAttribute('role', 'img');
      swatch.setAttribute('aria-label', 'Color reservado');
      container.append(swatch);
    });
    if (!colors.length) container.nextElementSibling?.setAttribute('hidden', '');
  }

  function renderGallery() {
    const gallery = $('#gallery');
    if (!gallery) return;
    (data.galeria || []).forEach((entry, index) => {
      const item = photo(entry, `Fotografía ${index + 1} de ${data.nombres || 'el evento'}`);
      if (!item) return;
      const image = document.createElement('img');
      image.src = safeUrl(item.src);
      image.alt = item.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 720;
      image.height = 1080;
      gallery.append(image);
    });
  }

  function renderGiftLinks() {
    const links = $('#giftLinks');
    if (!links) return;
    (data.regalos?.enlaces || []).forEach((gift) => {
      links.append(mapLink(gift.nombre || 'Mesa de regalos', safeUrl(gift.url), 'button small'));
    });
  }

  function hideEmptySections() {
    const rules = [
      ['#locations', Boolean(data.lugares?.length), '#quickPlace'],
      ['#itinerary', Boolean(data.itinerario?.length)],
      ['#dressType', Boolean(data.vestimenta?.tipo), '#quickDress'],
      ['#gallery', Boolean(data.galeria?.length)],
      ['#giftNote', Boolean(data.regalos?.nota || data.regalos?.enlaces?.length || data.regalos?.datos)],
      ['#eventNotes', Boolean(data.notas)]
    ];
    rules.forEach(([selector, hasContent, shortcut]) => {
      if (hasContent) return;
      $(selector)?.closest('.section, .band')?.setAttribute('hidden', '');
      if (shortcut) $(shortcut)?.setAttribute('hidden', '');
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
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      elements.forEach((element) => element.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    elements.forEach((element) => observer.observe(element));
  }

  // Tiempos de la secuencia del sobre (ms): sello, solapa, carta y salida.
  const OPEN_DURATION = 1250;
  const FADE_DURATION = 600;

  function setupEnvelope() {
    const screen = $('#envelopeScreen');
    const seal = $('#openInvite');
    if (!screen || !seal) {
      document.body.classList.remove('is-closed');
      setupMotion();
      return;
    }
    let opened = false;

    const reveal = () => {
      screen.hidden = true;
      document.body.classList.remove('is-closed');
      document.body.classList.add('is-open');
      window.scrollTo(0, 0);
      $('#eventNames')?.focus({ preventScroll: true });
      setupMotion();
    };

    const open = () => {
      if (opened) return;
      opened = true;
      seal.disabled = true;
      seal.setAttribute('aria-label', 'Abriendo invitación');
      playMusicOnOpen();
      if (reducedMotion()) {
        reveal();
        return;
      }
      screen.classList.add('is-opening');
      window.setTimeout(() => {
        document.body.classList.remove('is-closed');
        screen.classList.add('is-leaving');
        window.setTimeout(reveal, FADE_DURATION);
      }, OPEN_DURATION);
    };

    // Toda la tarjeta del sobre responde al toque; el botón del sello cubre el teclado.
    screen.addEventListener('click', open);
    seal.addEventListener('click', (event) => {
      event.stopPropagation();
      open();
    });
    screen.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
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
      ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => setText(id, index ? String(values[index]).padStart(2, '0') : values[index]));
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
