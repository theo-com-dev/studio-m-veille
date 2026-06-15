// Mesure GEO : interroge un moteur IA avec recherche web et renvoie les citations réelles.
// Clés dans les variables d'environnement Vercel : GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY.

const MODELS = { claude: "claude-opus-4-8", gemini: "gemini-2.5-flash", openai: "gpt-5-mini" };

async function testClaude(apiKey, query, model) {
  const body = {
    model: model || MODELS.claude,
    max_tokens: 2048,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
    messages: [{ role: "user", content: query }],
  };
  let messages = body.messages;
  let citations = [], searchResults = [], answer = "";
  for (let round = 0; round < 3; round++) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ ...body, messages }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`Anthropic HTTP ${r.status} : ${(data.error && data.error.message) || ""}`);
    for (const block of data.content || []) {
      if (block.type === "text") {
        answer += block.text;
        for (const c of block.citations || []) if (c.url) citations.push({ url: c.url, title: c.title || "" });
      }
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const x of block.content) if (x.url) searchResults.push({ url: x.url, title: x.title || "" });
      }
    }
    if (data.stop_reason !== "pause_turn") break;
    messages = [...messages, { role: "assistant", content: data.content }];
  }
  return { answer, citations, searchResults };
}

async function testGemini(apiKey, query, model) {
  const m = model || MODELS.gemini;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: query }] }], tools: [{ google_search: {} }] }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status} : ${(data.error && data.error.message) || ""}`);
  const cand = (data.candidates || [])[0] || {};
  const answer = ((cand.content || {}).parts || []).map(p => p.text || "").join("");
  const gm = cand.groundingMetadata || {};
  const citations = (gm.groundingChunks || []).map(c => ({ url: (c.web && c.web.uri) || "", title: (c.web && c.web.title) || "" })).filter(c => c.url || c.title);
  return { answer, citations, searchResults: [], note: "Gemini masque les URL derrière des redirections — la détection se fait surtout via le titre de la source." };
}

async function testOpenAI(apiKey, query, model) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "content-type": "application/json" },
    body: JSON.stringify({ model: model || MODELS.openai, tools: [{ type: "web_search" }], input: query }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`OpenAI HTTP ${r.status} : ${(data.error && data.error.message) || ""}`);
  let answer = "";
  const citations = [];
  for (const item of data.output || []) {
    if (item.type !== "message") continue;
    for (const c of item.content || []) {
      if (c.type === "output_text") {
        answer += c.text || "";
        for (const a of c.annotations || []) if (a.type === "url_citation" && a.url) citations.push({ url: a.url, title: a.title || "" });
      }
    }
  }
  return { answer, citations, searchResults: [] };
}

const RUNNERS = { claude: testClaude, gemini: testGemini, openai: testOpenAI };
const ENV = { claude: "ANTHROPIC_API_KEY", gemini: "GEMINI_API_KEY", openai: "OPENAI_API_KEY" };

export default async function handler(req, res) {
  // GET : quels moteurs sont configurés (clé présente dans l'env) ?
  if (req.method === "GET") {
    const available = Object.keys(ENV).filter(p => process.env[ENV[p]]);
    return res.status(200).json({ available });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { provider, query, model } = req.body || {};
  if (!RUNNERS[provider]) return res.status(400).json({ error: "Fournisseur inconnu : " + provider });
  const apiKey = process.env[ENV[provider]];
  if (!apiKey) return res.status(400).json({ error: `${provider} non configuré (variable ${ENV[provider]} absente)` });
  if (!query || !query.trim()) return res.status(400).json({ error: "Requête manquante" });

  try {
    const result = await RUNNERS[provider](apiKey, query.trim(), model);
    res.status(200).json(result);
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
