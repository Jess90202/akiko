# Cómo crear otra invitación

Puedes preparar un nuevo evento copiando una demo. No necesitas instalar programas.

## 1. Copia la carpeta

Duplica `valeria-andres` para una boda o `sofia-30` para un cumpleaños. Ponle un nombre corto, sin espacios ni acentos, por ejemplo `lucia-mateo`. Conserva la carpeta `fotos` si copiaste la boda.

## 2. Edita los datos del evento

Abre `datos.js` con un editor de texto y cambia los valores entre comillas:

- `evento`, `titulo`, `nombres`, `ciudad`, `fechaISO`, `fechaTexto`, `hora`, `frase`, `cierre` y `hashtag`.
- `fechaISO` usa el formato `AAAA-MM-DDTHH:mm:ss-06:00` para Ciudad de México. Ajusta la zona horaria si el evento ocurre en otro lugar.
- `tema` acepta cuatro colores en formato hexadecimal: `papel`, `tinta`, `acento` y `profundo`.
- `lugares` puede tener una o varias ubicaciones. Cada una lleva `nombre`, `hora` y `direccion`.
- `itinerario` es una lista de momentos con `hora`, `titulo` y `detalle`.
- `vestimenta` incluye `tipo`, `mujeres`, `hombres` y `coloresReservados` (colores hexadecimales).
- `galeria` acepta rutas como `fotos/pareja-1.jpg`. Agrega los archivos a la carpeta `fotos`.
- `regalos.enlaces` es una lista de `{nombre, url}`. `regalos.datos` es opcional y se muestra tras tocar **Ver datos**.

## 3. Elige las confirmaciones

En `rsvp` puedes elegir:

- `nivel: 'whatsapp'`: conserva `whatsapp` con clave de país, sin signo + ni espacios; por ejemplo `525512345678`.
- `nivel: 'hoja'`: pega la URL de Apps Script en `urlScript`. Sigue [las instrucciones de Apps Script](apps-script/INSTRUCCIONES.md).
- `nivel: 'pases'`: usa la misma URL y agrega `pases`, con una clave corta, nombre y número de lugares. Ejemplo: `'familia-perez': {nombre:'Familia Pérez', lugares:3}`. Comparte el enlace terminado en `?pase=familia-perez` con esa familia.

Con URL vacía, las confirmaciones de hoja y pases funcionan en modo demostración: el agradecimiento aparece, pero el envío no se guarda. Un enlace con pase desconocido queda limitado a una persona.

## 4. Publica y comparte

Sube la nueva carpeta al mismo lugar que `inv`, abre su `index.html` en el sitio y revisa la fecha, mapas y respuestas. Cada invitación lleva `noindex` y no forma parte del menú ni del sitemap. Comparte el enlace directamente con tus invitados.

La plantilla está en `_plantilla/`. Si tienes varias invitaciones activas, puedes ajustar sus datos sin cambiar los archivos compartidos.
