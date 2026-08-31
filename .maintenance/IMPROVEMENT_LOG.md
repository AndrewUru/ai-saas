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

## 2026-08-27 - Make the Academy empty state match its cause

ID: academy-empty-state-context
Priority: P1
Area: Academy
Category: empty-state

Problem: The Academy always tells users to clear filters and shows a Clear filters button, even when the library itself has no published resources and there are no filters to clear.

Solution: Show filter-recovery guidance only when filters are active, and show a distinct no-content message with a contact action when the library is genuinely empty.

Files:
- app/academy/AcademyLibrary.tsx

Acceptance:
- Active filters produce a no-results message with a working Clear filters action.
- An empty unfiltered library explains that resources are not available yet.
- The unfiltered empty state offers a relevant contact action instead of a no-op button.

Applied changes:
- Split the Academy empty state into filtered-no-results and genuinely-empty variants with relevant actions.

Validation: Pending GitHub Actions (`npm ci`, lint, build).
