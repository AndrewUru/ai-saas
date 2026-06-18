# UX Backlog

Prioridades:

- `P0`: rompe instalacion, build, seguridad o flujo principal.
- `P1`: friccion clara para usuarios o deuda visual visible.
- `P2`: pulido, rendimiento incremental o mejora exploratoria.

| Prioridad | Area | Mejora | Senal | Estado |
| --- | --- | --- | --- | --- |
| P0 | Mantenimiento | Elegir un solo gestor de paquetes y alinear lockfile/node_modules. | Existen `package-lock.json` y `pnpm-lock.yaml`; esta maquina no tiene `pnpm`. | Abierto |
| P0 | Dependencias | Actualizar `lucide-react` a una version compatible con React 19 antes de depender de `npm ci`. | `npm install` falla por peer dependency antiguo. | Abierto |
| P1 | Auditoria visual | Instalar `playwright`, `lighthouse` y `chrome-launcher` cuando el gestor de paquetes este limpio. | La capa visual esta preparada pero queda omitida si faltan herramientas. | Abierto |
| P1 | Mobile | Revisar dashboard, widget designer y paginas de integraciones en 390px. | Son flujos densos y propensos a overflow. | Pendiente |
| P1 | Estados vacios | Pulir estados vacios de agentes, integraciones, knowledge y analytics. | Flujos SaaS necesitan orientar la siguiente accion. | Pendiente |
| P1 | Accesibilidad | Revisar foco visible, labels de formularios y contraste en botones secundarios. | Lighthouse y revision manual semanal. | Pendiente |
| P2 | Three.js | Medir coste de `ThreeBackground` y degradar animacion en dispositivos lentos. | Posible impacto en home/performance. | Pendiente |
| P2 | Widget | Revisar mensajes largos, cards de producto y botones en mobile. | Riesgo de texto cortado dentro del embed. | Pendiente |
