# Weekly UI/UX Improvements

Este directorio monta un sistema de mejoras constantes: cada semana se prepara un PR pequeno, revisable y centrado en UI/UX, no un reporte pasivo.

La idea es que la automatizacion actue como product designer + frontend engineer junior: propone una mejora concreta, aplica cambios acotados, deja un PR en draft y obliga a revision humana antes de merge.

## Comandos

```bash
npm run improve:weekly
npm run improve:weekly:dry
npm run improve:quality
npm run improve:quality:full
npm run improve:visual
```

- `improve:weekly`: aplica la siguiente mejora preparada en `.maintenance/config/weekly-ui-improvements.json`.
- `improve:weekly:dry`: muestra cual seria el siguiente PR sin tocar archivos.
- `improve:quality`: ejecuta gates tecnicos de apoyo: instalacion, lint, build, seguridad y paquetes.
- `improve:quality:full`: ademas levanta Next y ejecuta scan visual/Lighthouse si estan instalados.
- `improve:visual`: solo revisa la capa visual cuando las herramientas opcionales existan.

## Flujo semanal

El workflow real vive en `.github/workflows/weekly-ui-improvements.yml`.

Cada lunes:

1. Selecciona la siguiente mejora con `status: ready`.
2. Aplica cambios de interfaz o experiencia de usuario.
3. Actualiza `.maintenance/IMPROVEMENT_LOG.md`.
4. Intenta validar con `npm ci`, `lint` y `build`.
5. Abre un PR draft con contexto de diseno, cambios y criterios de aceptacion.

Si la validacion tecnica falla, el PR igualmente se abre como draft para no perder el trabajo de producto. La razon queda anotada en el cuerpo del PR.

Para que GitHub Actions pueda abrir el PR automaticamente, el repositorio debe permitirlo en Settings > Actions > General > Workflow permissions: activar permisos de lectura/escritura y marcar que GitHub Actions puede crear y aprobar pull requests. Si esa opcion esta apagada, el workflow deja la rama subida y muestra el enlace para crear el PR manualmente.

## Como se anaden mejoras

1. Crear un item en `.maintenance/config/weekly-ui-improvements.json` con `status: ready`.
2. Anadir su receta en `.maintenance/scripts/weekly-ui-improvement.mjs`.
3. Mantener el cambio pequeno: una mejora visual, un estado vacio, una micro-funcionalidad o una correccion mobile.
4. Evitar cambios grandes automaticos en pricing, auth, billing, datos o integraciones sin revision explicita.

## Herramientas opcionales

La parte visual usa `playwright`, `lighthouse` y `chrome-launcher` cuando esten instalados. Hoy el proyecto tiene una deuda previa: conviene elegir un solo gestor de paquetes y actualizar `lucide-react` antes de depender de `npm ci` como gate obligatorio.

## Principio

La automatizacion no decide por ti. Cada semana deja trabajo masticado en forma de PR: cambio pequeno, razon de diseno, checklist y validacion. Tu decides si se mergea, se modifica o se descarta.
