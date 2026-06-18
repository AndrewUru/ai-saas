# Weekly UI/UX PR Checklist

## Resultado esperado

- [ ] El PR tiene un cambio UI/UX concreto, no solo reporte.
- [ ] El PR explica el problema de usuario que resuelve.
- [ ] El PR incluye criterios de aceptacion claros.
- [ ] El cambio es pequeno y reversible.
- [ ] El cambio no toca auth, billing, datos o integraciones criticas sin revision explicita.

## Salud tecnica de apoyo

- [ ] Instalacion reproducible con un solo gestor de paquetes.
- [ ] `lint` sin errores nuevos.
- [ ] `build` sin errores nuevos.
- [ ] Auditoria de vulnerabilidades revisada.
- [ ] Paquetes desactualizados agrupados por riesgo.
- [ ] Variables sensibles fuera del repositorio.

## UI/UX

- [ ] Home publica revisada en desktop y mobile.
- [ ] Pricing revisado en desktop y mobile.
- [ ] Login/signup revisados en desktop y mobile.
- [ ] Dashboard revisado con estados vacios, carga, error y datos reales cuando aplique.
- [ ] Widget revisado incrustado y en preview.
- [ ] No hay overflow horizontal.
- [ ] No hay texto cortado en botones, cards, tablas o paneles.
- [ ] Los elementos interactivos tienen foco visible.
- [ ] Los formularios muestran errores claros y recuperables.
- [ ] Los estados vacios dicen que hacer despues.

## Performance y accesibilidad

- [ ] Lighthouse performance revisado.
- [ ] Lighthouse accessibility revisado.
- [ ] Imagenes y assets pesados identificados.
- [ ] Animaciones revisadas en equipos lentos.
- [ ] Three.js no deja canvas en blanco.
- [ ] La consola no muestra errores en rutas publicas.

## Decision de merge

- [ ] Hallazgos P0/P1 convertidos en issue o tarea.
- [ ] Mejoras pequenas agrupadas para PR.
- [ ] Ideas de producto movidas a backlog, no mezcladas con fixes tecnicos.
