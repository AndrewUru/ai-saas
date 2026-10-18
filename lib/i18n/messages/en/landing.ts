export const landing = {
  meta: {
    title: "AI Commerce Agents | Turn conversations into revenue signals",
    description:
      "Deploy branded AI agents for WooCommerce and Shopify that answer shoppers, recommend products, detect sales friction, and suggest improvements.",
  },
  hero: {
    badge: "Commerce intelligence, live in every conversation",
    titleLine1: "Turn shopper questions into",
    titleLine2: "revenue signals.",
    subtitle:
      "An AI agent that sells, supports, and shows your team exactly where customers hesitate—before those questions become abandoned carts.",
    primaryCta: "Build your first agent",
    secondaryCta: "See the intelligence loop",
    installOnce: "Install once",
    live: "Live",
    storeNavNew: "New",
    storeNavEssentials: "Essentials",
    storeHeadline: "Everyday objects, considered.",
    exploreCollection: "Explore collection",
    products: [
      { name: "Calm set", price: "$68" },
      { name: "Travel ritual", price: "$34" },
    ],
    catalogOnline: "Catalog connected · online",
    insight: "Insight",
    nextAction: "Next action",
    widgetStyleAria: "Widget style",
    useStyleAria: "Use {name} style",
    conversations: [
      {
        label: "Delivery",
        question: "Will this arrive before Friday?",
        answer:
          "Yes. Order in the next 2 hours for Thursday delivery. The sand color is ready to ship.",
        insight: "Delivery hesitation detected",
        action: "Create a shipping reassurance rule",
      },
      {
        label: "Product fit",
        question: "Which one works best for sensitive skin?",
        answer:
          "The Calm Set is fragrance-free and has the gentlest formula. I can add the travel size too.",
        insight: "High-intent recommendation",
        action: "Suggest the Calm Set bundle",
      },
      {
        label: "Returns",
        question: "Can I return it if the size is wrong?",
        answer:
          "Absolutely. You have 30 days, and the first size exchange is free. Want the sizing guide?",
        insight: "Return-policy friction detected",
        action: "Surface size guidance earlier",
      },
    ],
  },
  features: {
    eyebrow: "One continuous loop",
    title: "The widget is only the surface.",
    description:
      "Every conversation enriches a shared operating system for commerce: better recommendations for shoppers, clearer signals for teams, and improvements that stay under human control.",
    sell: {
      tag: "Sell",
      title: "Recommendations grounded in the live catalog.",
      description:
        "Match intent with price, stock, variants, policies, and useful alternatives instead of sending generic replies.",
      intentLabel: "Shopper intent",
      intentQuote: "“I need a fragrance-free routine under $80.”",
      signals: ["Sensitive skin", "Budget $80", "Ready to buy"],
      bestMatch: "Best match",
      inStock: "In stock",
      productName: "Calm skin set",
      productMeta: "Fragrance-free · 3 products",
      productPrice: "$68",
      recommend: "Recommend bundle",
    },
    learn: {
      tag: "Learn",
      title: "See why shoppers hesitate.",
      description:
        "Group real conversations into patterns your team can understand and act on.",
      frictionMap: "Friction map",
      period: "Last 30 days",
      signals: ["Delivery cost", "Product fit", "Return policy"],
    },
    control: {
      tag: "Control",
      title: "AI proposes. Your team approves.",
      queue: [
        "Add shipping threshold answer",
        "Recommend an in-stock alternative",
        "Escalate refund requests",
      ],
    },
    operate: {
      tag: "Operate",
      title: "One cockpit for every store you manage.",
      description:
        "Keep each brand, catalog, prompt, and handoff policy separate while sharing the workflows that already work.",
      tiles: ["Conversations", "Catalog", "Training", "Handoffs"],
    },
  },
  workflow: {
    eyebrow: "From conversation to action",
    title: "Watch one question improve the whole store.",
    description:
      "The same interaction helps the shopper now and teaches your team what to fix next.",
    traceTitle: "Commerce signal trace",
    session: "Session #0842",
    showStageAria: "Show {title}",
    stages: [
      {
        step: "01",
        name: "Listen",
        title: "A shopper asks a real buying question.",
        detail:
          "The agent captures intent, urgency, budget, and the product context behind the message.",
        metric: "Intent: delivery confidence",
      },
      {
        step: "02",
        name: "Ground",
        title: "The answer uses live store knowledge.",
        detail:
          "Catalog, stock, variants, shipping rules, and approved content are searched before the reply is composed.",
        metric: "4 sources checked",
      },
      {
        step: "03",
        name: "Detect",
        title: "The conversation becomes a signal.",
        detail:
          "Repeated hesitation is grouped into an opportunity your team can understand instead of disappearing into chat history.",
        metric: "Pattern: shipping threshold",
      },
      {
        step: "04",
        name: "Improve",
        title: "Your team approves the next best action.",
        detail:
          "Turn the signal into a FAQ, prompt rule, recommendation, or human handoff without giving up control.",
        metric: "Rule ready to publish",
      },
    ],
    listenQuestion: "Will this arrive before Friday?",
    listenAnswer: "Let me check delivery and stock for your location.",
    sources: [
      { label: "Shipping policy", status: "Matched" },
      { label: "Sand variant", status: "12 in stock" },
      { label: "Delivery estimate", status: "Thursday" },
    ],
    patternFound: "Pattern found",
    patternTitle: "Shipping confidence is blocking product decisions.",
    patternDetail: "Similar intent appeared in 18 recent conversations.",
    readyToPublish: "Ready to publish",
    suggestedImprovement: "Suggested improvement",
    improvementText:
      "Show the delivery promise on product pages and use it in recommendation replies.",
    approve: "Approve improvement",
    linkedSignal: "Signal remains linked to the source conversation",
  },
  useCases: {
    eyebrow: "Built around the work",
    title: "One agent. Different operating modes.",
    description:
      "Start with the workflow your team needs today. Keep the same conversation intelligence as the operation grows.",
    items: [
      {
        title: "Commerce teams",
        description:
          "Guide product discovery, answer buying questions, and surface the friction hiding between product view and checkout.",
        outcomes: ["Product discovery", "Policy answers", "Bundle guidance"],
      },
      {
        title: "Digital agencies",
        description:
          "Operate multiple branded agents from one workflow while keeping every client's data, tone, and approvals separate.",
        outcomes: ["Reusable playbooks", "Client reporting", "Brand control"],
      },
      {
        title: "Customer experience",
        description:
          "Resolve repetitive questions instantly and hand complex cases to people with intent, history, and product context attached.",
        outcomes: ["Smart handoff", "Conversation context", "Training queue"],
      },
    ],
    explore: "Explore the workflow",
    connect: "Connect the commerce stack you already use.",
    anyWebsite: "Any website",
  },
  cta: {
    badge: "Your next conversation is a signal",
    title: "Put the intelligence loop inside your store.",
    description:
      "Create an agent, connect a catalog, choose a branded widget, and start learning from real shopper intent.",
    primary: "Create your agent",
    secondary: "View pricing",
    perks: ["No credit card", "Editable presets", "Human approval"],
    installOnce: "Install once",
    ready: "Ready",
    steps: [
      { label: "Catalog", status: "Connected" },
      { label: "Agent", status: "Trained" },
      { label: "Widget", status: "Published" },
    ],
  },
};
