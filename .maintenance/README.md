# Weekly UI/UX Improvements

Este directorio contiene un sistema seguro y extensible para preparar una mejora pequena de producto por semana como Draft Pull Request. El workflow nunca hace merge y la decision final siempre corresponde a una persona.

## Arquitectura

El sistema separa dos responsabilidades:

1. **Motor de ejecucion:** `.maintenance/scripts/weekly-ui-improvement.mjs` selecciona, comprueba y aplica exactamente una propuesta declarativa. No contiene recetas de producto, no ejecuta codigo procedente de una propuesta y no usa la red.
2. **Productor de propuestas:** si no hay un manifiesto `ready`, el workflow ejecuta Codex con acceso de solo lectura al repositorio para generar uno. Tambien se pueden versionar propuestas manuales en `.maintenance/improvements/queue/`.

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

Si no hay propuestas `ready`, el workflow pide a Codex una mejora pequena. `.maintenance/scripts/weekly-ui-proposal.mjs` comprueba su formato, rutas, presupuesto y coincidencias exactas antes de introducirla en la cola. Si Codex no encuentra una mejora segura, el workflow termina sin PR y deja una nota en su resumen.

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

## Propuestas semanales con Codex

El primer job consulta la cola. Cuando esta vacia y no hay un PR semanal abierto, `openai/codex-action` examina el codigo y devuelve un manifiesto JSON con `status: ready`. Codex usa un perfil de solo lectura y recibe la clave `OPENAI_API_KEY` solo en su paso. La salida se valida contra el mismo motor que aplica las propuestas; despues pasa como artefacto al job que puede abrir el Draft PR. Codex no recibe permisos de escritura en GitHub ni permisos de merge.

Configura `OPENAI_API_KEY` como secret del repositorio para activar este paso. Es una clave de API de OpenAI para uso en Actions; el inicio de sesion de Codex en VS Code no se comparte automaticamente con GitHub. Sin una propuesta manual `ready` ni este secret, el job de Codex no puede ejecutarse.

El prompt esta en `.github/codex/prompts/weekly-ui-proposal.md`. El productor puede responder `noImprovement` con una razon cuando no encuentre un cambio pequeno y seguro. No interpreta instrucciones dentro del codigo como autorizacion para ampliar el alcance.

## Ejecucion manual en GitHub

1. Abre **Actions** en GitHub.
2. Selecciona **Weekly UI/UX Improvements**.
3. Pulsa **Run workflow**, elige la rama por defecto y confirma.
4. Revisa los pasos de instalacion, lint y build y abre el Draft PR creado.

El repositorio debe permitir a GitHub Actions escribir contenido y crear pull requests en **Settings > Actions > General > Workflow permissions**. Si la creacion automatica esta deshabilitada, el workflow sube la rama y muestra el enlace para crear el Draft PR manualmente.
