export const integrationPages = {
  status: {
    created: "Integration created successfully.",
    updated: "Integration updated.",
    deleted: "Integration deleted.",
    sync_ok: "Sync completed.",
    test_ok: "Connection looks good.",
  },
  errors: {
    details: "status {status}",
    detailsCode: "code {code}",
    rateLimit: "Rate limit. Try again in a few minutes.",
    invalid: "Check the fields: there is invalid data.",
    db: "We could not save the changes. Please try again.",
    unexpected: "An unexpected error occurred while processing the integration.",
  },
  notSynced: "Not synced",
  integrations: "Integrations",
  viewAgents: "View agents",
  internalLabel: "Internal label",
  keepActive: "Keep active",
  saveChanges: "Save changes",
  active: "Active",
  paused: "Paused",
  sync: {
    syncing: "Syncing...",
    imported: "Products imported: {count}.",
    failed: "Sync failed. Review the error details and retry.",
    retry: "Retry sync",
    syncNow: "Sync products now",
    status: "Sync status",
    productsIndexed: "Products indexed",
    lastSync: "Last sync",
    importing:
      "Importing products from {provider} to Supabase. This can take a few minutes.",
    progress: "Estimated progress {percent}%",
    webhookUrl: "Webhook URL",
    pause: "Pause",
    activate: "Activate",
    test: "Test connection",
    testing: "Testing...",
    delete: "Delete",
  },
  woo: {
    errors: {
      unauthorized:
        "Invalid credentials or missing permissions. Regenerate the Woo API key with read access.",
      forbidden: "Blocked by security or WAF. Allow /wp-json/wc/v3 from Vercel.",
      notFound: "Woo REST route unavailable. Review permalinks and WooCommerce.",
      server: "The store server returned an error.",
      generic: "Sync failed. Please verify the credentials and try again.",
    },
    title: "WooCommerce connection center",
    intro:
      "Connect stores, test credentials, sync products, and make catalog data available inside your agent workspaces.",
    stats: {
      stores: "Stores",
      activeOne: "1 active connection.",
      activeMany: "{count} active connections.",
      productsIndexed: "Products indexed",
      productsDetail: "Available to agents after sync.",
      healthy: "Healthy syncs",
      healthyDetail: "Stores with a successful latest product sync.",
    },
    connectTitle: "Connect a store",
    connectIntro:
      "Add a read-only WooCommerce REST API key. Secrets are encrypted and never displayed again.",
    labelPlaceholder: "Main store",
    storeUrl: "Store URL",
    consumerKey: "Consumer key",
    consumerSecret: "Consumer secret",
    activateTitle: "Activate after saving",
    activateBody:
      "Agents can use this catalog as soon as credentials are tested and products are synced.",
    save: "Save connection",
    oneClick: {
      title: "Connect in one click",
      intro:
        "Enter your store address and approve access in WordPress. We set up the keys, product updates and the first sync for you.",
      labelOptional: "Name (optional)",
      connect: "Connect with WooCommerce",
      permissions:
        "WooCommerce will ask for read/write access. Write access is only used to register product-change notifications: we never edit your products or orders.",
      manualToggle: "I'd rather paste API keys manually",
      connected:
        "Store connected. We're importing your products, which can take a few minutes. Then assign the store to an agent.",
      denied: "Access wasn't approved in WooCommerce, so nothing was connected.",
      notWoo: "We couldn't find WooCommerce at that address. Check your store URL.",
      unreachable: "We couldn't reach that address. Check the URL and try again.",
    },
    guideTitle: "Setup guide",
    steps: [
      {
        title: "Enter your store URL",
        detail: "The public address of your WooCommerce store, for example https://mystore.com.",
      },
      {
        title: "Approve access in WordPress",
        detail: "Log in if asked and click Approve. Keys are created and encrypted automatically.",
      },
      {
        title: "Assign it to an agent",
        detail:
          "Products sync on their own and stay updated. Then pick the store in an agent workspace.",
      },
    ],
    connectedEyebrow: "Connected stores",
    connectedTitle: "WooCommerce catalog sources",
    connectedIntro:
      "Each connection can be tested, synced, paused, edited, or assigned from an agent workspace.",
    assign: "Assign",
    products: "Products",
    lastSync: "Last sync",
    status: "Status",
    editCredentials: "Edit credentials",
    keepKey: "Leave empty to keep current key",
    keepSecret: "Leave empty to keep current secret",
    emptyTitle: "No WooCommerce store connected yet.",
    emptyBody:
      "Connect your store from the form. After the first sync, agents can answer with product and stock context.",
  },
  shopify: {
    errors: {
      unauthorized: "Token invalid or revoked. Reconnect the store.",
      forbidden: "Missing access scope. Update scopes and reconnect.",
      notFound: "Shop not found or invalid domain.",
      server: "Shopify returned a server error.",
      generic: "Sync failed. Please verify the connection and try again.",
    },
    title: "Manage your Shopify connections",
    intro:
      "Store each shop token so your agents can answer with real-time catalog data and availability.",
    registerTitle: "Register new store",
    encrypted: "Shopify OAuth tokens are encrypted with your {key} and are never shown in full.",
    labelPlaceholder: "Main Shopify",
    shopDomain: "Shop domain",
    activeOnCreate: "Mark as active on creation",
    connect: "Connect Shopify",
    oauthTitle: "How does OAuth work?",
    oauthSteps: [
      "Enter the shop domain and click Connect Shopify.",
      "You will be redirected to Shopify to approve access.",
      "After approval, the connection appears on the right list.",
    ],
    registeredTitle: "Registered integrations",
    registeredIntro:
      "Assign these connections from the agent detail page to enable Shopify data.",
    editIntegration: "Edit integration",
    shopDomainReauth: "Shop domain (reauth if changed)",
    emptyTitle: "You have not connected any store yet.",
    emptyBody:
      "Create your first integration using the steps on the left, then assign it to an agent from its detail page.",
  },
};
