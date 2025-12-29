AI Commerce Agents – SaaS Dashboard & Widget

AI Commerce Agents is a multi-tenant SaaS platform for creating AI-powered shopping assistants for e-commerce stores.

It provides:

A dashboard to manage agents and store integrations

A lightweight embeddable chat widget that works with WooCommerce, WordPress, Shopify, or any custom frontend via a single <script>

The platform is designed to scale across thousands of products and multiple stores per user, with a strong focus on UX, security, and performance.

🎯 Project Context & Technical Motivation

This project is being built as a real-world learning-driven SaaS, evolving from solid fundamentals in HTML, CSS, and basic JavaScript into a full-stack application using modern tooling and production-grade workflows.

Rather than being a demo or tutorial project, AI Commerce Agents focuses on solving real product problems:

Multi-tenant architecture

External platform integrations (WooCommerce)

Asynchronous data syncing

Secure API boundaries

Scalable data models

Production deployments

Development is done using a vibecoding approach, with the OpenAI extension acting as a technical copilot for:

Architecture exploration

Refactoring guidance

Understanding trade-offs

Improving code clarity and structure

All final decisions, implementation details, and validations are handled manually to ensure learning-by-doing and deep understanding of the stack.

This repository reflects an active, evolving engineering process, where features are added incrementally as new concepts are learned and applied.

🧩 Core Capabilities
🧠 AI Agents

Multiple agents per user (multi-tenant).

Each agent has:

Unique API key

Message & usage limits

Allowed domains

Widget configuration

Conversations powered by OpenAI + LangChain, enforced per plan.

💬 Embeddable Chat Widget

Installed via a single script:

<script src="/api/widget?key=..."></script>

Fully customizable:

Colors & branding

Texts & welcome message

Position (left / right)

Modern UX:

Product cards with image thumbnails

Structured JSON responses (no raw markdown)

Typing indicators & loading states

Mobile-first responsive layout

🛒 WooCommerce Product Sync (Scalable)

Secure WooCommerce REST API integration per store.

Initial sync supports thousands of products.

Incremental updates via:

Webhooks

Reconciliation endpoint (cron-friendly)

Products:

Stored once per integration

Indexed for fast lookup

Designed for:
many users × many stores × large catalogs

💳 Billing & Plans

PayPal subscriptions.

Webhooks to activate / deactivate plans.

Usage logs per agent to enforce limits.

🧱 Architecture Overview
Client Store (Woo / WP / Custom)
│
▼
Embeddable Widget (<script>)
│
▼
/api/agent/chat ─────▶ OpenAI / LangChain
│
▼
Supabase (Auth + DB)
│
├─ agents
├─ integrations_woocommerce
├─ woo_products (indexed, scalable)
├─ usage_logs
└─ subscriptions

Key Architectural Decisions

Multi-tenant by design (user → agents → integrations).

Product data is decoupled from chat, synced asynchronously.

Chat responses use structured JSON, rendered as UI components.

Heavy operations (sync, reconcile) are backend-only and secured.

Frontend never accesses third-party credentials directly.

📦 Project Structure
app/
agents/ # Agent list + detail pages
integrations/
woo/ # WooCommerce integrations UI
api/
agent/chat/ # Chat endpoint used by widget
widget/route.ts # Embeddable widget loader
integrations/
woocommerce/
sync/ # Manual sync trigger
webhook/ # WooCommerce webhooks
reconcile/ # Cron-friendly reconciliation
paypal/ # Subscriptions + webhooks
dashboard/ # Main panel & metrics

lib/
site.ts # Centralized siteUrl + host resolution
widget/defaults.ts # Widget defaults & sanitizers
woo/ # Woo helpers (URL builder, client, sync logic)

supabase/
migrations/ # Schema & index migrations

🗄️ Database & Scaling Notes
woo_products

Unique per (integration_id, woo_product_id)

Indexed for:

Fast lookup by integration

Incremental sync (updated_at)

Vector search (pgvector) when embeddings are enabled

This allows:

Thousands of products per store

Multiple stores per user

Safe re-syncs without duplication

🔐 Environment Variables

Create a .env.local file (do not commit):

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

⚠️ If you change the production domain, update NEXT_PUBLIC_SITE_URL so widget snippets and webhooks point to the correct host.

🛠️ Scripts
npm install # Install dependencies
npm run dev # Local development
npm run build # Production build
npm run start # Serve build
npm run lint # ESLint / TypeScript checks

npm run sync:woo # Manually trigger a WooCommerce sync

🔄 WooCommerce Integration Flow

Create an integration from the dashboard.

Paste Consumer Key / Secret (stored encrypted).

Run initial sync (products indexed in background).

Copy the webhook URL into WooCommerce.

(Optional) Set up a cron job using the reconcile endpoint.

Endpoints

Webhook

/api/integrations/woocommerce/webhook?integration_id=...&token=...

Reconcile (cron)

POST /api/integrations/woocommerce/reconcile
Authorization: Bearer $INTEGRATIONS_RECONCILE_SECRET

🧪 Recommended Dev Flow

npm run dev

Visit http://localhost:3000

Sign in via Supabase Auth

Create an agent and customize the widget

Add a WooCommerce integration and sync products

Copy the widget snippet and test it on any site

🚀 Deployment

Production: https://ai-saas-nine-omega.vercel.app/

Hosting: Vercel

Make sure:

Supabase project is connected

PayPal webhooks point to /api/paypal/webhook

Secrets are set in Vercel Environment Variables

🤝 Contributing

Contributions, feedback, and architectural suggestions are welcome.

Flow:

Fork / create a branch

Apply changes (+ migrations if needed)

Run npm run lint

Open a PR describing:

UI changes

API changes

Required env vars or migrations

🔍 Entry Points for Deep Dive

app/api/widget/route.ts

app/api/agent/chat/

lib/woo/

app/agents/[id]/WidgetDesigner.tsx
