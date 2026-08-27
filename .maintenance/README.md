# Weekly UI/UX Improvements

Este directorio contiene un sistema seguro y extensible para preparar una mejora pequena de producto por semana como Draft Pull Request. El workflow nunca hace merge y la decision final siempre corresponde a una persona.

## Arquitectura

El sistema separa dos responsabilidades:

1. **Motor de ejecucion:** `.maintenance/scripts/weekly-ui-improvement.mjs` selecciona, comprueba y aplica exactamente una propuesta declarativa. No contiene recetas de producto, no ejecuta codigo procedente de una propuesta y no usa la red.
2. **Productor de propuestas:** una persona, un script de analisis o un futuro agente de IA crea manifiestos JSON en `.maintenance/improvements/queue/`. Este repositorio no presupone que exista ningun servicio externo.

La configuracion `.maintenance/config/weekly-ui-improvements.json` define prioridades y limites adicionales. Las barreras criticas tambien viven en el motor para que la configuracion no pueda ampliar por accidente el alcance permitido.

## Comandos

```bash
npm run improve:weekly:dry
npm run improve:weekly
npm run improve:weekly:test
```

- `improve:weekly:dry` valida toda la cola, selecciona la propuesta con mayor prioridad y mas antigua, y muestra el plan sin escribir archivos.
- `improve:weekly` aplica una sola propuesta con `status: ready`, la marca como `proposed`, actualiza el log y genera el cuerpo del PR.
- `improve:weekly:test` comprueba seleccion, reemplazos exactos y limites de seguridad del motor.

Los comandos de calidad existentes (`improve:quality`, `improve:quality:full` e `improve:visual`) siguen disponibles como diagnostico adicional.

## Contrato de una propuesta

Usa `.maintenance/templates/weekly-ui-improvement.json` como punto de partida y consulta `.maintenance/schemas/weekly-ui-improvement.schema.json` para el formato completo.

Cada manifiesto incluye:

- identidad, estado, prioridad, area y categoria;
- problema observado y solucion concreta;
- criterios de aceptacion observables;
- fecha de creacion para ordenar la cola;
- una lista pequena de operaciones `replace_text` o `create_file`.

`replace_text` exige texto exacto y un numero esperado de coincidencias. Si el producto ha cambiado desde que se preparo la propuesta, la ejecucion falla de forma explicita en vez de aplicar un parche ambiguo. `create_file` solo crea archivos nuevos y nunca sobrescribe uno existente.

Para anadir una mejora:

1. Copia la plantilla a `.maintenance/improvements/queue/<id>.json`.
2. Completa problema, solucion, criterios y operaciones contra la rama por defecto actual.
3. Deja `status: paused` mientras se edita.
4. Ejecuta `npm run improve:weekly:dry`.
5. Cambia el estado a `ready` y versiona el manifiesto.

No es necesario modificar el script principal al anadir propuestas.

## Seleccion y ciclo de vida

El motor valida todos los manifiestos antes de seleccionar. Entre los elementos `ready`, elige primero por el orden de prioridades configurado y despues por `createdAt`; los empates se resuelven por `id`. Solo aplica uno.

Al aplicar una propuesta:

1. Comprueba esquema, categoria, rutas, extensiones y presupuesto de cambio.
2. Rechaza archivos objetivo con cambios locales previos.
3. Construye todos los cambios en memoria y comprueba coincidencias exactas.
4. Escribe los archivos de forma transaccional, actualiza el manifiesto a `proposed`, anade el log y crea la descripcion del PR.
5. GitHub Actions ejecuta siempre `npm ci`, `npm run lint` y `npm run build` como pasos independientes.
6. El workflow anade cada resultado al PR y al log, verifica el conjunto exacto de archivos, sube una rama y abre un Draft PR.
7. Si cualquier validacion falla, el Draft PR conserva el diagnostico y el job termina con error.

Si no hay propuestas `ready`, el motor no modifica el reporte ni crea un PR vacio. El workflow deja una nota en su resumen. Reponer la cola corresponde al productor de propuestas.

## Limites de seguridad

El motor solo admite cambios pequenos en archivos UI bajo `app/` y `components/`, con extensiones de texto permitidas y limites de archivos, operaciones, lineas y tamano.

Siempre bloquea:

- API routes, auth, login/signup, pricing/billing e integraciones sensibles;
- componentes de pagos o sesion conocidos;
- archivos que contienen acceso a Supabase, variables de entorno, pagos, auth o Server Actions;
- adiciones de codigo con acceso de servidor, URLs externas, evaluacion dinamica, cookies o HTML inseguro;
- rutas absolutas, traversal, binarios, sobrescrituras y cambios locales previos;
- cualquier archivo inesperado generado durante instalacion o validacion.

Estas comprobaciones reducen el riesgo, pero no sustituyen la revision humana. El workflow solo crea Draft Pull Requests y no contiene ningun paso de merge.

## Conectar un futuro agente de IA

Un agente proponente puede analizar capturas, issues, telemetria no sensible o el codigo y producir un manifiesto conforme al esquema. Debe funcionar como proceso separado y con permisos de solo lectura sobre el producto salvo para escribir su propuesta en la cola.

Antes de aceptar su salida:

1. validar el JSON contra el esquema;
2. ejecutar `npm run improve:weekly:dry` sobre la rama por defecto actual;
3. versionar la propuesta con `status: ready`;
4. dejar que el motor local aplique y valide el cambio.

El agente no debe recibir permisos de merge, secrets de produccion ni capacidad para relajar la politica del motor.

## Ejecucion manual en GitHub

1. Abre **Actions** en GitHub.
2. Selecciona **Weekly UI/UX Improvements**.
3. Pulsa **Run workflow**, elige la rama por defecto y confirma.
4. Revisa los pasos de instalacion, lint y build y abre el Draft PR creado.

El repositorio debe permitir a GitHub Actions escribir contenido y crear pull requests en **Settings > Actions > General > Workflow permissions**. Si la creacion automatica esta deshabilitada, el workflow sube la rama y muestra el enlace para crear el Draft PR manualmente.
