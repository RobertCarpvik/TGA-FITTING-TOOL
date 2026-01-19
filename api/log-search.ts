export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      klubbtyp,
      fattning,
      gender,
      niva,
      spel,
      flex,
      hadResults,
    } = body;

    const baseId = process.env.AIRTABLE_BASE;
    const table = process.env.AIRTABLE_FINDER_LOGS_TABLE;

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Klubbtyp: klubbtyp || "",
            Fattning: fattning || "",
            Gender: gender || "",
            Niva: niva || "",
            Spel: spel || "",
            Flex: Array.isArray(flex) ? flex.join(", ") : "",
            "Had results": !!hadResults,
            Source: "shopify-finder",
            "Created at": new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Airtable log failed:", err);
      return res.status(500).json({ error: "Airtable error" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("💥 Finder log error:", err);
    return res.status(500).json({ error: err.message });
  }
}
