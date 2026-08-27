# Dynamic improvement queue

Cada archivo JSON de `queue/` es una mejora autocontenida. El motor ignora otros tipos de archivo, valida todos los manifiestos y consume como maximo uno con `status: ready` por ejecucion.

La cola no genera ideas por si sola. Puede ser alimentada por una persona o por un proponente automatizado independiente. Copia `.maintenance/templates/weekly-ui-improvement.json`, manten la propuesta en `paused` mientras se prepara y ejecuta `npm run improve:weekly:dry` antes de marcarla como `ready`.

Los elementos aplicados permanecen versionados con `status: proposed`, de modo que el Draft PR conserva la trazabilidad entre especificacion y cambio.
