// api/news.js — Veille GEO/SEO autonome.
// Récupère les actus DATÉES (Serper /news, dates réelles de Google News), filtre sur la fenêtre,
// et génère une synthèse via Gemini si GEMINI_API_KEY est configurée. Aucune date inventée par l'IA.

// Requêtes ancrées SEO/GEO (jamais l'IA en général) + angle France.
const DEFAULT_QUERIES = [
  "Google Search algorithm update SEO",
  "Google AI Overviews référencement SEO",
  "Google AI Mode search SEO",
  "generative engine optimization GEO citations",
  "AI search optimization SEO citations sources",
  "référencement Google SEO actualité France",
  "GEO SEO nouveauté moteurs de recherche France",
];

// Convertit une date Serper ("il y a 3 jours", "2 days ago", "Oct 5, 2025"…) en nombre de jours.
function daysAgoFrom(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).toLowerCase().trim();
  if (/aujourd|today|just now|à l'instant|moment/.test(s)) return 0;
  if (/hier|yesterday/.test(s)) return 1;
  const m = s.match(/(\d+)\s*(minute|min|hour|heure|day|jour|week|semaine|month|mois|year|an)/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2];
    if (/minute|min|hour|heure/.test(unit)) return 0;
    if (/day|jour/.test(unit)) return n;
    if (/week|semaine/.test(unit)) return n * 7;
    if (/month|mois/.test(unit)) return n * 30;
    if (/year|an/.test(unit)) return n * 365;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return Math.round((Date.now() - d.getTime()) / 86400000);
  return null; // date illisible → exclue (on ne devine jamais)
}

async function serperNews(apiKey, q) {
  const r = await fetch("https://google.serper.dev/news", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "fr", hl: "fr" }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Serper news HTTP ${r.status}`);
  return data.news || [];
}

async function geminiSummary(apiKey, itemsText) {
  const prompt =
    "Tu es analyste SEO/GEO. Voici des actualités RÉCENTES (titre — source — date) sur Google Search, " +
    "les AI Overviews / AI Mode, et les moteurs IA :\n\n" + itemsText +
    "\n\nRédige en français une synthèse de 4 à 6 puces : ce qui ressort, et pour chaque point, ce qu'il " +
    "faudrait éventuellement adapter en SEO/GEO. Sois strictement factuel, n'invente RIEN au-delà des " +
    "actualités fournies, ne réécris pas les dates. Si rien de majeur ne ressort, dis-le simplement.";
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await r.json();
  if (!r.ok) return null;
  const cand = (data.candidates || [])[0] || {};
  return ((cand.content || {}).parts || []).map(p => p.text || "").join("") || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "SERPER_API_KEY non configurée" });

  const windowDays = (req.body && req.body.windowDays) || 21;
  const queries = (req.body && req.body.queries) || DEFAULT_QUERIES;

  try {
    const seen = new Set();
    const items = [];
    for (const q of queries) {
      let news = [];
      try { news = await serperNews(apiKey, q); } catch { /* on saute cette requête */ }
      for (const n of news) {
        const link = n.link || "";
        if (!link || seen.has(link)) continue;
        const d = daysAgoFrom(n.date);
        if (d === null || d > windowDays) continue; // exclut le vieux ET les dates illisibles
        seen.add(link);
        items.push({ title: n.title || "", link, source: n.source || "", date: n.date || "", daysAgo: d, snippet: n.snippet || "" });
      }
    }
    items.sort((a, b) => a.daysAgo - b.daysAgo);

    let summary = null;
    const gem = process.env.GEMINI_API_KEY;
    if (gem && items.length) {
      const itemsText = items.slice(0, 25).map(i => `- ${i.title} — ${i.source} — ${i.date}`).join("\n");
      try { summary = await geminiSummary(gem, itemsText); } catch { /* synthèse optionnelle */ }
    }

    res.status(200).json({ items, summary, fetchedAt: new Date().toISOString(), windowDays, queries });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
