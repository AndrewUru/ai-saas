import type { integrations as en } from "../en/integrations";

export const integrations: typeof en = {
  notSynced: "Aún sin sincronizar",
  unnamed: "Integración sin nombre",
  provider: "Proveedor",
  activeCount: "{active}/{total} activas",
  connect: "Conectar",
  manage: "Gestionar",
  connections: "Conexiones",
  indexedProducts: "Productos indexados",
  lastSync: "Última sincronización",
  emptyTitle: "Aún no hay ninguna conexión con {provider}",
  emptyBody:
    "Añade tu primera tienda para empezar a sincronizar productos y que las respuestas del agente sean más útiles.",
  connectProvider: "Conectar {provider}",
  recent: "Conexiones recientes",
  showingLatest: "Mostrando las 3 conexiones más recientes.",
  eyebrow: "Integraciones",
  title: "Conecta tus tiendas",
  subtitle: "Gestiona las conexiones de WooCommerce y Shopify que usan tus agentes.",
  viewDocs: "Ver documentación",
  loadError: "No pudimos cargar las integraciones. Recarga la página.",
  totalConnections: "Conexiones totales",
  activeConnections: "Conexiones activas",
  allActive: "Todas las tiendas están activas",
  somePaused: "Algunas tiendas están en pausa",
  productsIndexed: "Productos indexados",
  acrossStores: "En todas las tiendas",
  woo: {
    description: "Sincroniza inventario, pedidos y clientes de tiendas Woo.",
    missing: "URL de la tienda sin configurar",
  },
  shopify: {
    description: "Mantén sincronizados los catálogos y pedidos de Shopify.",
    missing: "Dominio de la tienda sin configurar",
  },
};
