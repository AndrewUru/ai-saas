const integrationId = process.env.INTEGRATION_ID || process.argv[2];
const baseUrl = process.env.SITE_URL || "http://localhost:3000";
const token = process.env.INTEGRATIONS_SYNC_SECRET;

if (!integrationId) {
  console.error("Missing integration id. Set INTEGRATION_ID or pass it as arg.");
  process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, "")}/api/integrations/woocommerce/sync`;

async function run() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ integration_id: integrationId }),
  });

  const payload = await res.text();
  if (!res.ok) {
    console.error("Sync failed:", payload);
    process.exit(1);
  }
  console.log(payload);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
