export const dashCommon = {
  unnamedAgent: "Unnamed Agent",
  active: "Active",
  paused: "Paused",
  loading: "Loading",
  unlimited: "Unlimited",
  noExpiry: "No expiry",
  openWorkspace: "Open workspace",
};

export const home = {
  suggestions: {
    faq: {
      title: "Add a shipping and returns answer",
      reason:
        "Several ecommerce chats usually stall on delivery times, refunds, or exchanges.",
      action: "Create FAQ",
    },
    rule: {
      title: "Create a product recommendation rule",
      reason:
        "Guide the agent to ask budget, use case, and urgency before recommending items.",
      action: "Add rule",
    },
    handoff: {
      title: "Define human handoff triggers",
      reason:
        "Escalate complaints, order changes, and refund intent before the customer repeats themselves.",
      action: "Review",
    },
  },
  cards: {
    revenue: {
      label: "Revenue opportunities",
      helper: "Chats mentioning price, stock, shipping, size, or returns.",
    },
    training: {
      label: "Training suggestions",
      helper: "Prompt, FAQ, or workflow improvements ready to review.",
    },
    followups: {
      label: "Human follow-ups",
      helper: "Chats that may need support, retention, or escalation.",
    },
    active: {
      label: "Active agents",
      paused: "{count} paused",
      allActive: "All configured agents are active.",
    },
  },
  playbooks: [
    {
      title: "Fashion fit assistant",
      detail:
        "Size guidance, returns confidence, outfit pairings, and stock-aware recommendations.",
    },
    {
      title: "Beauty routine advisor",
      detail: "Skin concerns, ingredient checks, bundles, and repeat-purchase prompts.",
    },
    {
      title: "Electronics compatibility desk",
      detail:
        "Model matching, warranty answers, accessory upsells, and setup support.",
    },
  ],
  scenarios: [
    "Customer asks if the product fits their use case",
    "Customer objects to shipping cost",
    "Customer wants a refund or human support",
  ],
  commands: {
    test: {
      label: "Test an agent response",
      detail: "Open a workspace and ask a real customer question.",
    },
    connect: {
      label: "Connect product context",
      detail: "Sync WooCommerce or Shopify so answers use catalog data.",
    },
    create: {
      label: "Create a new assistant",
      detail: "Start another workspace for a store, language, or brand.",
    },
  },
  copilot: "Commerce Copilot",
  activeOf: "{active} active of {total} agents",
  title: "What should your agents improve today?",
  subtitle:
    "Ask, test, tune, and publish from focused workspaces instead of digging through long setup screens.",
  promptPlaceholder:
    "Test shipping objections, tune product recommendations, or prepare a widget for launch...",
  openWorkspaceAria: "Open agent workspace",
  plan: "Plan",
  manage: "Manage",
  current: "Current",
  limit: "Limit",
  renewal: "Renewal",
  recentAgents: "Recent agents",
  all: "All",
  noAgents: "No agents yet. Create one to start testing responses.",
  signalsEyebrow: "Copilot signals",
  signalsTitle: "What needs attention",
  lastConversations: "Last {count} conversations",
  salesFriction: "Sales friction",
  salesFrictionEmpty: "No pricing, stock, return, or delivery objections detected yet.",
  handoff: "Human handoff",
  handoffEmpty: "No urgent handoff signals detected yet.",
  trainingQueue: "Training queue",
  trainingQueueEmpty:
    "Start collecting conversations to generate stronger training ideas.",
  launchPlaybooks: "Launch playbooks",
  testScenarios: "Test scenarios",
  section: {
    title: "Agent workspaces",
    subtitle: "Open an assistant, test responses, and publish improvements.",
    activeCount: "{active}/{total} active",
    messages: "{limit} messages",
    viewAll: "View all",
    loadError: "Failed to load agents. Please refresh.",
    emptyTitle: "No agents configured",
    emptyDescription:
      "Create your first agent to connect store data and start replying to chats automatically.",
    createAgent: "Create agent",
    key: "Key:",
    limit: "Limit: {limit}",
    showingRecent: "Showing recent 5 agents",
  },
};
