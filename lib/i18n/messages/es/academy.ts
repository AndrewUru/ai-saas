import type { academy as enAcademy, loading as enLoading } from "../en/academy";

export const academy: typeof enAcademy = {
  meta: { title: "Academia" },
  badge: "Academia",
  title: "Crea mejores agentes para e-commerce, más rápido.",
  intro:
    "Guías prácticas, playbooks de implementación y checklists reutilizables para lanzar experiencias de IA fiables en las tiendas de tus clientes.",
  stats: { guides: "Guías", levels: "Niveles", topics: "Temas" },
  libraryEyebrow: "Biblioteca de recursos",
  libraryTitle: "Aprende a tu ritmo",
  libraryDescription:
    "Busca por objetivo, filtra la biblioteca por nivel de experiencia o explora un tema concreto.",
  levels: {
    all: "Todos los niveles",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  },
  library: {
    search: "Buscar recursos",
    searchPlaceholder: "Busca guías, objetivos o temas...",
    level: "Nivel",
    topic: "Tema",
    allTopics: "Todos los temas",
    showing: "Mostrando {count} de {total} recursos",
    clearFilters: "Quitar filtros",
    noMatchTitle: "Ningún recurso coincide con tus filtros",
    emptyTitle: "Todavía no hay recursos disponibles",
    noMatchBody:
      "Prueba una búsqueda más amplia o quita los filtros activos para ver toda la biblioteca de la Academia.",
    emptyBody:
      "Estamos preparando nuevas guías prácticas. Cuéntanos qué tema te ayudaría más.",
    suggest: "Sugerir un tema",
  },
  post: {
    back: "← Volver a la Academia",
    previous: "← Anterior: {title}",
    next: "Siguiente: {title} →",
  },
};

export const loading: typeof enLoading = {
  default: "Preparando tu espacio",
  app: "Cargando tu experiencia",
  dashboard: "Sincronizando tu espacio",
  academy: "Preparando los recursos de la Academia",
};
