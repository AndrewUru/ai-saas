import type { dashCommon as enDashCommon, home as enHome } from "../en/home";

export const dashCommon: typeof enDashCommon = {
  unnamedAgent: "Agente sin nombre",
  active: "Activo",
  paused: "En pausa",
  loading: "Cargando",
  unlimited: "Ilimitado",
  noExpiry: "Sin caducidad",
  openWorkspace: "Abrir espacio de trabajo",
};

export const home: typeof enHome = {
  suggestions: {
    faq: {
      title: "Añade una respuesta sobre envíos y devoluciones",
      reason:
        "Muchos chats de e-commerce se atascan en los plazos de entrega, los reembolsos o los cambios.",
      action: "Crear FAQ",
    },
    rule: {
      title: "Crea una regla de recomendación de productos",
      reason:
        "Indica al agente que pregunte presupuesto, uso y urgencia antes de recomendar artículos.",
      action: "Añadir regla",
    },
    handoff: {
      title: "Define cuándo derivar a una persona",
      reason:
        "Escala quejas, cambios de pedido e intención de reembolso antes de que el cliente tenga que repetirse.",
      action: "Revisar",
    },
  },
  cards: {
    revenue: {
      label: "Oportunidades de venta",
      helper: "Chats que mencionan precio, stock, envío, talla o devoluciones.",
    },
    training: {
      label: "Sugerencias de entrenamiento",
      helper: "Mejoras de prompt, FAQ o flujo listas para revisar.",
    },
    followups: {
      label: "Seguimientos humanos",
      helper: "Chats que pueden necesitar soporte, retención o escalado.",
    },
    active: {
      label: "Agentes activos",
      paused: "{count} en pausa",
      allActive: "Todos los agentes configurados están activos.",
    },
  },
  playbooks: [
    {
      title: "Asistente de tallas de moda",
      detail:
        "Guía de tallas, confianza en las devoluciones, combinaciones de outfits y recomendaciones según el stock.",
    },
    {
      title: "Asesor de rutinas de belleza",
      detail:
        "Necesidades de la piel, revisión de ingredientes, packs y mensajes para la recompra.",
    },
    {
      title: "Centro de compatibilidad de electrónica",
      detail:
        "Compatibilidad entre modelos, respuestas sobre garantía, venta de accesorios y ayuda con la configuración.",
    },
  ],
  scenarios: [
    "El cliente pregunta si el producto sirve para su caso",
    "El cliente pone pegas al coste del envío",
    "El cliente quiere un reembolso o hablar con una persona",
  ],
  commands: {
    test: {
      label: "Prueba una respuesta del agente",
      detail: "Abre un espacio de trabajo y haz una pregunta real de cliente.",
    },
    connect: {
      label: "Conecta el contexto de productos",
      detail: "Sincroniza WooCommerce o Shopify para que las respuestas usen el catálogo.",
    },
    create: {
      label: "Crea un nuevo asistente",
      detail: "Abre otro espacio de trabajo para una tienda, idioma o marca.",
    },
  },
  copilot: "Copiloto comercial",
  activeOf: "{active} activos de {total} agentes",
  title: "¿Qué deberían mejorar hoy tus agentes?",
  subtitle:
    "Pregunta, prueba, ajusta y publica desde espacios de trabajo enfocados, en lugar de pelearte con largas pantallas de configuración.",
  promptPlaceholder:
    "Prueba objeciones sobre el envío, ajusta las recomendaciones de productos o prepara un widget para su lanzamiento...",
  openWorkspaceAria: "Abrir el espacio de trabajo del agente",
  plan: "Plan",
  manage: "Gestionar",
  current: "Actual",
  limit: "Límite",
  renewal: "Renovación",
  recentAgents: "Agentes recientes",
  all: "Todos",
  noAgents: "Aún no tienes agentes. Crea uno para empezar a probar respuestas.",
  signalsEyebrow: "Señales del copiloto",
  signalsTitle: "Qué necesita atención",
  lastConversations: "Últimas {count} conversaciones",
  salesFriction: "Fricción en ventas",
  salesFrictionEmpty:
    "Todavía no se han detectado objeciones sobre precio, stock, devoluciones o entrega.",
  handoff: "Derivación a personas",
  handoffEmpty: "Todavía no se han detectado señales urgentes de derivación.",
  trainingQueue: "Cola de entrenamiento",
  trainingQueueEmpty:
    "Empieza a recopilar conversaciones para generar mejores ideas de entrenamiento.",
  launchPlaybooks: "Playbooks de lanzamiento",
  testScenarios: "Escenarios de prueba",
  section: {
    title: "Espacios de trabajo de agentes",
    subtitle: "Abre un asistente, prueba respuestas y publica mejoras.",
    activeCount: "{active}/{total} activos",
    messages: "{limit} mensajes",
    viewAll: "Ver todos",
    loadError: "No se pudieron cargar los agentes. Recarga la página.",
    emptyTitle: "No hay agentes configurados",
    emptyDescription:
      "Crea tu primer agente para conectar los datos de la tienda y empezar a responder chats automáticamente.",
    createAgent: "Crear agente",
    key: "Clave:",
    limit: "Límite: {limit}",
    showingRecent: "Mostrando los 5 agentes más recientes",
  },
};
