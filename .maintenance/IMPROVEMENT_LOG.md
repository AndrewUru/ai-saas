# Weekly UI/UX Improvement Log

This log tracks weekly design/product PRs created by the automation. Each entry should describe the user-facing improvement, the design reason, touched files, and validation status.

## 2026-06-18 - Create a reusable EmptyState component and use it for agent workspaces

Priority: P1
Area: Dashboard

Design reason: Repeated empty states should feel intentional and guide the next action clearly.

Files:
- components/ui/EmptyState.tsx
- app/dashboard/AgentsSection.tsx

Acceptance:
- A reusable EmptyState UI component exists.
- The dashboard agent empty state uses the shared component.
- The call to action remains visible on mobile and desktop.

Applied changes:
- components/ui/EmptyState.tsx: created
- app/dashboard/AgentsSection.tsx: import added
- app/dashboard/AgentsSection.tsx: updated

## 2026-07-06 - Upgrade integration empty states with provider-specific CTAs

Priority: P1
Area: Integrations

Design reason: When no store is connected, users need a direct next step, not only a passive message.

Files:
- app/dashboard/integrations/page.tsx

Acceptance:
- WooCommerce and Shopify empty states include a clear action.
- The action label names the provider.
- The panel still works with existing connection summaries.

Applied changes:
- app/dashboard/integrations/page.tsx: updated

## 2026-07-13 - Improve button sizing and label stability on narrow screens

Priority: P2
Area: Design system

Design reason: Buttons should not shift, clip, or feel inconsistent across dense SaaS panels.

Files:
- app/globals.css

Acceptance:
- Buttons have stable minimum dimensions.
- Icon and text alignment stays predictable.
- Focus styles remain visible.

Applied changes:
- app/globals.css: updated
