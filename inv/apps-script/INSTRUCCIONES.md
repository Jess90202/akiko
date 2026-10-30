# Conectar las confirmaciones con Google Sheets

Esta configuración permite guardar respuestas de invitados en una hoja de cálculo. Para comenzar, abre `Codigo.gs` y copia todo su contenido.

## 1. Prepara tu hoja

1. En Google Drive crea una hoja de cálculo nueva para cada evento y ponle un nombre fácil de reconocer, por ejemplo **Respuestas de Valeria y Andrés**. Así cada panel muestra solo las respuestas de su invitación.
2. Copia el identificador que aparece entre `/d/` y `/edit` en la dirección de la hoja. Ejemplo: `https://docs.google.com/spreadsheets/d/ESTE-ES-EL-ID/edit`.
3. En la hoja, crea una pestaña llamada **Respuestas**. El código también la crea si hace falta.

## 2. Crea el Apps Script

1. En la hoja, abre **Extensiones → Apps Script**.
2. Borra el ejemplo que aparece, pega el contenido de `Codigo.gs` y guarda el proyecto.
3. En Apps Script abre **Configuración del proyecto → Propiedades de la secuencia de comandos → Añadir propiedad**. Agrega:
   - `SPREADSHEET_ID`: el identificador de tu hoja del paso 1.
   - `CLAVE_PANEL`: una clave privada larga, difícil de adivinar. No la compartas con invitados.
   - `PASES_JSON`: solo para la boda de nivel 3; pega JSON válido con los pases y sus nombres, por ejemplo `{"familia-perez":{"nombre":"Familia Pérez","lugares":3},"familia-ruiz":{"nombre":"Familia Ruiz","lugares":2},"ana-garcia":{"nombre":"Ana García","lugares":1}}`. Para cumpleaños puedes dejarlo como `{}`.

## 3. Publica la Web App

1. Pulsa **Implementar → Nueva implementación** y elige **Aplicación web**.
2. En **Ejecutar como**, selecciona tu cuenta. En **Quién tiene acceso**, selecciona **Cualquier persona** para que los invitados puedan confirmar sin iniciar sesión.
3. Pulsa **Implementar**, acepta los permisos de Google y copia la URL que termina en `/exec`.
4. En el `datos.js` del evento, pega esa dirección en `rsvp.urlScript`. Para el cumpleaños, `nivel` debe decir `hoja`; para la boda, conserva `pases`.
5. Si cambias el código, crea una **nueva versión** de la implementación para publicar el cambio.

## 4. Abre el panel de anfitriones

Abre `panel/index.html` desde el mismo sitio donde publicaste la carpeta `inv` (por ejemplo `https://tusitio.com/inv/panel/`). Pega la URL `/exec` y la `CLAVE_PANEL` que guardaste en propiedades. El panel consulta los totales, respuestas y enlaces para compartir.

La URL vacía de los archivos de demostración simula una confirmación local en ese navegador y no guarda información. El RSVP de WhatsApp necesita un número con clave de país y solo abre un mensaje preparado.

## Privacidad y cuidado

Comparte el panel y su clave solo con anfitriones. La hoja contiene nombres y mensajes de invitados: limita el acceso de Drive a las personas que organizan el evento. Si se filtra la clave, cámbiala en las propiedades del script y avisa a los anfitriones. Prueba la URL `/exec` con una confirmación de ensayo antes de compartir la invitación.
