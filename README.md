# Akiko – Sitio web

Sitio estático (HTML + CSS + JS), listo para **GitHub Pages**.

## Estructura
```
index.html                  Página principal
aviso-de-privacidad.html    Aviso de Privacidad (LFPDPPP)
cookies.html                Política de Cookies
terminos.html               Términos y Condiciones
styles.css / script.js      Estilos y animaciones (líneas de luz, capítulos, dial, menú, cookies)
assets/akiko-logo.png       Logo original
assets/akiko-mascota.png    Mascota sin fondo (hero y secciones)
assets/akiko-wordmark.png   Letras "akiko" (header y footer)
assets/akiko-boceto.jpg     Boceto original de la mascota
assets/favicon.png          Ícono de la pestaña
assets/video/akiko-demo.mp4 Video vertical de la demo (sección «Demo»)
```

## Antes de publicar
1. Sube la carpeta `assets/` completa junto a los demás archivos.
2. Datos legales ya capturados (Mariquita Sánchez, CDMX, akikohedz@gmail.com). Agrega número exterior y C.P. al domicilio en `aviso-de-privacidad.html` si quieres.
3. Pide a un abogado que revise los textos legales; son una base general, no asesoría legal.

## Publicar en GitHub Pages
1. Sube todos los archivos a un repositorio (rama `main`).
2. En GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.
3. El sitio usa el dominio **akiko-tech.com** (archivo `CNAME`). En **Settings → Pages → Custom domain** escribe `akiko-tech.com`, espera la revisión de DNS y activa **Enforce HTTPS**.

## Dominio akiko-tech.com (DNS)
Registros en el panel del dominio (ya configurados al 24 de octubre de 2026):

| Tipo | Nombre | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | jess90202.github.io |

Con esto, `www.akiko-tech.com` y la dirección vieja de GitHub redirigen solas a `https://akiko-tech.com/`.

## Google
- `sitemap.xml` y `robots.txt` están en la raíz. Da de alta `https://akiko-tech.com` en Google Search Console y envía `https://akiko-tech.com/sitemap.xml`.
- Las URLs absolutas (canonical, og:image, JSON-LD y sitemap) usan `https://akiko-tech.com/`. Si cambia el dominio, hay que cambiarlas todas.

## WhatsApp
Los botones usan `https://wa.me/525515338822`. Para cambiar el número, reemplázalo en `index.html`.
