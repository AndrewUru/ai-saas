# AI Commerce Agents – SaaS Dashboard & Widget

Panel multi-tenant para crear agentes que atienden tiendas online y un widget embebible que se integra en WooCommerce/WordPress, Shopify u otros frontends con un solo `<script>`. El stack combina **Next.js 15 (App Router)**, **Supabase** para auth/DB y **LangChain/OpenAI** para la capa conversacional.

## ⚙️ Características principales

- Dashboard autenticado (Supabase SSR) para crear y administrar agentes, dominios permitidos y límites de mensajes.
- Generación automática de API Keys por agente y snippet listo para copiar (`/api/widget?key=...`).
- Personalización completa del widget (color, branding, textos, posición) con vista previa en tiempo real.
- API segura (`/api/agent/chat`) que conecta con LangChain/OpenAI respetando los límites de cada plan.
- Integraciones WooCommerce almacenadas en Supabase y validadas antes de vincularse a un agente.
- Billing con PayPal Subscriptions y webhooks para registrar planes activos.

## 📦 Estructura rápida

```
app/
  agents/            # Listado + ficha detallada de cada agente
  api/
    widget/route.ts  # Script embebible que construye el chat en el frontend remoto
    agent/chat/      # Endpoint que atiende los mensajes del widget
    paypal/*         # Suscripciones y webhooks
  dashboard/         # Home del panel con métricas y snippet genérico
lib/
  site.ts            # Resolución centralizada de siteUrl y host
  widget/defaults.ts # Defaults + sanitizadores compartidos por API y UI
supabase/
  migrations/        # Cambios de esquema (agents, integraciones, billing, etc.)
```

## 🔐 Variables de entorno

Crea `.env.local` siguiendo el ejemplo de abajo (no subir al repo):

```
NEXT_PUBLIC_SITE_URL=https://ai-saas-nine-omega.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

> Si cambias el dominio de producción, actualiza `NEXT_PUBLIC_SITE_URL` para que el widget y los enlaces de snippet apunten al host correcto.

## 🛠️ Scripts

```bash
npm install         # Instala dependencias
npm run dev         # Levanta Next.js en modo desarrollo
npm run build       # Compila para producción
npm run start       # Sirve la build generada
npm run lint        # ESLint (TS/React)
```

## 🗃️ Migraciones

El proyecto usa las migraciones de Supabase que viven en `supabase/migrations`. Para aplicarlas:

```bash
supabase db push           # Requiere CLI de Supabase
# o, si trabajas directamente contra Postgres:
psql $DATABASE_URL -f supabase/migrations/<timestamp>_*.sql
```

Asegúrate de ejecutar las migraciones antes de arrancar el dashboard localmente para evitar selects incompletos (p.ej. los campos `widget_*` del agente).

## 🧪 Flujo de desarrollo recomendado

1. `npm run dev` y visita `http://localhost:3000`.
2. Inicia sesión vía Supabase Auth (email magic link).
3. Desde `/agents` crea un agente, define dominios y personaliza el widget.
4. Copia la URL que aparece en el snippet y pruébala en otro sitio/iframe con `?key=...`.
5. Usa los endpoints en `app/api` si necesitas debug (`app/api/_debug/validate` tiene herramientas internas).

## 🚀 Despliegue

- **Producción oficial**: `https://ai-saas-nine-omega.vercel.app/`
- Deploy recomendado en [Vercel](https://vercel.com/) con las mismas variables de entorno que en local.
- Conecta el proyecto a Supabase y configura los webhooks de PayPal apuntando al dominio público (`/api/paypal/webhook`).

## 🤝 Contribuciones

1. Fork / branch.
2. Aplica cambios + tests (`npm run lint`).
3. Abre PR explicando el impacto (UI, API, migrations) y cualquier paso manual necesario (p.ej. nuevas env vars).

---

> ¿Dudas? Revisa `app/api/widget/route.ts` y `app/agents/[id]/WidgetDesigner.tsx` para entender cómo se compone el widget y cómo se persiste la personalización, o contacta al equipo de plataforma.                                                             🧩
