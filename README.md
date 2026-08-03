# ProN

ERP dashboard en espanol para administrar negocios, proyectos, eventos,
finanzas, socios, inventario, usuarios y reportes.

## Version GitHub Pages

La version publica vive en:

`https://appiba.github.io/ProN/`

Esta version usa Google Apps Script como backend y Google Sheets como base:

- Apps Script Web App: `https://script.google.com/macros/s/AKfycbzf1TjxIBrBNJ6fTY5NNciAlWCl0PFKYgCpRXcdRg2S9aYKjMqDxeVCgC1JlcZet8iLNA/exec`
- Google Sheet: `https://docs.google.com/spreadsheets/d/1KCzz2B59PN3IvcyM2_G2uvTi8nA759oV7rUsaXvrcSY/edit?gid=0#gid=0`

El backend completo esta en `google-apps-script/Code.gs`. Ese archivo crea las
pestanas y encabezados de la hoja, valida el superadministrador, entrega sesion
y guarda proyectos, movimientos, socios, inventario y usuarios.

La pagina valida primero contra Apps Script y usa Google Sheets como base
principal. Si el backend no responde, ProN no abre una sesion de trabajo hasta
reconectar con la hoja publicada.

## Funciones incluidas

- Inicio de sesion para superadministrador con credenciales verificadas en backend.
- Datos iniciales de proyectos, finanzas, socios, inventario, usuarios y auditoria.
- Separacion de informacion por proyecto.
- Roles base: Superadministrador, Administrador de proyecto, Administrador financiero e Invitado.
- Reportes descargables en TXT y CSV.
- Configuracion inicial para Ecuador, USD y zona horaria America/Guayaquil.
- Persistencia en Google Sheets para GitHub Pages, con estado visible de sincronizacion.
- D1 declarado para runtime compatible.

## Desarrollo

```bash
pnpm install
pnpm run dev
pnpm test
```

La aplicacion usa Vinext, React, Cloudflare D1 y una version estatica para
GitHub Pages conectada a Apps Script.
