# Maintenance System

Este directorio deja preparada una primera capa de mejora continua: revisar el proyecto cada semana, generar un reporte y priorizar mejoras sin aplicar cambios a ciegas.

## Comandos

```bash
npm run maintenance:audit
npm run maintenance:audit:full
npm run maintenance:visual
```

- `maintenance:audit`: ejecuta checks tecnicos, paquetes desactualizados, vulnerabilidades y genera un reporte Markdown.
- `maintenance:audit:full`: ademas levanta Next en `127.0.0.1:4173` y ejecuta auditoria visual/Lighthouse si las herramientas opcionales estan instaladas.
- `maintenance:visual`: solo levanta la app y ejecuta la capa visual, util para revisar pantallas rapido.

Los reportes se escriben en `.maintenance/reports/<fecha>/`.

## Herramientas opcionales

La auditoria visual usa `playwright`, `lighthouse` y `chrome-launcher` cuando estan disponibles en `node_modules`. Si faltan, el reporte no falla: deja la seccion como omitida y explica como habilitarla.

Antes de instalarlas conviene resolver la deuda de paquetes detectada: el repo tiene `package-lock.json` y `pnpm-lock.yaml`, pero esta maquina no tiene `pnpm`, y `npm install` falla por el peer antiguo de `lucide-react` con React 19.

## Rutina semanal

1. Ejecutar `npm run maintenance:audit:full`.
2. Revisar el Markdown generado.
3. Mover hallazgos accionables a `.maintenance/UX_BACKLOG.md`.
4. Elegir cambios pequenos para PRs concretos.
5. No aplicar sugerencias automaticas sin revisar impacto visual, tecnico y de producto.

## Fase 2

Cuando el repo tenga un gestor de paquetes unico y una instalacion reproducible, se puede copiar `.maintenance/templates/github-weekly-maintenance.yml` a `.github/workflows/weekly-maintenance.yml` y activar ejecucion semanal en GitHub Actions.
