import { NextResponse } from "next/server";

function pickRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export async function POST(req) {
  const { comments, filters } = await req.json();
  if (!Array.isArray(comments) || !comments.length) {
    return NextResponse.json({ error: "Sin comentarios" }, { status: 400 });
  }
  const { winners = 1, dedup = true, mustMention = "", mustHashtag = "" } = filters || {};

  // Normaliza
  const mm = (mustMention || "").trim().toLowerCase();
  const mh = (mustHashtag || "").trim().toLowerCase();

  // Filtrado
  let filtered = comments.map((c, idx) => ({
    id: idx,
    username: (c.username || c.from || "user").toLowerCase(),
    text: (c.text || "").toLowerCase()
  }));

  if (dedup) {
    const seen = new Set();
    filtered = filtered.filter((c) => {
      if (seen.has(c.username)) return false;
      seen.add(c.username);
      return true;
    });
  }

  if (mm) {
    filtered = filtered.filter((c) => c.text.includes(mm));
  }
  if (mh) {
    filtered = filtered.filter((c) => c.text.includes(mh));
  }

  const chosen = pickRandom(filtered, Math.max(1, Number(winners) || 1)).map((c)=> ({
    username: c.username,
    text: c.text
  }));

  return NextResponse.json({ winners: chosen, totalConsidered: filtered.length });
}
