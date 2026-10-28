import type { integrationPages as en } from "../en/integrationPages";

export const integrationPages: typeof en = {
  status: {
    created: "Integración creada correctamente.",
    updated: "Integración actualizada.",
    deleted: "Integración eliminada.",
    sync_ok: "Sincronización completada.",
    test_ok: "La conexión funciona correctamente.",
  },
  errors: {
    details: "estado {status}",
    detailsCode: "código {code}",
    rateLimit: "Límite de peticiones alcanzado. Inténtalo de nuevo en unos minutos.",
    invalid: "Revisa los campos: hay datos no válidos.",
    db: "No pudimos guardar los cambios. Inténtalo de nuevo.",
    unexpected: "Se produjo un error inesperado al procesar la integración.",
  },
  notSynced: "Sin sincronizar",
  integrations: "Integraciones",
  viewAgents: "Ver agentes",
  internalLabel: "Etiqueta interna",
  keepActive: "Mantener activa",
  saveChanges: "Guardar cambios",
  active: "Activa",
  paused: "En pausa",
  sync: {
    syncing: "Sincronizando...",
    imported: "Productos importados: {count}.",
    failed: "Falló la sincronización. Revisa los detalles del error y vuelve a intentarlo.",
    retry: "Reintentar sincronización",
    syncNow: "Sincronizar productos ahora",
    status: "Estado de la sincronización",
    productsIndexed: "Productos indexados",
    lastSync: "Última sincronización",
    importing:
      "Importando productos desde {provider} a Supabase. Esto puede tardar unos minutos.",
    progress: "Progreso estimado {percent}%",
    webhookUrl: "URL del webhook",
    pause: "Pausar",
    activate: "Activar",
    test: "Probar conexión",
    testing: "Probando...",
    delete: "Eliminar",
  },
  woo: {
    errors: {
      unauthorized:
        "Credenciales no válidas o permisos insuficientes. Regenera la API key de Woo con permiso de lectura.",
      forbidden:
        "Bloqueado por la seguridad o el WAF. Permite /wp-json/wc/v3 desde Vercel.",
      notFound:
        "La ruta REST de Woo no está disponible. Revisa los enlaces permanentes y WooCommerce.",
      server: "El servidor de la tienda devolvió un error.",
      generic:
        "Falló la sincronización. Verifica las credenciales e inténtalo de nuevo.",
    },
    title: "Centro de conexiones de WooCommerce",
    intro:
      "Conecta tiendas, prueba credenciales, sincroniza productos y pon los datos del catálogo a disposición de tus agentes.",
    stats: {
      stores: "Tiendas",
      activeOne: "1 conexión activa.",
      activeMany: "{count} conexiones activas.",
      productsIndexed: "Productos indexados",
      productsDetail: "Disponibles para los agentes tras sincronizar.",
      healthy: "Sincronizaciones correctas",
      healthyDetail: "Tiendas cuya última sincronización de productos fue correcta.",
    },
    connectTitle: "Conecta una tienda",
    connectIntro:
      "Añade una API key REST de WooCommerce de solo lectura. Los secretos se cifran y no se vuelven a mostrar.",
    labelPlaceholder: "Tienda principal",
    storeUrl: "URL de la tienda",
    consumerKey: "Consumer key",
    consumerSecret: "Consumer secret",
    activateTitle: "Activar al guardar",
    activateBody:
      "Los agentes pueden usar este catálogo en cuanto se prueben las credenciales y se sincronicen los productos.",
    save: "Guardar conexión",
    oneClick: {
      title: "Conecta en un clic",
      intro:
        "Escribe la dirección de tu tienda y aprueba el acceso en WordPress. Nosotros configuramos las claves, las actualizaciones de productos y la primera sincronización.",
      labelOptional: "Nombre (opcional)",
      connect: "Conectar con WooCommerce",
      permissions:
        "WooCommerce pedirá acceso de lectura y escritura. La escritura solo se usa para registrar avisos de cambios en productos: nunca modificamos tus productos ni pedidos.",
      manualToggle: "Prefiero pegar las claves de la API a mano",
      connected:
        "Tienda conectada. Estamos importando tus productos, puede tardar unos minutos. Después asigna la tienda a un agente.",
      denied: "No se aprobó el acceso en WooCommerce, así que no se ha conectado nada.",
      notWoo: "No encontramos WooCommerce en esa dirección. Revisa la URL de tu tienda.",
      unreachable: "No pudimos acceder a esa dirección. Revisa la URL e inténtalo de nuevo.",
    },
    guideTitle: "Guía de configuración",
    steps: [
      {
        title: "Escribe la URL de tu tienda",
        detail: "La dirección pública de tu tienda WooCommerce, por ejemplo https://mitienda.com.",
      },
      {
        title: "Aprueba el acceso en WordPress",
        detail:
          "Inicia sesión si te lo pide y pulsa Aprobar. Las claves se crean y se cifran solas.",
      },
      {
        title: "Asígnala a un agente",
        detail:
          "Los productos se sincronizan solos y se mantienen al día. Después elige la tienda en el espacio de trabajo de un agente.",
      },
    ],
    connectedEyebrow: "Tiendas conectadas",
    connectedTitle: "Fuentes de catálogo de WooCommerce",
    connectedIntro:
      "Cada conexión se puede probar, sincronizar, pausar, editar o asignar desde el espacio de trabajo de un agente.",
    assign: "Asignar",
    products: "Productos",
    lastSync: "Última sincronización",
    status: "Estado",
    editCredentials: "Editar credenciales",
    keepKey: "Déjalo vacío para mantener la clave actual",
    keepSecret: "Déjalo vacío para mantener el secreto actual",
    emptyTitle: "Aún no hay ninguna tienda WooCommerce conectada.",
    emptyBody:
      "Conecta tu tienda desde el formulario. Tras la primera sincronización, los agentes podrán responder con contexto de productos y stock.",
  },
  shopify: {
    errors: {
      unauthorized: "Token no válido o revocado. Vuelve a conectar la tienda.",
      forbidden: "Faltan permisos de acceso. Actualiza los scopes y vuelve a conectar.",
      notFound: "Tienda no encontrada o dominio no válido.",
      server: "Shopify devolvió un error del servidor.",
      generic: "Falló la sincronización. Verifica la conexión e inténtalo de nuevo.",
    },
    title: "Gestiona tus conexiones de Shopify",
    intro:
      "Guarda el token de cada tienda para que tus agentes respondan con datos del catálogo y disponibilidad en tiempo real.",
    registerTitle: "Registra una nueva tienda",
    encrypted:
      "Los tokens OAuth de Shopify se cifran con tu {key} y nunca se muestran completos.",
    labelPlaceholder: "Shopify principal",
    shopDomain: "Dominio de la tienda",
    activeOnCreate: "Marcar como activa al crearla",
    connect: "Conectar Shopify",
    oauthTitle: "¿Cómo funciona OAuth?",
    oauthSteps: [
      "Introduce el dominio de la tienda y pulsa Conectar Shopify.",
      "Se te redirigirá a Shopify para aprobar el acceso.",
      "Tras la aprobación, la conexión aparecerá en la lista de la derecha.",
    ],
    registeredTitle: "Integraciones registradas",
    registeredIntro:
      "Asigna estas conexiones desde la página de detalle del agente para activar los datos de Shopify.",
    editIntegration: "Editar integración",
    shopDomainReauth: "Dominio de la tienda (requiere reautorizar si cambia)",
    emptyTitle: "Todavía no has conectado ninguna tienda.",
    emptyBody:
      "Crea tu primera integración siguiendo los pasos de la izquierda y después asígnala a un agente desde su página de detalle.",
  },
};
