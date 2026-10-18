import type { landing as en } from "../en/landing";

export const landing: typeof en = {
  meta: {
    title: "AI Commerce Agents | Convierte conversaciones en señales de ventas",
    description:
      "Despliega agentes de IA con tu marca para WooCommerce y Shopify que responden a los compradores, recomiendan productos, detectan fricción en la venta y sugieren mejoras.",
  },
  hero: {
    badge: "Inteligencia comercial, en vivo en cada conversación",
    titleLine1: "Convierte las preguntas de tus clientes en",
    titleLine2: "señales de ventas.",
    subtitle:
      "Un agente de IA que vende, da soporte y le muestra a tu equipo exactamente dónde dudan los clientes, antes de que esas preguntas se conviertan en carritos abandonados.",
    primaryCta: "Crea tu primer agente",
    secondaryCta: "Ver el ciclo de inteligencia",
    installOnce: "Instala una vez",
    live: "En vivo",
    storeNavNew: "Novedades",
    storeNavEssentials: "Básicos",
    storeHeadline: "Objetos cotidianos, bien pensados.",
    exploreCollection: "Ver colección",
    products: [
      { name: "Set Calma", price: "68 €" },
      { name: "Ritual de viaje", price: "34 €" },
    ],
    catalogOnline: "Catálogo conectado · en línea",
    insight: "Hallazgo",
    nextAction: "Siguiente acción",
    widgetStyleAria: "Estilo del widget",
    useStyleAria: "Usar el estilo {name}",
    conversations: [
      {
        label: "Entrega",
        question: "¿Llegará antes del viernes?",
        answer:
          "Sí. Si pides en las próximas 2 horas, lo recibes el jueves. El color arena está listo para enviar.",
        insight: "Duda sobre la entrega detectada",
        action: "Crear una regla que tranquilice sobre el envío",
      },
      {
        label: "Producto ideal",
        question: "¿Cuál va mejor para piel sensible?",
        answer:
          "El Set Calma no lleva fragancia y tiene la fórmula más suave. También puedo añadir el tamaño de viaje.",
        insight: "Recomendación con alta intención de compra",
        action: "Sugerir el pack Set Calma",
      },
      {
        label: "Devoluciones",
        question: "¿Puedo devolverlo si la talla no es la correcta?",
        answer:
          "Por supuesto. Tienes 30 días y el primer cambio de talla es gratis. ¿Quieres la guía de tallas?",
        insight: "Fricción con la política de devoluciones",
        action: "Mostrar antes la guía de tallas",
      },
    ],
  },
  features: {
    eyebrow: "Un ciclo continuo",
    title: "El widget es solo la superficie.",
    description:
      "Cada conversación alimenta un sistema operativo compartido para tu comercio: mejores recomendaciones para los compradores, señales más claras para los equipos y mejoras que siguen bajo control humano.",
    sell: {
      tag: "Vende",
      title: "Recomendaciones basadas en el catálogo en vivo.",
      description:
        "Relaciona la intención con precio, stock, variantes, políticas y alternativas útiles en lugar de enviar respuestas genéricas.",
      intentLabel: "Intención del comprador",
      intentQuote: "“Necesito una rutina sin fragancia por menos de 80 €.”",
      signals: ["Piel sensible", "Presupuesto 80 €", "Listo para comprar"],
      bestMatch: "Mejor opción",
      inStock: "En stock",
      productName: "Set Calma para la piel",
      productMeta: "Sin fragancia · 3 productos",
      productPrice: "68 €",
      recommend: "Recomendar el pack",
    },
    learn: {
      tag: "Aprende",
      title: "Descubre por qué dudan tus compradores.",
      description:
        "Agrupa conversaciones reales en patrones que tu equipo puede entender y aprovechar.",
      frictionMap: "Mapa de fricción",
      period: "Últimos 30 días",
      signals: ["Coste de envío", "Producto adecuado", "Política de devoluciones"],
    },
    control: {
      tag: "Controla",
      title: "La IA propone. Tu equipo aprueba.",
      queue: [
        "Añadir respuesta sobre el umbral de envío gratis",
        "Recomendar una alternativa en stock",
        "Escalar las solicitudes de reembolso",
      ],
    },
    operate: {
      tag: "Opera",
      title: "Un único panel para todas las tiendas que gestionas.",
      description:
        "Mantén separados la marca, el catálogo, el prompt y la política de derivación de cada tienda, y comparte los flujos que ya funcionan.",
      tiles: ["Conversaciones", "Catálogo", "Entrenamiento", "Derivaciones"],
    },
  },
  workflow: {
    eyebrow: "De la conversación a la acción",
    title: "Mira cómo una pregunta mejora toda la tienda.",
    description:
      "La misma interacción ayuda al comprador ahora y le enseña a tu equipo qué arreglar después.",
    traceTitle: "Traza de la señal comercial",
    session: "Sesión #0842",
    showStageAria: "Mostrar: {title}",
    stages: [
      {
        step: "01",
        name: "Escucha",
        title: "Un comprador hace una pregunta de compra real.",
        detail:
          "El agente capta la intención, la urgencia, el presupuesto y el contexto del producto detrás del mensaje.",
        metric: "Intención: confianza en la entrega",
      },
      {
        step: "02",
        name: "Fundamenta",
        title: "La respuesta usa el conocimiento en vivo de la tienda.",
        detail:
          "Antes de redactar la respuesta se consultan el catálogo, el stock, las variantes, las reglas de envío y el contenido aprobado.",
        metric: "4 fuentes consultadas",
      },
      {
        step: "03",
        name: "Detecta",
        title: "La conversación se convierte en una señal.",
        detail:
          "Las dudas repetidas se agrupan en una oportunidad que tu equipo puede entender, en lugar de perderse en el historial del chat.",
        metric: "Patrón: umbral de envío",
      },
      {
        step: "04",
        name: "Mejora",
        title: "Tu equipo aprueba la siguiente mejor acción.",
        detail:
          "Convierte la señal en una FAQ, una regla del prompt, una recomendación o una derivación a una persona sin perder el control.",
        metric: "Regla lista para publicar",
      },
    ],
    listenQuestion: "¿Llegará antes del viernes?",
    listenAnswer: "Déjame comprobar la entrega y el stock para tu zona.",
    sources: [
      { label: "Política de envíos", status: "Coincide" },
      { label: "Variante arena", status: "12 en stock" },
      { label: "Entrega estimada", status: "Jueves" },
    ],
    patternFound: "Patrón detectado",
    patternTitle: "La incertidumbre sobre el envío está frenando las compras.",
    patternDetail: "Una intención similar apareció en 18 conversaciones recientes.",
    readyToPublish: "Lista para publicar",
    suggestedImprovement: "Mejora sugerida",
    improvementText:
      "Muestra el plazo de entrega en las fichas de producto y úsalo en las respuestas con recomendaciones.",
    approve: "Aprobar mejora",
    linkedSignal: "La señal sigue vinculada a la conversación de origen",
  },
  useCases: {
    eyebrow: "Pensado para tu trabajo",
    title: "Un agente. Distintos modos de operar.",
    description:
      "Empieza con el flujo que tu equipo necesita hoy. Conserva la misma inteligencia conversacional a medida que la operación crece.",
    items: [
      {
        title: "Equipos de e-commerce",
        description:
          "Guía el descubrimiento de productos, responde preguntas de compra y saca a la luz la fricción que se esconde entre la ficha de producto y el checkout.",
        outcomes: ["Descubrimiento de productos", "Respuestas sobre políticas", "Packs recomendados"],
      },
      {
        title: "Agencias digitales",
        description:
          "Gestiona varios agentes con marca propia desde un mismo flujo, manteniendo separados los datos, el tono y las aprobaciones de cada cliente.",
        outcomes: ["Playbooks reutilizables", "Informes para clientes", "Control de marca"],
      },
      {
        title: "Atención al cliente",
        description:
          "Resuelve al instante las preguntas repetitivas y pasa los casos complejos a personas con la intención, el historial y el contexto del producto ya incluidos.",
        outcomes: ["Derivación inteligente", "Contexto de la conversación", "Cola de entrenamiento"],
      },
    ],
    explore: "Explorar el flujo",
    connect: "Conecta el stack de e-commerce que ya usas.",
    anyWebsite: "Cualquier web",
  },
  cta: {
    badge: "Tu próxima conversación es una señal",
    title: "Lleva el ciclo de inteligencia a tu tienda.",
    description:
      "Crea un agente, conecta un catálogo, elige un widget con tu marca y empieza a aprender de la intención real de tus compradores.",
    primary: "Crea tu agente",
    secondary: "Ver precios",
    perks: ["Sin tarjeta de crédito", "Plantillas editables", "Aprobación humana"],
    installOnce: "Instala una vez",
    ready: "Listo",
    steps: [
      { label: "Catálogo", status: "Conectado" },
      { label: "Agente", status: "Entrenado" },
      { label: "Widget", status: "Publicado" },
    ],
  },
};
