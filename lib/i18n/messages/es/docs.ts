import type { docs as en } from "../en/docs";

export const docs: typeof en = {
  badge: "Documentación",
  title: "Guía del producto e instalación del widget",
  intro:
    "Usa esta página para entender qué hace cada área del panel, cómo se instala el widget en la tienda y cómo resolver los problemas habituales de lanzamiento en proyectos con WooCommerce, Shopify, HTML y React/Next.js.",
  openAgents: "Abrir agentes",
  connectStore: "Conectar tienda",
  highlights: [
    "Crea un agente para cada tienda.",
    "Entrénalo con conocimiento aprobado del negocio.",
    "Instala un único script seguro en la web del cliente.",
  ],
  modulesEyebrow: "Funciones del panel",
  modulesTitle: "Para qué sirve cada módulo",
  features: {
    agents: {
      title: "Agentes",
      description:
        "Crea un asistente por tienda o cliente. Cada agente tiene su propia API key, base de conocimiento, configuración del widget, dominios permitidos, simulador y analítica.",
    },
    knowledge: {
      title: "Conocimiento",
      description:
        "Sube el contexto de la tienda, políticas, FAQs, notas del catálogo y respuestas internas para que el asistente responda con información aprobada en lugar de adivinar.",
    },
    widget: {
      title: "Estudio del widget",
      description:
        "Personaliza el nombre de la marca, el saludo, el texto del botón, los colores, las burbujas del chat, la cabecera, la posición y el idioma. La vista previa se actualiza antes de publicar.",
    },
    simulator: {
      title: "Simulador",
      description:
        "Prueba preguntas de compradores antes de salir en vivo. Úsalo para validar reembolsos, envíos, recomendaciones de productos, casos límite y derivaciones.",
    },
    integrations: {
      title: "Integraciones",
      description:
        "Conecta WooCommerce o Shopify para que el asistente trabaje con el contexto de productos y del catálogo, y no solo con textos de soporte estáticos.",
    },
    analytics: {
      title: "Analítica",
      description:
        "Revisa conversaciones, uso y señales de fricción. Usa los datos para detectar respuestas que faltan, objeciones de los compradores y oportunidades de mejorar la tienda.",
    },
    domains: {
      title: "Dominios permitidos",
      description:
        "Limita dónde puede cargarse cada widget. Así evitas que un script filtrado se reutilice en dominios o webs de clientes no autorizados.",
    },
    rotation: {
      title: "Rotación de API keys",
      description:
        "Rota la clave de un widget desde la pantalla de instalación si un snippet queda expuesto, termina un contrato con un cliente o quieres revocar el acceso anterior.",
    },
  },
  installEyebrow: "Instalación",
  installTitle: "Publica el widget",
  step: "Paso {n}",
  installSteps: [
    {
      title: "Crea o abre un agente",
      body: "Ve a Agentes, elige el asistente de la tienda o del cliente y revisa su conocimiento, el estilo del widget y los dominios permitidos.",
    },
    {
      title: "Copia el snippet de inserción",
      body: "Abre la pantalla de Instalación del agente y copia el script generado. El snippet no cambia cuando actualizas la configuración del widget.",
    },
    {
      title: "Pégalo antes de cerrar el body",
      body: "Usa el área de footer/HTML personalizado de WordPress, Shopify, Webflow o cualquier constructor web. En HTML propio, pégalo antes de </body>.",
    },
    {
      title: "Verifica y monitoriza",
      body: "Abre la tienda, envía un mensaje de prueba y revisa la analítica y los resultados del simulador antes de entregar la tienda al cliente.",
    },
  ],
  htmlTitle: "HTML estándar, WordPress, Shopify o Webflow",
  htmlBody:
    "Pega el snippet generado en el footer, en el HTML personalizado del tema, en un gestor de etiquetas o justo antes de cerrar la etiqueta body.",
  nextTitle: "Ejemplo con Next.js",
  nextBody:
    "En React y Next.js, carga el script con el cargador del framework en lugar de poner una etiqueta script directamente dentro de JSX.",
  domainTitle: "Seguridad de dominios",
  domainExact:
    "Los dominios permitidos son exactos. {root} y {sub} son orígenes distintos. Añade cada dominio de producción, de staging y de cliente que deba cargar el widget.",
  domainWildcard:
    "Usa {wildcard} cuando todos los subdominios deban ser válidos. Deja la lista vacía solo mientras pruebas en local o durante una configuración temporal.",
  checklistTitle: "Checklist de lanzamiento",
  checklist: [
    "El conocimiento del agente está aprobado.",
    "Los dominios permitidos incluyen la tienda en vivo.",
    "Los colores y textos del widget encajan con la marca.",
    "Las respuestas del simulador siguen la política de soporte.",
  ],
  troubleEyebrow: "Solución de problemas",
  troubleTitle: "Problemas habituales",
  troubleshooting: [
    {
      issue: "El widget no aparece",
      fix: "Comprueba que el script está instalado una sola vez, que la clave del agente está activa y que el dominio actual está permitido.",
    },
    {
      issue: "La consola del navegador muestra un 403",
      fix: "El dominio no está autorizado. Añade el dominio exacto o un comodín como *.example.com.",
    },
    {
      issue: "React o Next.js lanza un error de script",
      fix: "No pegues el script tal cual dentro de JSX. Cárgalo con el cargador de scripts del framework.",
    },
    {
      issue: "El estilo no se actualizó",
      fix: "Recarga la tienda y confirma que la configuración se guardó en la pantalla del widget del agente.",
    },
  ],
  contactSupport: "Contactar con soporte",
  readAcademy: "Leer la Academia",
};
