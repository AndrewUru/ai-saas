export const docs = {
  badge: "Documentation",
  title: "Product guide and widget installation",
  intro:
    "Use this page to understand what each dashboard area does, how the storefront widget is installed, and how to troubleshoot common launch issues for WooCommerce, Shopify, HTML and React/Next.js projects.",
  openAgents: "Open agents",
  connectStore: "Connect store",
  highlights: [
    "Create an agent for each storefront.",
    "Train it with approved business knowledge.",
    "Install one secure script on the client site.",
  ],
  modulesEyebrow: "Dashboard functionality",
  modulesTitle: "What each module is for",
  features: {
    agents: {
      title: "Agents",
      description:
        "Create one assistant per store or client. Each agent has its own API key, knowledge base, widget settings, allowed domains, simulator and analytics.",
    },
    knowledge: {
      title: "Knowledge",
      description:
        "Upload store context, policies, FAQs, catalog notes and internal answers so the assistant can respond with approved information instead of guessing.",
    },
    widget: {
      title: "Widget studio",
      description:
        "Customize brand name, greeting, launcher text, colors, chat bubbles, header, position and language. The preview updates before you publish.",
    },
    simulator: {
      title: "Simulator",
      description:
        "Test shopper questions before going live. Use it to validate refunds, shipping, product recommendations, edge cases and handoff behavior.",
    },
    integrations: {
      title: "Integrations",
      description:
        "Connect WooCommerce or Shopify so the assistant can work with product and catalog context instead of static support copy only.",
    },
    analytics: {
      title: "Analytics",
      description:
        "Review conversations, usage and friction signals. Use the data to spot missing answers, shopper objections and opportunities to improve the store.",
    },
    domains: {
      title: "Allowed domains",
      description:
        "Limit where each widget can load. This prevents a leaked script from being reused on unapproved domains or client sites.",
    },
    rotation: {
      title: "API key rotation",
      description:
        "Rotate a widget key from the install screen if a snippet is exposed, a client contract ends or you want to revoke previous access.",
    },
  },
  installEyebrow: "Installation",
  installTitle: "Publish the widget",
  step: "Step {n}",
  installSteps: [
    {
      title: "Create or open an agent",
      body: "Go to Agents, choose the store/client assistant, then review its knowledge, widget style and allowed domains.",
    },
    {
      title: "Copy the embed snippet",
      body: "Open the agent Install screen and copy the generated script. The snippet stays stable when you update widget settings.",
    },
    {
      title: "Paste before the closing body tag",
      body: "Use the footer/custom HTML area in WordPress, Shopify, Webflow or any site builder. In custom HTML, paste it before </body>.",
    },
    {
      title: "Verify and monitor",
      body: "Open the storefront, send a test message, then check analytics and simulator results before handing the store to the client.",
    },
  ],
  htmlTitle: "Standard HTML, WordPress, Shopify or Webflow",
  htmlBody:
    "Paste the generated snippet into the footer, theme custom HTML, tag manager or immediately before the closing body tag.",
  nextTitle: "Next.js example",
  nextBody:
    "In React and Next.js, load the script with the framework loader instead of placing a raw script tag inside JSX.",
  domainTitle: "Domain security",
  domainExact:
    "Allowed domains are exact. {root} and {sub} are different origins. Add each production, staging and client domain that should load the widget.",
  domainWildcard:
    "Use {wildcard} when every subdomain should be valid. Keep the list empty only while testing locally or during a temporary setup window.",
  checklistTitle: "Launch checklist",
  checklist: [
    "Agent knowledge is approved.",
    "Allowed domains include the live store.",
    "Widget colors and copy match the brand.",
    "Simulator answers match support policy.",
  ],
  troubleEyebrow: "Troubleshooting",
  troubleTitle: "Common issues",
  troubleshooting: [
    {
      issue: "Widget does not appear",
      fix: "Check that the script is installed once, the agent key is active and the current domain is allowed.",
    },
    {
      issue: "Browser console shows 403",
      fix: "The domain is not authorized. Add the exact domain or a wildcard such as *.example.com.",
    },
    {
      issue: "React or Next.js throws a script error",
      fix: "Do not paste the raw script inside JSX. Load it with a framework script loader.",
    },
    {
      issue: "The style did not update",
      fix: "Refresh the storefront and confirm the settings were saved on the agent widget screen.",
    },
  ],
  contactSupport: "Contact support",
  readAcademy: "Read academy",
};
