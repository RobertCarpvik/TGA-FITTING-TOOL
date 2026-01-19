export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

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
      hadResults
    } = body;

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/${encodeURIComponent(
        process.env.AIRTABLE_FITTING_TABLE
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        },
        
      body: JSON.stringify({
  records: [
    {
      fields: {
        Klubbtyp: klubbtyp || "",
        Fattning: fattning || "",
        Gender: gender || "",
        Nivå: niva || "",
        Spel: spel || "",
        Flex: Array.isArray(flex) ? flex.join(", ") : "",
        "Hade träffar": !!hadResults,
        Källa: "Fitting tool"
      }
    }
  ]
})

      }
    );

    if (!response.ok) {
  const errText = await response.text();
  console.error("❌ Airtable error response:", errText);
  return res.status(500).json({ error: errText });
}

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("💥 Logging error:", err);
    return res.status(500).json({ error: err.message });
  }
}
