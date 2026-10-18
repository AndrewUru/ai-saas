export const agentPages = {
  backToSetup: "Back to setup",
  simulatorPage: {
    badge: "Simulator",
    title: "Test {name}",
    intro: "Try real questions against the current prompt, catalog, and knowledge base.",
  },
  installPage: {
    badge: "Install",
    title: "Install {name}",
    intro:
      "Copy the script into your storefront and rotate the key if access is ever exposed.",
    notesTitle: "Publish notes",
    noteScript:
      "Install the script before the closing body tag or through your tag manager.",
    allowedDomains: "Allowed domains:",
    anyOrigin: "any origin",
    noteRefresh:
      "After changing widget settings, refresh the storefront to load the latest config.",
  },
  knowledgePage: {
    badge: "Knowledge",
    title: "{name} knowledge",
    intro: "Upload and process files that improve answers for this agent.",
  },
  simulator: {
    samplePrompts: [
      "Recommend a product for a first-time buyer",
      "Do you have this in stock?",
      "What is your shipping or return policy?",
    ],
    suggestedProducts: "Suggested products",
    error: "Could not test this agent.",
    noReply: "No reply returned.",
    eyebrow: "Simulator",
    title: "Test this agent",
    intro:
      "Try real questions against the current prompt, catalog, and knowledge files. Test messages do not consume quota.",
    previewMode: "Preview mode",
    start: "Start with a scenario",
    testing: "Testing agent response...",
    placeholder: "Ask about products, shipping, sizing, returns...",
    send: "Send test",
  },
  embed: {
    title: "Embed snippet",
    copied: "Copied",
    copy: "Copy code",
    intro:
      "Copy and paste this script into your WordPress (footer or HTML widget). The snippet stays the same even when you update settings.",
    planCheck: "The widget checks your active plan and usage limits before loading.",
    reactTitle: "React / Next.js:",
    reactBody:
      "Do not paste this script directly inside React components. Use the official integration method described in the {link}.",
    docsLink: "documentation",
  },
  rotate: {
    newKey: "New key ends in {suffix}.",
    warning:
      "Rotating the key immediately invalidates the current embed snippet. Update installed widgets after confirming.",
    rotating: "Rotating...",
    confirm: "Confirm rotation",
    cancel: "Cancel",
    button: "Rotate API key",
  },
};
