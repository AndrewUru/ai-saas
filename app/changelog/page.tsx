type Entry = {
  date: string;
  title: string;
  items: string[];
};

const entries: Entry[] = [
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
    title: "Integraciones WooCommerce",
    items: [
      "Registro de tiendas con credenciales cifradas y control de dominios permitidos.",
      "Asignación rápida desde la ficha del agente y validación en tiempo real.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="bg-slate-950 text-slate-100" data-oid="wa.yo9j">
      <section
        className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="p:wb7a."
      >
        <header className="space-y-3" data-oid="usbmcr-">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            data-oid=":dvx0b1"
          >
            Novedades
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="y6_-rwd">
            Historial de actualizaciones
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="u5j77v7">
            Cada semana añadimos mejoras para agencias que integran AI SaaS en
            sus tiendas online. Revisa los cambios recientes y comparte el
            roadmap con tu equipo.
          </p>
        </header>

        <div className="mt-12 space-y-8" data-oid="r8iwreq">
          {entries.map((entry) => (
            <article
              key={entry.date}
              className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
              data-oid="-et6.si"
            >
              <header
                className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                data-oid="hfisuay"
              >
                <h2
                  className="text-lg font-semibold text-white"
                  data-oid="9ahx7wt"
                >
                  {entry.title}
                </h2>
                <span
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
                  data-oid="mhwjt4_"
                >
                  {entry.date}
                </span>
              </header>
              <ul
                className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-300"
                data-oid="4nq319-"
              >
                {entry.items.map((item) => (
                  <li key={item} data-oid="bq0w:u3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
