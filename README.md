# ProN

ERP dashboard en espanol para administrar negocios, proyectos y eventos.

## Funciones incluidas

- Inicio de sesion para superadministrador con credenciales verificadas en servidor.
- Datos iniciales de proyectos, finanzas, socios, inventario, usuarios y auditoria.
- Separacion de informacion por proyecto.
- Roles base: Superadministrador, Administrador de proyecto, Administrador financiero e Invitado.
- Reportes descargables en TXT, CSV y grafico SVG.
- Configuracion inicial para Ecuador, USD y zona horaria America/Guayaquil.
- Base D1 declarada para persistencia cuando se despliegue en un runtime compatible.

## Desarrollo

```bash
pnpm install
pnpm run dev
pnpm test
```

La aplicacion usa Vinext, React y Cloudflare D1.
