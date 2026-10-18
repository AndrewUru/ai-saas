import type { agentPages as en } from "../en/agentPages";

export const agentPages: typeof en = {
  backToSetup: "Volver a la configuración",
  simulatorPage: {
    badge: "Simulador",
    title: "Prueba {name}",
    intro:
      "Haz preguntas reales con el prompt, el catálogo y la base de conocimiento actuales.",
  },
  installPage: {
    badge: "Instalación",
    title: "Instala {name}",
    intro:
      "Copia el script en tu tienda y rota la clave si en algún momento el acceso queda expuesto.",
    notesTitle: "Notas de publicación",
    noteScript:
      "Instala el script antes de cerrar la etiqueta body o a través de tu gestor de etiquetas.",
    allowedDomains: "Dominios permitidos:",
    anyOrigin: "cualquier origen",
    noteRefresh:
      "Después de cambiar la configuración del widget, recarga la tienda para cargar la última versión.",
  },
  knowledgePage: {
    badge: "Conocimiento",
    title: "Conocimiento de {name}",
    intro: "Sube y procesa archivos que mejoran las respuestas de este agente.",
  },
  simulator: {
    samplePrompts: [
      "Recomiéndame un producto para alguien que compra por primera vez",
      "¿Lo tenéis en stock?",
      "¿Cuál es vuestra política de envíos o devoluciones?",
    ],
    suggestedProducts: "Productos sugeridos",
    error: "No se pudo probar este agente.",
    noReply: "No se recibió respuesta.",
    eyebrow: "Simulador",
    title: "Prueba este agente",
    intro:
      "Haz preguntas reales con el prompt, el catálogo y los archivos de conocimiento actuales. Los mensajes de prueba no consumen cuota.",
    previewMode: "Modo de prueba",
    start: "Empieza con un escenario",
    testing: "Probando la respuesta del agente...",
    placeholder: "Pregunta por productos, envíos, tallas, devoluciones...",
    send: "Enviar prueba",
  },
  embed: {
    title: "Snippet de inserción",
    copied: "Copiado",
    copy: "Copiar código",
    intro:
      "Copia y pega este script en tu WordPress (footer o widget HTML). El snippet no cambia aunque actualices la configuración.",
    planCheck: "El widget comprueba tu plan activo y los límites de uso antes de cargarse.",
    reactTitle: "React / Next.js:",
    reactBody:
      "No pegues este script directamente dentro de componentes de React. Usa el método de integración oficial descrito en la {link}.",
    docsLink: "documentación",
  },
  rotate: {
    newKey: "La nueva clave termina en {suffix}.",
    warning:
      "Rotar la clave invalida de inmediato el snippet de inserción actual. Actualiza los widgets instalados después de confirmar.",
    rotating: "Rotando...",
    confirm: "Confirmar rotación",
    cancel: "Cancelar",
    button: "Rotar API key",
  },
};
