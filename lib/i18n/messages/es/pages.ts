import type { pages as en } from "../en/pages";

export const pages: typeof en = {
  plans: {
    free: {
      name: "Gratis",
      cycle: "al mes",
      features: [
        "Hasta 5 agentes",
        "1.000 mensajes/mes",
        "Branding básico del widget",
        "Soporte estándar",
      ],
    },
    pro: {
      name: "Pro",
      cycle: "pago único",
      features: [
        "Agentes ilimitados",
        "10.000 mensajes/mes",
        "Rutas de escalado personalizadas",
        "Personalización avanzada del widget",
      ],
    },
  },
  about: {
    meta: { title: "Sobre nosotros" },
    eyebrow: "Sobre nosotros",
    title: "Impulsamos a las agencias que crean tiendas online memorables",
    intro:
      "AI SaaS nació tras trabajar con estudios web que necesitaban escalar el soporte sin perder el tono de cada marca. Creamos la plataforma para que tu equipo pueda desplegar agentes fiables, medir resultados y ofrecer un servicio recurrente a sus clientes.",
    manifestoTitle: "Nuestro manifiesto",
    manifestoBody:
      "Creemos que la automatización debe fortalecer la relación entre agencia y marca, no sustituirla. Por eso priorizamos controles granulares, analítica transparente y un proceso de onboarding que tu equipo puede replicar en cuestión de horas.",
    nextTitle: "Lo que viene",
    nextBody:
      "Estamos ampliando las integraciones con CRMs y plataformas de pago, además de un marketplace de prompts verificados por agencias para acelerar cada nuevo proyecto de e-commerce.",
  },
  contact: {
    meta: { title: "Contacto" },
    badge: "Soporte para agencias",
    titleStart: "Hablemos de tu",
    titleHighlight: "implementación",
    intro:
      "Escríbenos para resolver dudas técnicas, preparar demos para clientes o hablar de planes enterprise a tu medida.",
    emailTitle: "Soporte por email",
    emailBody:
      "Envía tu consulta incluyendo la URL de la tienda y el número de agentes que piensas desplegar.",
    sessionTitle: "Reserva una sesión de estrategia",
    sessionBody:
      "Hacemos talleres de integración y auditorías de prompts con tu equipo. Solicita una sesión por email o desde el panel.",
    sessionAvailability: "Disponible desde el panel",
  },
  pricing: {
    meta: { title: "Precios" },
    back: "Volver al panel",
    badge: "Precios",
    title: "Planes sencillos para agentes de IA para e-commerce.",
    intro:
      "Empieza gratis, conecta tu tienda y mejora el plan cuando tus agentes necesiten más volumen, personalización y una experiencia más limpia de cara a tus clientes.",
    metrics: {
      includedLabel: "Incluido",
      includedValue: "Widget de IA",
      checkoutLabel: "Pago",
      checkoutValue: "PayPal seguro",
      setupLabel: "Alta",
      setupValue: "Sin permanencia",
    },
    includedTitle: "Qué incluye",
    included: [
      "Widget de chat con IA en todos los planes",
      "Tablero de oportunidades para la fricción en ventas",
      "Personalización del prompt y de la marca",
      "Respuestas sobre productos basadas en el catálogo",
    ],
    testingTitle: "Ideal para probar",
    testingBody:
      "Usa el plan gratis para conectar una tienda, lanzar tus primeros agentes y ver qué preguntan los compradores antes de pasar a un plan de pago.",
    upgradeTitle: "Por qué mejoran el plan los equipos",
    proBenefits: [
      "Sin marca de AI SaaS",
      "Soporte prioritario",
      "Límites de mensajes más altos",
      "Flujo de informes para agencias",
    ],
    customTitle: "¿Necesitas límites a medida o funciones para agencias?",
    customBody:
      "Podemos ajustar el número de agentes, el volumen de mensajes, el onboarding y los informes white-label.",
    talkToSales: "Hablar con ventas",
  },
  pricingCards: {
    missingClientId:
      "El Client ID de PayPal no está configurado. Añádelo antes de aceptar pagos.",
    free: {
      headline: "Empieza a crear agentes",
      period: "para siempre",
      description: "Perfecto para probar el panel y lanzar tu primer agente.",
      badge: "Gratis para siempre",
    },
    pro: {
      headline: "Escala con confianza",
      period: "pago único",
      description:
        "Quita la marca, obtén soporte prioritario y desbloquea límites más altos.",
      badge: "Mejor opción",
    },
    goToDashboard: "Ir al panel",
    processing: "Procesando el pago",
    payOnce: "Pago único",
    createOrderError: "No se pudo crear el pedido",
    approved: "Pago aprobado. Activando tu cuenta...",
    captureFailed: "No se pudo completar el cobro",
    activated: "¡PRO activado! Redirigiendo...",
    paypalError: "Error de PayPal",
    secureNote:
      "Pago seguro con PayPal. El acceso se activa tras la aprobación.",
  },
  privacy: {
    meta: { title: "Política de privacidad" },
    eyebrow: "Documentación legal",
    title: "Política de privacidad",
    intro:
      "Esta página resume cómo recopilamos, usamos y protegemos los datos que nos confían las agencias de e-commerce y sus clientes. Este documento se actualiza a medida que añadimos nuevas funciones a la plataforma.",
    sections: [
      {
        title: "Datos que almacenamos",
        body: "Solo almacenamos la información necesaria para operar los agentes: credenciales cifradas de servicios externos, datos de facturación y los mensajes intercambiados con los clientes finales. No compartimos estos datos con terceros ajenos a la agencia titular de la cuenta.",
      },
      {
        title: "Tratamiento de los datos",
        body: "El acceso a la información sensible se limita a procesos automatizados del sistema. Cualquier intervención manual (soporte técnico o auditorías) requiere autorización por escrito de la agencia y queda registrada.",
      },
      {
        title: "Conservación y eliminación",
        body: "Puedes solicitar la eliminación completa de tus datos en cualquier momento. Conservamos los registros durante 30 días tras la cancelación de la cuenta para cumplir con obligaciones contables y atender posibles incidencias.",
      },
    ],
  },
  terms: {
    meta: { title: "Términos y condiciones" },
    eyebrow: "Documentación legal",
    title: "Términos y condiciones",
    intro:
      "Este acuerdo define cómo las agencias utilizan AI SaaS, qué responsabilidades asumimos y los límites de servicio que aplican a cada plan.",
    sections: [
      {
        title: "1. Uso autorizado",
        body: "La cuenta está destinada a gestionar agentes de IA para las tiendas online de tus clientes. Está prohibido usar la plataforma para actividades ilegales, envío masivo de spam o cualquier acción que comprometa infraestructuras externas.",
      },
      {
        title: "2. Límites del servicio",
        body: "Cada plan incluye un volumen de mensajes y un número de agentes activos. Superar esos límites puede suspender temporalmente el servicio hasta actualizar el plan o adquirir volumen adicional.",
      },
      {
        title: "3. Soporte y SLA",
        body: "Ofrecemos soporte prioritario a través del panel. Las incidencias críticas se atienden en menos de 12 horas hábiles. Si necesitas un acuerdo SLA personalizado, contáctanos para formalizarlo.",
      },
    ],
  },
  blog: {
    meta: { title: "Blog" },
    eyebrow: "Blog para agencias",
    title: "Ideas para escalar servicios recurrentes en e-commerce",
    intro:
      "Historias, experimentos y tácticas compartidas por agencias que ya venden agentes de IA como parte de su oferta.",
    featured: "Destacado",
    featuredTitle: "Cómo convertir implementaciones en un retainer mensual",
    featuredBody:
      "Modelos de precio, contratos e informes que usan las agencias para fidelizar a clientes de tiendas online con agentes siempre activos.",
    upcomingTitle: "Recursos en camino",
    upcomingBody:
      "Estamos preparando entrevistas con directores de CX, guías sobre prompts de venta cruzada y plantillas de propuestas comerciales. Suscríbete para recibirlos primero.",
    emailPlaceholder: "tuemail@agencia.com",
    notifyMe: "Avísame",
  },
  changelog: {
    meta: { title: "Novedades" },
    eyebrow: "Novedades",
    title: "Historial de actualizaciones",
    intro:
      "Cada semana añadimos mejoras para agencias que integran AI SaaS en sus tiendas online. Revisa los cambios recientes y comparte el roadmap con tu equipo.",
    entries: [
      {
        date: "2025-10-09",
        title: "Personalización avanzada para agentes",
        items: [
          "Prompt de sistema editable, idioma preferido y URL de fallback por agente.",
          "Widget mejorado con brand kit, botón flotante y estados de escritura.",
        ],
      },
      {
        date: "2025-10-08",
        title: "Integraciones con WooCommerce",
        items: [
          "Registro de tiendas con credenciales cifradas y control de dominios permitidos.",
          "Asignación rápida desde la ficha del agente y validación en tiempo real.",
        ],
      },
    ],
  },
};
