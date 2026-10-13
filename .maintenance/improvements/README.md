# Dynamic improvement queue

Cada archivo JSON de `queue/` es una mejora autocontenida. El motor ignora otros tipos de archivo, valida todos los manifiestos y consume como maximo uno con `status: ready` por ejecucion.

Cuando no hay una propuesta `ready`, el workflow semanal puede pedir una a Codex y la valida antes de aplicar el cambio. Tambien puedes alimentar la cola manualmente: copia `.maintenance/templates/weekly-ui-improvement.json`, manten la propuesta en `paused` mientras se prepara y ejecuta `npm run improve:weekly:dry` antes de marcarla como `ready`.

Los elementos aplicados permanecen versionados con `status: proposed`, de modo que el Draft PR conserva la trazabilidad entre especificacion y cambio.
