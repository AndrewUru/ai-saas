"use client";

import Link from "next/link";
import { useAgents } from "./hooks/useAgents";
import { Card } from "@/components/ui/Card";

type Props = {
  planLimitLabel: string;
};

export default function AgentsSection({ planLimitLabel }: Props) {
  const { data, isLoading, isError } = useAgents();
  const agents = data ?? [];
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) => agent.is_active).length;

  return (
    <section className="space-y-6" data-oid="lu:-88d">
      <div className="grid gap-4 sm:grid-cols-3" data-oid="ioh0f4a">
        <StatCard
          label="Agentes creados"
          value={isLoading ? "-" : totalAgents}
          helper={
            isLoading
              ? "Cargando tus agentes..."
              : totalAgents === 0
                ? "Aun no has creado ningun agente."
                : "Todos tus agentes estan listos en WooCommerce."
          }
          data-oid="q-2n.nx"
        />

        <StatCard
          label="Agentes activos"
          value={isLoading ? "-" : activeAgents}
          helper={
            isLoading
              ? "Calculando estado..."
              : activeAgents === totalAgents
                ? "Todos tus agentes estan activos."
                : "Activa los agentes que necesites desde su ficha."
          }
          data-oid="npzqtff"
        />

        <StatCard
          label="Limite de mensajes"
          value={planLimitLabel}
          helper="Controla tus mensajes desde los reportes semanales."
          data-oid="swq4kpj"
        />
      </div>

      <Card className="p-7" strong data-oid="-0zf-8r">
        <div
          className="flex flex-wrap items-start justify-between gap-4"
          data-oid="8f0zq3."
        >
          <div data-oid="imr64r5">
            <h2 className="text-xl font-semibold text-white" data-oid="mz_h.db">
              Tus agentes
            </h2>
            <p className="mt-1 text-sm text-slate-300" data-oid="oo3-ux-">
              Gestiona las integraciones, copia las API keys y revisa el limite
              de mensajes de cada agente.
            </p>
          </div>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20"
            data-oid="39yaa0d"
          >
            Ver agentes
          </Link>
        </div>

        {isError && (
          <div
            className="mt-6 rounded-2xl border border-dashed border-red-500/60 bg-red-500/10 p-6 text-sm text-red-100"
            data-oid="oj_6vi9"
          >
            No pudimos cargar tus agentes. Intentalo de nuevo en unos segundos.
          </div>
        )}

        {!isError && totalAgents === 0 && !isLoading && (
          <div
            className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-300"
            data-oid="xm8pwt-"
          >
            <p className="font-medium text-white" data-oid="f3tz1mg">
              Todavia no tienes agentes configurados.
            </p>
            <p className="mt-2" data-oid="tzq6n80">
              Crea tu primer agente para conectar WooCommerce y empezar a
              responder chats automaticamente.
            </p>
            <Link
              href="/agents"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              data-oid="wl9.y-8"
            >
              Crear agente
            </Link>
          </div>
        )}

        {!isError && totalAgents > 0 && (
          <ul className="mt-6 space-y-4" data-oid="b0u4dxy">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <AgentSkeleton key={index} data-oid="tj3_ati" />
                ))
              : agents.slice(0, 5).map((agent) => {
                  const statusColor = agent.is_active
                    ? "bg-emerald-400"
                    : "bg-slate-500";
                  const statusText = agent.is_active ? "Activo" : "Pausado";
                  return (
                    <li
                      key={agent.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 sm:flex-row sm:items-center sm:justify-between"
                      data-oid="9d8q1ye"
                    >
                      <div className="space-y-1" data-oid="g3wu9kx">
                        <div
                          className="flex items-center gap-2"
                          data-oid="iiemg1s"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
                            data-oid="p564ufu"
                          />

                          <span
                            className="text-base font-semibold text-white"
                            data-oid="5_666:c"
                          >
                            {agent.name || "Sin nombre"}
                          </span>
                          <span
                            className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-400"
                            data-oid="7rmyv1-"
                          >
                            {statusText}
                          </span>
                        </div>
                        <p
                          className="text-xs text-slate-400"
                          data-oid="h0bk39o"
                        >
                          API Key:{" "}
                          <span
                            className="font-mono text-slate-200"
                            data-oid="d_:cjo8"
                          >
                            {(agent.api_key ?? "N/A").slice(0, 6)}...
                          </span>
                        </p>
                        <p
                          className="text-xs text-slate-400"
                          data-oid="u3iu--n"
                        >
                          Limite de mensajes:{" "}
                          {agent.messages_limit ?? "Sin limite"}
                        </p>
                      </div>
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
                        data-oid="w_cw22u"
                      >
                        Configurar
                      </Link>
                    </li>
                  );
                })}
            {totalAgents > 5 && !isLoading && (
              <li
                className="text-center text-xs text-slate-400"
                data-oid="vc6k3aq"
              >
                Mostramos tus 5 agentes mas recientes. Consulta el listado
                completo en la seccion de agentes.
              </li>
            )}
          </ul>
        )}
      </Card>
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card padded data-oid="vunbzju">
      <p
        className="text-xs uppercase tracking-[0.24em] text-slate-400"
        data-oid="80d8vu-"
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white" data-oid="n22u9tq">
        {value}
      </p>
      <p className="text-xs text-slate-400" data-oid="6yjapt_">
        {helper}
      </p>
    </Card>
  );
}

function AgentSkeleton() {
  return (
    <li
      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 sm:flex-row sm:items-center sm:justify-between"
      data-oid="ylh.-4i"
    >
      <div className="space-y-2" data-oid="aa56kkq">
        <div className="flex items-center gap-3" data-oid="meaju8s">
          <span
            className="h-2.5 w-2.5 rounded-full bg-slate-700"
            data-oid=".sxikcb"
          />

          <span className="h-4 w-32 rounded bg-slate-800" data-oid="kz6q774" />
          <span
            className="h-5 w-16 rounded-full bg-slate-800"
            data-oid="x0dj1lu"
          />
        </div>
        <div className="h-3 w-44 rounded bg-slate-800" data-oid="d-h0rh9" />
        <div className="h-3 w-36 rounded bg-slate-800" data-oid="w2.ywl:" />
      </div>
      <span className="h-8 w-28 rounded-full bg-slate-800" data-oid="3_ucf4f" />
    </li>
  );
}
