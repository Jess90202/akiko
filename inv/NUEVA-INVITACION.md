# Cómo crear otra invitación

Puedes preparar un nuevo evento copiando una demo. No necesitas instalar programas.

## 1. Copia la carpeta

Duplica `valeria-andres` para una boda o `sofia-30` para un cumpleaños. Ponle un nombre corto, sin espacios ni acentos, por ejemplo `lucia-mateo`. La carpeta `fotos` viene incluida: cambia sus imágenes por las del cliente.

## 2. Prepara las fotos

- Usa entre 4 y 8 fotos. Lo ideal: 1 de portada vertical, 3 para las franjas entre secciones y 3 para la galería.
- Redúcelas a unos 1080 px de ancho y guárdalas en WebP (cada una debería pesar menos de 200 KB).
- Ponles nombres claros, por ejemplo `fotos/portada.webp` o `fotos/playa.webp`.

## 3. Edita los datos del evento

Abre `datos.js` con un editor de texto y cambia los valores entre comillas:

- `evento`, `titulo`, `nombres`, `ciudad`, `fechaISO`, `fechaTexto`, `hora`, `frase`, `cierre`, `hashtag` y `notas`.
- `estilo`: `'clasico'` para bodas o `'fiesta'` para cumpleaños (agrega confeti y el número grande).
- `tipo`: la línea pequeña sobre los nombres, por ejemplo `'Nuestra boda'`.
- `iniciales`: lo que se lee en el sello de cera, por ejemplo `'L&M'` o `'30'`. Si lo dejas vacío se toman las iniciales de `nombres`.
- `numero` (opcional): número decorativo grande detrás del nombre, útil en cumpleaños o XV años.
- `mensaje`: texto corto y cálido que aparece junto a la fecha.
- `fechaISO` usa el formato `AAAA-MM-DDTHH:mm:ss-06:00` para Ciudad de México. La fecha grande (`12 | 12 | 2026`) y el día de la semana salen de aquí.
- `portada` y `portadaAlt`: la foto principal y su descripción.
- `fotos`: lista de `{src, alt}` para las tres franjas de foto. La primera va después de la cuenta regresiva, la segunda después de la vestimenta y la tercera es el fondo del cierre. Si una falta, esa franja no aparece.
- `galeria`: lista de `{src, alt}` (o solo la ruta) para el carrusel. Si está vacía, la sección se oculta.
- `tema`: colores en hexadecimal. `papel` (fondo), `tinta` (texto), `acento` (detalles dorados), `profundo` (bandas oscuras), `sobre` (color del sobre), `sello` y `sello-tinta` (cera y letras del sello), `flor` y `hoja` (ramitas del sobre) y `fondo` (lo que se ve alrededor en computadora).
- `tipografia`: `script` (letra manuscrita) y `titulo` (títulos). Si cambias una fuente, cambia también el enlace de Google Fonts en el `<head>` del `index.html`.
- `lugares`: una o varias ubicaciones con `tipo` (`ceremonia`, `recepcion`, `civil` o `fiesta`, define el ícono), `titulo`, `nombre` del lugar, `hora` y `direccion`.
- `itinerario`: momentos con `hora`, `titulo`, `detalle` e `icono` opcional: `iglesia`, `copas`, `anillos`, `cena`, `baile`, `pastel`, `luna` o `fiesta`.
- `vestimenta`: `tipo`, `mujeres`, `hombres`, `coloresReservados` (hexadecimales) y `notaColores` (texto debajo de los colores).
- `regalos`: `titulo` (por ejemplo `'Lluvia de sobres'`), `nota`, `enlaces` (lista de `{nombre, url}`) y `datos` opcionales que se muestran tras tocar **Ver datos**.

## 4. Ajusta el index.html

Solo cambia el `<head>`: `<title>`, `description`, `theme-color`, el enlace de Google Fonts y la foto en `<link rel="preload">`. Dentro del sobre puedes cambiar el texto inicial de los nombres y del sello; la plantilla los reemplaza al cargar.

## 5. Elige las confirmaciones

En `rsvp` puedes elegir:

- `nivel: 'whatsapp'`: conserva `whatsapp` con clave de país, sin signo + ni espacios; por ejemplo `525512345678`.
- `nivel: 'hoja'`: pega la URL de Apps Script en `urlScript`. Sigue [las instrucciones de Apps Script](apps-script/INSTRUCCIONES.md).
- `nivel: 'pases'`: usa la misma URL y agrega `pases`, con una clave corta, nombre y número de lugares. Ejemplo: `'familia-perez': {nombre:'Familia Pérez', lugares:3}`. Comparte el enlace terminado en `?pase=familia-perez` con esa familia.

Con URL vacía, las confirmaciones de hoja y pases funcionan en modo demostración: el agradecimiento aparece, pero el envío no se guarda. Un enlace con pase desconocido queda limitado a una persona.

## 6. Publica y comparte

Sube la nueva carpeta junto a las demás dentro de `inv`, abre su página en el sitio y revisa la fecha, los mapas, las fotos y las respuestas. Toca el sello para comprobar que el sobre se abre.

Las demos (`valeria-andres` y `sofia-30`) están en el sitemap. Las invitaciones de clientes no deben agregarse al sitemap; si quieres que Google no las muestre, añade `<meta name="robots" content="noindex">` en su `<head>`.

Cuando cambies `_plantilla/invitacion.css` o `_plantilla/invitacion.js`, sube el número `?v=` en los `index.html` (por ejemplo de `?v=2` a `?v=3`). Así los navegadores y Cloudflare no siguen usando la versión anterior guardada en caché.
