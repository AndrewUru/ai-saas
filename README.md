![logo](https://github.com/user-attachments/assets/17dcd404-3e45-4678-b652-98171c0587be)# AI Commerce Agents – SaaS Dashboard & Widget






Multi-tenant panel for creating agents that serve online stores and an embeddable widget that integrates into WooCommerce/WordPress, Shopify, or other frontends with a single `<script>`. The stack combines **Next.js 15 (App Router)**, **Supabase** for auth/DB, and **LangChain/OpenAI** for the conversational layer.

## ⚙️ Key Features

- Authenticated dashboard (Supabase SSR) to create and manage agents, allowed domains, and message limits.
- Automatic API Key generation per agent with ready-to-copy snippet (`/api/widget?key=...`).
- Complete widget customization (color, branding, text, position) with real-time preview.
- Secure API (`/api/agent/chat`) that connects with LangChain/OpenAI respecting each plan's limits.
- WooCommerce integrations stored in Supabase and validated before linking to an agent.
- Billing with PayPal Subscriptions and webhooks to register active plans.

## 📦 Quick Structure

```
app/
  agents/            # List + detailed view of each agent
  api/
    widget/route.ts  # Embeddable script that builds the chat on remote frontend
    agent/chat/      # Endpoint that handles widget messages
    paypal/*         # Subscriptions and webhooks
  dashboard/         # Panel home with metrics and generic snippet
lib/
  site.ts            # Centralized siteUrl and host resolution
  widget/defaults.ts # Defaults + sanitizers shared by API and UI
supabase/
  migrations/        # Schema changes (agents, integrations, billing, etc.)
```

## 🔐 Environment Variables

Create `.env.local` following the example below (do not commit to repo):

```
NEXT_PUBLIC_SITE_URL=https://ai-saas-nine-omega.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
INTEGRATIONS_SYNC_SECRET=...
INTEGRATIONS_RECONCILE_SECRET=...
```

> If you change the production domain, update `NEXT_PUBLIC_SITE_URL` so the widget and snippet links point to the correct host.

## 🛠️ Scripts

```bash
npm install         # Install dependencies
npm run dev         # Start Next.js in development mode
npm run build       # Build for production
npm run start       # Serve the generated build
npm run lint        # ESLint (TS/React)
npm run sync:woo    # Trigger a WooCommerce product sync
```

## WooCommerce sync

- Run migrations to enable the pgvector extension and Woo tables.
- Use the Integrations page to sync products and copy the webhook URL.
- Webhook endpoint: `/api/integrations/woocommerce/webhook?integration_id=...&token=...`
- Reconcile endpoint (cron-friendly): POST `/api/integrations/woocommerce/reconcile`
  with `Authorization: Bearer $INTEGRATIONS_RECONCILE_SECRET`.
- Local sync script: `INTEGRATION_ID=... npm run sync:woo`

## 🗃️ Migrations

The project uses Supabase migrations located in `supabase/migrations`. To apply them:

```bash
supabase db push           # Requires Supabase CLI
# or, if working directly against Postgres:
psql $DATABASE_URL -f supabase/migrations/<timestamp>_*.sql
```

Make sure to run migrations before starting the dashboard locally to avoid incomplete selects (e.g., agent's `widget_*` fields).

## 🧪 Recommended Development Flow

1. Run `npm run dev` and visit `http://localhost:3000`.
2. Sign in via Supabase Auth (email magic link).
3. From `/agents` create an agent, define domains, and customize the widget.
4. Copy the URL shown in the snippet and test it on another site/iframe with `?key=...`.
5. Use the endpoints in `app/api` if you need debugging (`app/api/_debug/validate` has internal tools).

## 🚀 Deployment

- **Official production**: `https://ai-saas-nine-omega.vercel.app/`
- Recommended deployment on [Vercel](https://vercel.com/) with the same environment variables as local.
- Connect the project to Supabase and configure PayPal webhooks pointing to the public domain (`/api/paypal/webhook`).

## 🤝 Contributing

1. Fork / branch.
2. Apply changes + tests (`npm run lint`).
3. Open PR explaining the impact (UI, API, migrations) and any manual steps needed (e.g., new env vars).

---

> Questions? Check `app/api/widget/route.ts` and `app/agents/[id]/WidgetDesigner.tsx` to understand how the widget is composed and how customization is persisted, or contact the platform team. 🧩
