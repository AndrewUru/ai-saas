export const pages = {
  plans: {
    free: {
      name: "Free",
      cycle: "per month",
      features: [
        "Up to 5 agents",
        "1,000 messages/month",
        "Starter widget branding",
        "Standard support",
      ],
    },
    pro: {
      name: "Pro",
      cycle: "one-time",
      features: [
        "Unlimited agents",
        "10,000 messages/month",
        "Custom escalation routes",
        "Advanced widget customization",
      ],
    },
  },
  about: {
    meta: { title: "About us" },
    eyebrow: "About us",
    title: "We empower agencies that build memorable ecommerce stores",
    intro:
      "AI SaaS was born after working alongside web studios that needed to scale support without losing each brand’s tone. We built the platform so your team can deploy reliable agents, measure results, and offer a recurring service to your clients.",
    manifestoTitle: "Our manifesto",
    manifestoBody:
      "We believe automation should strengthen the relationship between agency and brand, not replace it. That’s why we prioritize granular controls, transparent analytics, and an onboarding flow your team can replicate in a matter of hours.",
    nextTitle: "What’s next",
    nextBody:
      "We’re expanding integrations with CRMs and payment platforms, plus a marketplace of agency-verified prompts to speed up every new ecommerce project.",
  },
  contact: {
    meta: { title: "Contact" },
    badge: "Agency Support",
    titleStart: "Let’s talk about your",
    titleHighlight: "implementation",
    intro:
      "Reach out to resolve technical questions, prepare client demos, or discuss enterprise plans tailored to your needs.",
    emailTitle: "Email support",
    emailBody:
      "Send your inquiry including the store URL and the number of agents you plan to deploy.",
    sessionTitle: "Book a strategy session",
    sessionBody:
      "We run integration workshops and prompt audits with your team. Request a session via email or dashboard.",
    sessionAvailability: "Available via Dashboard",
  },
  pricing: {
    meta: { title: "Pricing" },
    back: "Back to dashboard",
    badge: "Pricing",
    title: "Simple plans for AI commerce agents.",
    intro:
      "Start free, connect your store, and upgrade when your agents need more volume, customization, and a cleaner client-facing experience.",
    metrics: {
      includedLabel: "Included",
      includedValue: "AI widget",
      checkoutLabel: "Checkout",
      checkoutValue: "PayPal secure",
      setupLabel: "Setup",
      setupValue: "No contracts",
    },
    includedTitle: "What is included",
    included: [
      "AI chat widget for every plan",
      "Opportunity board for sales friction",
      "Prompt and branding customization",
      "Catalog-aware product answers",
    ],
    testingTitle: "Best for testing",
    testingBody:
      "Use the free plan to connect a store, launch initial agents, and see which questions shoppers ask before committing to a paid workflow.",
    upgradeTitle: "Why teams upgrade",
    proBenefits: [
      "Removed branding",
      "Priority support",
      "Higher message limits",
      "Agency reporting workflow",
    ],
    customTitle: "Need custom limits or agency features?",
    customBody:
      "We can tailor agent caps, message volumes, onboarding, and white-label reporting.",
    talkToSales: "Talk to sales",
  },
  pricingCards: {
    missingClientId:
      "PayPal Client ID is not configured. Add it before taking payments.",
    free: {
      headline: "Start building agents",
      period: "forever",
      description: "Perfect to test the dashboard and launch your first agent.",
      badge: "Free forever",
    },
    pro: {
      headline: "Scale with confidence",
      period: "one-time",
      description:
        "Remove branding, get priority support, and unlock higher limits.",
      badge: "Best value",
    },
    goToDashboard: "Go to Dashboard",
    processing: "Processing checkout",
    payOnce: "Pay once",
    createOrderError: "Could not create order",
    approved: "Payment approved. Activating your account...",
    captureFailed: "Payment capture failed",
    activated: "PRO activated! Redirecting...",
    paypalError: "PayPal error",
    secureNote:
      "Secure checkout powered by PayPal. Access activates after approval.",
  },
  privacy: {
    meta: { title: "Privacy Policy" },
    eyebrow: "Legal documentation",
    title: "Privacy Policy",
    intro:
      "This page summarizes how we collect, use, and protect the data entrusted to us by ecommerce agencies and their clients. This document is updated as we add new features to the platform.",
    sections: [
      {
        title: "Data we store",
        body: "We only store the information required to operate the agents: encrypted credentials from external services, billing details, and the messages exchanged with end customers. We do not share this data with third parties outside the agency that owns the account.",
      },
      {
        title: "Data processing",
        body: "Access to sensitive information is limited to automated system processes. Any manual intervention (technical support or audits) requires written authorization from the agency and is logged.",
      },
      {
        title: "Retention and deletion",
        body: "You may request full deletion of your data at any time. We retain records for 30 days after account cancellation to comply with accounting obligations and to address potential incidents.",
      },
    ],
  },
  terms: {
    meta: { title: "Terms and conditions" },
    eyebrow: "Legal documentation",
    title: "Terms and conditions",
    intro:
      "This agreement defines how agencies use AI SaaS, which responsibilities we take on, and the service limits that apply to each plan.",
    sections: [
      {
        title: "1. Authorized use",
        body: "The account is intended to manage AI agents for your clients' online stores. Using the platform for illegal activities, bulk spam, or any action that compromises external infrastructure is prohibited.",
      },
      {
        title: "2. Service limits",
        body: "Each plan includes a message volume and a number of active agents. Exceeding those limits may temporarily suspend the service until you upgrade your plan or purchase additional volume.",
      },
      {
        title: "3. Support and SLA",
        body: "We offer priority support through the dashboard. Critical incidents are handled in under 12 business hours. If you need a custom SLA, contact us to formalize it.",
      },
    ],
  },
  blog: {
    meta: { title: "Blog" },
    eyebrow: "Blog for agencies",
    title: "Ideas to scale recurring ecommerce services",
    intro:
      "Stories, experiments, and tactics shared by agencies that already sell AI agents as part of their offering.",
    featured: "Featured",
    featuredTitle: "How to turn implementations into a monthly retainer",
    featuredBody:
      "Pricing models, contracts, and reports that agencies use to retain online store clients with always-on agents.",
    upcomingTitle: "Resources on the way",
    upcomingBody:
      "We're preparing interviews with CX directors, guides on cross-selling prompts, and sales proposal templates. Subscribe to get them first.",
    emailPlaceholder: "you@agency.com",
    notifyMe: "Notify me",
  },
  changelog: {
    meta: { title: "Changelog" },
    eyebrow: "What's new",
    title: "Update history",
    intro:
      "Every week we add improvements for agencies that integrate AI SaaS into their online stores. Review recent changes and share the roadmap with your team.",
    entries: [
      {
        date: "2025-10-09",
        title: "Advanced agent customization",
        items: [
          "Editable system prompt, preferred language, and fallback URL per agent.",
          "Improved widget with brand kit, floating button, and typing states.",
        ],
      },
      {
        date: "2025-10-08",
        title: "WooCommerce integrations",
        items: [
          "Store registration with encrypted credentials and allowed-domain control.",
          "Quick assignment from the agent page and real-time validation.",
        ],
      },
    ],
  },
};
