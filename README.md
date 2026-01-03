# AI Commerce Agents

AI Commerce Agents is a **multi-tenant SaaS platform** for building **AI-powered shopping assistants** for e-commerce stores.

It combines a **dashboard** for managing agents and integrations with a **lightweight embeddable chat widget** that works on any site via a single script.

---

## ✨ What does it do?

- Create AI shopping assistants per store
- Sync product catalogs from external platforms
- Answer customer questions in real time using structured data
- Embed the assistant on any website with one `<script>`

Designed for **scale, performance, and clean UX**.

---

## 🧠 Core Features

### AI Agents

- Multiple agents per user (multi-tenant)
- Each agent has:
  - Unique API key
  - Usage & message limits
  - Allowed domains
  - Widget configuration
- Conversations powered by OpenAI + LangChain

---

### 💬 Embeddable Chat Widget

Install with one line:

```html
<script src="/api/widget?key=YOUR_AGENT_KEY"></script>
```

Features

Custom colors & branding

Welcome messages & texts

Left / right positioning

Mobile-first responsive layout

Product cards (image, price, stock)

Structured JSON responses (no raw markdown)

🛒 E-commerce Integrations
WooCommerce (current)

Secure REST API integration

Handles large catalogs (thousands of products)

Products are:

Indexed once per store

Synced asynchronously

Supports:

Manual sync

Webhooks

Cron-friendly reconciliation

Shopify support is being added following the same architecture.

💳 Billing

PayPal subscriptions

Webhooks activate / deactivate plans

Usage logs per agent enforce limits

🧱 Architecture Overview

Client Store (Woo / WP / Custom)
↓
Embeddable Widget
↓
/api/agent/chat → OpenAI
↓
Supabase (Auth + Database)

Key principles

Multi-tenant by design

Product data is decoupled from chat

Heavy operations run backend-only

Third-party credentials are never exposed to the frontend

📁 Project Structure
app/
agents/ # Agent pages & config
integrations/
woo/ # WooCommerce UI + actions
api/
agent/chat/ # Chat endpoint (widget)
widget/route.ts # Widget loader
integrations/
woocommerce/
sync/
webhook/
reconcile/
paypal/ # Billing & webhooks
dashboard/ # Main panel

lib/
woo/ # Woo client & sync logic
widget/ # Widget rendering & defaults
auth/ # Auth helpers
crypto.ts # Credential encryption

supabase/
migrations/ # DB schema & indexes

🗄️ Database Notes

Products are indexed per integration

Optimized for:

Many users

Many stores

Large catalogs

Designed to support:

Incremental syncs

Safe re-syncs

Future vector search (pgvector)

🔐 Environment Variables

Create .env.local (do not commit):

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# PayPal

NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_ENV=sandbox

# Supabase (server)

SUPABASE_URL=
SUPABASE_SERVICES_ROLE_KEY=

# AI

OPENAI_API_KEY=

# Security

CRED_ENC_KEY=

# OAuth

SUPABASE_GOOGLE_CLIENT_ID=
SUPABASE_GOOGLE_CLIENT_SECRET=

⚠️ Update NEXT_PUBLIC_SITE_URL if the production domain changes.

🛠️ Scripts

npm install
npm run dev
npm run build
npm run start
npm run lint

Woo sync:
npm run sync:woo

🧪 Local Development Flow

npm run dev

Visit http://localhost:3000

Sign in with Supabase Auth

Create an agent

Add a WooCommerce integration

Sync products

Embed the widget on any site

🚀 Deployment

Hosting: Vercel

Production URL:
https://ai-saas-nine-omega.vercel.app/

Make sure:

Environment variables are set in Vercel

Supabase is connected

PayPal webhooks point to /api/paypal/webhook

🤝 Contributing

Contributions and feedback are welcome.

Workflow

Fork or create a branch

Apply changes (+ migrations if needed)

Run npm run lint

Open a PR explaining:

What changed

Any API or DB impact

Required env vars

🔍 Key Entry Points

app/api/widget/route.ts

app/api/agent/chat/

lib/woo/

app/agents/[id]/WidgetDesigner.tsx
