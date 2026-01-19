export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();

  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Finder%20Searches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              klubbtyp: body.klubbtyp,
              fattning: body.fattning,
              gender: body.gender,
              niva: body.niva,
              spel: body.spel,
              flex: body.flex?.join(", "),
              hadResults: body.hadResults,
              createdAt: new Date().toISOString()
            }
          }
        ]
      })
    }
  );

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
