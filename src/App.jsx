import { useState, useCallback, useRef, useEffect } from "react";

const STUDIO_M = {
  name: "Studio M Rennes",
  domain: "studio-m.fr",
  page: "https://www.studio-m.fr/ecole-audiovisuel-arts-appliques-rennes",
};

// Domaines génériques à ignorer dans la colonne "#1 Google"
const GENERIC_DOMAINS = [
  "youtube.com", "facebook.com", "instagram.com", "twitter.com", "x.com",
  "linkedin.com", "tiktok.com", "pinterest.com", "reddit.com", "wikipedia.org",
  "parcoursup.fr", "dossier.parcoursup.fr", "onisep.fr", "letudiant.fr",
  "studyrama.com", "diplomeo.com", "orientation.com", "cidj.com",
  "ouest-france.fr", "letelegramme.fr", "lemonde.fr", "lefigaro.fr",
  "francetravail.fr", "pole-emploi.fr", "indeed.com", "glassdoor.fr",
  "google.com", "google.fr", "apple.com", "vimeo.com", "dailymotion.com",
  "prepeers.co", "studi.com", "vocaneo.com", "imaginetonfutur.com",
  "iffdec.com", "meilleurs-masters.com", "profilculture-formation.com",
  "ideo.bretagne.bzh", "lecoledeDesign.com", "lecoledeDesign.fr",
  "cread.fr", "the-bridge-ecole.fr", "aftec.fr",
];

const T = {
  bg: "#08090F", surface: "#0E1018", card: "#13151F", elevated: "#191C29",
  border: "#1F2338", borderHover: "#2A2F4A", text: "#EDF0FA", sub: "#8090B8",
  dim: "#3A4260", accent: "#FF5C35", warm: "#FFAB3A", cyan: "#00E5D0",
  green: "#28D984", red: "#FF4B4B", purple: "#8A63FF", pink: "#FF5FA8",
  blue: "#3D9FFF", yellow: "#FFD060",
};

const SECTORS = [
  {
    id: "design", label: "Art & Design", emoji: "🎨", color: T.purple,
    keywords: [
      // Locaux — Rennes
      "école de design rennes", "école design graphique rennes", "école d'art rennes",
      "école graphisme rennes", "école arts appliqués rennes",
      "bachelor design graphique rennes", "formation design graphique alternance rennes",
      "école motion design rennes", "école UX design rennes",
      "meilleure école design rennes", "classement école design graphique rennes",
      "avis école design rennes", "école design rennes prix",
      "école art rennes parcoursup", "école art rennes hors parcoursup",
      // Régionaux — Bretagne / Grand Ouest
      "école de design bretagne", "école d'art bretagne", "école graphisme bretagne",
      "école design nantes", "école design graphique grand ouest",
      // Nationaux — sans ville
      "meilleure école de design france", "classement école design graphique",
      "bachelor design graphique alternance", "école motion design france",
      "école design graphique privée",
      // Mots-clés SEO Studio M
      "prépa art rennes", "prépa art", "ecole graphisme", "ecole graphisme rennes",
      "bachelor design", "bachelor design rennes",
      "formation directeur artistique", "formation directeur artistique rennes",
      // Nationaux — mots-clés ECV / ESMA
      "bachelor design graphique", "école art digital", "prépa arts appliqués",
      "école motion design", "formation illustration", "école concept art",
      "école graphisme", "formation design graphique",
    ],
    competitors: [
      { name: "LISAA Rennes", domain: "lisaa.com" },
      { name: "BRASSART Rennes", domain: "brassart.fr" },
      { name: "MJM Graphic Design", domain: "mjm-design.com" },
      { name: "École de Condé Rennes", domain: "ecoles-conde.com" },
      { name: "ECV", domain: "ecv.fr" },
      { name: "ESMA", domain: "esma-artistique.com" },
    ],
  },
  {
    id: "cinema", label: "Cinéma & Audiovisuel", emoji: "🎬", color: T.accent,
    keywords: [
      // Locaux — Rennes
      "école de cinéma rennes", "école audiovisuel rennes", "formation audiovisuel rennes",
      "BTS audiovisuel rennes", "BTS audiovisuel alternance rennes",
      "bachelor audiovisuel rennes", "école audiovisuel alternance rennes",
      "école audiovisuel après le bac rennes", "formation montage vidéo rennes",
      "meilleure école cinéma rennes", "meilleure école audiovisuel rennes",
      "classement école cinéma rennes", "école audiovisuel rennes prix",
      "avis école audiovisuel rennes",
      // Régionaux — Bretagne / Grand Ouest
      "école cinema bretagne", "école audiovisuel bretagne",
      "école de cinéma nantes", "formation audiovisuel ouest france",
      // Nationaux — sans ville
      "meilleure école de cinéma france", "classement école audiovisuel france",
      "BTS audiovisuel alternance", "bachelor réalisateur monteur",
      "école audiovisuel privée france",
      // Mots-clés SEO Studio M
      "formation monteur vidéo", "formation monteur vidéo rennes",
    ],
    competitors: [
      { name: "ESRA Bretagne Rennes", domain: "esra.edu" },
      { name: "3iS", domain: "3is.fr" },
      { name: "EICAR", domain: "eicar.fr" },
      { name: "Ynov Campus Rennes", domain: "ynov.com" },
    ],
  },
  {
    id: "son", label: "Son & Musique", emoji: "🎧", color: T.cyan,
    keywords: [
      // Locaux — Rennes
      "école son rennes", "formation son rennes", "ingénieur du son rennes",
      "école musique rennes",
      "BTS audiovisuel option son rennes", "formation technicien son rennes",
      "formation MAO rennes", "bachelor technicien son rennes",
      "école son rennes alternance",
      "meilleure école son rennes", "formation son rennes prix",
      "avis école son rennes",
      // Régionaux — Bretagne / Grand Ouest
      "école son bretagne", "formation ingénieur du son bretagne",
      "école musique bretagne",
      // Nationaux — sans ville
      "meilleure école de son france", "classement école son france",
      "formation technicien son alternance", "école ingénieur du son france",
      "BTS audiovisuel option son alternance",
    ],
    competitors: [
      { name: "ISTS / ESRA Rennes", domain: "esra.edu" },
      { name: "CFPM Rennes", domain: "cfpmfrance.com" },
      { name: "Ynov Campus Son", domain: "ynov.com" },
    ],
  },
];

const SOCIAL_PLATFORMS = ["instagram", "tiktok", "linkedin", "youtube", "facebook"];

// ─── HISTORIQUE LOCAL ────────────────────────────────────────────────────────

function saveHistory(sectorId, data) {
  const key = `veille_history_${sectorId}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  const entry = {
    date: new Date().toISOString(),
    positions: {},
  };
  const entities = data.entities || data;
  Object.entries(entities).forEach(([domain, ent]) => {
    entry.positions[domain] = { ...ent.positions };
  });
  history.push(entry);
  // Garder max 20 entrées
  if (history.length > 20) history.splice(0, history.length - 20);
  localStorage.setItem(key, JSON.stringify(history));
}

function getPreviousPositions(sectorId) {
  const key = `veille_history_${sectorId}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  if (history.length < 1) return null;
  // Retourner l'avant-dernière entrée (la dernière est celle qu'on vient de sauvegarder)
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  return prev;
}

function getHistoryDates(sectorId) {
  const key = `veille_history_${sectorId}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  return history.map(h => h.date);
}

// ─── SEO SCORE ───────────────────────────────────────────────────────────────

function computeSeoScore(entity, totalKeywords) {
  let score = 0;
  const positions = Object.values(entity.positions || {}).filter(Boolean);
  const coverage = totalKeywords > 0 ? positions.length / totalKeywords : 0;

  // Couverture (0-30 pts)
  score += Math.round(coverage * 30);

  // Position moyenne (0-30 pts) — plus la moyenne est basse, mieux c'est
  if (positions.length > 0) {
    const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
    score += Math.round(Math.max(0, 30 - (avg - 1) * 3));
  }

  // GMB (0-15 pts)
  if (entity.gmb) {
    score += 5; // Présent
    if (entity.gmb.position <= 3) score += 5;
    if (entity.gmb.rating >= 4) score += 5;
  }

  // Brand #1 (0-10 pts)
  if (entity.brandPos === 1) score += 10;
  else if (entity.brandPos) score += 5;

  // Réseaux sociaux (0-15 pts, 3 pts par plateforme)
  const socialCount = Object.keys(entity.socials || {}).length;
  score += Math.min(15, socialCount * 3);

  return Math.min(100, Math.max(0, score));
}

// ─── SERPER ──────────────────────────────────────────────────────────────────

async function serperSearch(q) {
  const r = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "fr", hl: "fr", num: 10 }),
  });
  if (!r.ok) throw new Error("API search " + r.status);
  return r.json();
}

async function serperMaps(q) {
  const r = await fetch("/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, gl: "fr", hl: "fr" }),
  });
  if (!r.ok) throw new Error("API maps " + r.status);
  return r.json();
}

function getPosition(results, domain) {
  const idx = (results?.organic || []).findIndex(r => (r.link || "").includes(domain)) + 1;
  return idx || null;
}

function getSnippet(results, domain) {
  const found = (results?.organic || []).find(r => (r.link || "").includes(domain));
  return found?.snippet || null;
}

function getGMB(mapsData, domain, name) {
  const places = mapsData?.places || [];
  const p = places.find(pl => (pl.website || "").includes(domain) || (pl.title || "").toLowerCase().includes(name.split(" ")[0].toLowerCase()));
  if (!p) return null;
  return { rating: p.rating, reviews: p.reviews, address: p.address, position: places.indexOf(p) + 1, title: p.title };
}

async function searchSocials(entityName) {
  const socials = {};
  for (const platform of SOCIAL_PLATFORMS) {
    try {
      const data = await serperSearch(`${entityName} ${platform}`);
      const organic = data?.organic || [];
      const match = organic.find(r => (r.link || "").includes(platform === "linkedin" ? "linkedin.com" : platform === "youtube" ? "youtube.com" : platform === "tiktok" ? "tiktok.com" : platform === "facebook" ? "facebook.com" : "instagram.com"));
      if (match) {
        socials[platform] = { url: match.link, title: match.title, snippet: match.snippet || "" };
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch { /* skip */ }
  }
  return socials;
}

// ─── GEO : citations IA ────────────────────────────────────────────────────

const LLM_LABELS = { gemini: "Gemini", openai: "ChatGPT", claude: "Claude" };

function domainCited(citations, searchResults, domain) {
  const all = (citations || []).concat(searchResults || []);
  const d = domain.toLowerCase();
  return all.some(c => (((c.url || "") + " " + (c.title || "")).toLowerCase()).includes(d));
}

const NEEDLE_STOP = new Set(["rennes", "ecole", "ecoles", "campus", "de", "du", "des", "la", "le", "graphic", "graphique", "design", "arts", "art", "appliques", "bretagne"]);
function stripAccents(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function entityNeedles(entity) {
  const tokens = stripAccents(entity.name).split(/[^a-z0-9]+/).filter(Boolean);
  const phrase = tokens.filter(w => !NEEDLE_STOP.has(w)).join(" ").trim();
  const root = stripAccents(entity.domain).replace(/\.(com|fr|edu|net|org|bzh|io)$/, "");
  return [phrase, root, stripAccents(entity.domain)].filter(n => n && n.length >= 2);
}
// GEO réel : l'école est NOMMÉE dans la réponse de l'IA (pas juste consultée en source).
function citedInAnswer(answer, entity) {
  if (!answer) return false;
  const hay = stripAccents(answer);
  return entityNeedles(entity).some(n => hay.includes(n));
}

async function aiSearch(provider, query) {
  const r = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, query }),
  });
  return r.json();
}

async function getAvailableLLM() {
  try { const r = await fetch("/api/llm"); const d = await r.json(); return d.available || []; }
  catch { return []; }
}

// Mesure les citations IA sur les mots-clés à forte intention (sinon les 12 premiers).
// passes = nombre de répétitions par requête → fiabilise le taux (les IA varient).
async function collectGEO(sector, providers, addLog, passes = 3) {
  const allEntities = [
    { name: STUDIO_M.name, domain: STUDIO_M.domain, isMe: true },
    ...sector.competitors.map(c => ({ ...c, isMe: false })),
  ];
  const highIntent = sector.keywords.filter(k => /meilleur|avis|prix|classement/i.test(k));
  const keywords = (highIntent.length ? highIntent : sector.keywords).slice(0, 12);
  const geo = {};
  allEntities.forEach(e => { geo[e.domain] = { ...e, byKw: {}, cited: 0, total: 0 }; });

  for (const kw of keywords) {
    for (const provider of providers) {
      for (let pass = 0; pass < passes; pass++) {
        addLog(`🤖 ${LLM_LABELS[provider] || provider} : "${kw}" (passage ${pass + 1}/${passes})`);
        try {
          const r = await aiSearch(provider, kw);
          if (r.error) { addLog("⚠️ " + (LLM_LABELS[provider] || provider) + " : " + r.error); continue; }
          for (const e of allEntities) {
            const cited = citedInAnswer(r.answer, e);
            const cell = geo[e.domain].byKw[kw] || (geo[e.domain].byKw[kw] = {});
            if (!cell[provider]) cell[provider] = { cited: 0, passes: 0 };
            cell[provider].passes++;
            geo[e.domain].total++;
            if (cited) { cell[provider].cited++; geo[e.domain].cited++; }
          }
          await new Promise(res => setTimeout(res, 350));
        } catch (err) { addLog("⚠️ " + err.message); }
      }
    }
  }
  return { entities: geo, keywords, providers, passes };
}

// ─── Historique GEO (tendance dans le temps) ──────────────────────────────────
function saveGeoHistory(sectorId, geo) {
  const key = `geo_history_${sectorId}`;
  const h = JSON.parse(localStorage.getItem(key) || "[]");
  const entry = { date: new Date().toISOString(), passes: geo.passes || 1, rates: {} };
  Object.values(geo.entities).forEach(e => { entry.rates[e.domain] = e.total ? Math.round((e.cited / e.total) * 100) : 0; });
  h.push(entry);
  if (h.length > 20) h.splice(0, h.length - 20);
  localStorage.setItem(key, JSON.stringify(h));
}
function getGeoHistory(sectorId) {
  try { return JSON.parse(localStorage.getItem(`geo_history_${sectorId}`) || "[]"); } catch { return []; }
}

async function collectAll(sector, addLog) {
  const allEntities = [
    { name: STUDIO_M.name, domain: STUDIO_M.domain, isMe: true },
    ...sector.competitors.map(c => ({ ...c, isMe: false })),
  ];
  const results = {};
  const topResults = {};
  const paaResults = {};
  const adsResults = {};

  // 1. Positions + PAA + Ads par mot-clé
  for (const kw of sector.keywords) {
    addLog(`🔎 "${kw}"`);
    try {
      const data = await serperSearch(kw);

      // #1 Google (ignorer les sites génériques)
      const organics = data?.organic || [];
      const first = organics.find(r => {
        try {
          const d = new URL(r.link).hostname.replace("www.", "");
          return !GENERIC_DOMAINS.some(g => d === g || d.endsWith("." + g));
        } catch { return false; }
      });
      if (first) {
        const domain = new URL(first.link).hostname.replace("www.", "");
        topResults[kw] = { title: first.title, domain, link: first.link };
      }

      // People Also Ask
      if (data?.peopleAlsoAsk?.length) {
        paaResults[kw] = data.peopleAlsoAsk.map(p => ({ question: p.question, snippet: p.snippet || "", link: p.link || "" }));
      }

      // Google Ads
      if (data?.ads?.length) {
        adsResults[kw] = data.ads.map(a => {
          let adDomain = "";
          try { adDomain = new URL(a.link).hostname.replace("www.", ""); } catch { adDomain = a.link; }
          return { title: a.title, domain: adDomain, link: a.link, description: a.description || "" };
        });
      }

      for (const ent of allEntities) {
        if (!results[ent.domain]) results[ent.domain] = { ...ent, positions: {}, snippets: [], gmb: null, socials: {} };
        const pos = getPosition(data, ent.domain);
        results[ent.domain].positions[kw] = pos;
        const snip = getSnippet(data, ent.domain);
        if (snip) results[ent.domain].snippets.push(snip);
      }
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      addLog("⚠️ " + err.message);
    }
  }

  // 2. Brand search
  for (const ent of allEntities) {
    try {
      addLog(`🏷️ Brand: "${ent.name}"`);
      const bd = await serperSearch(ent.name);
      if (!results[ent.domain]) results[ent.domain] = { ...ent, positions: {}, snippets: [], gmb: null, socials: {} };
      results[ent.domain].brandPos = getPosition(bd, ent.domain);
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      addLog("⚠️ Brand " + err.message);
    }
  }

  // 3. Google Maps — recherche sur 3 mots-clés pour couvrir plus de résultats
  const mapsKeywords = sector.keywords.filter((_, i) => i === 0 || i === Math.floor(sector.keywords.length / 2) || i === sector.keywords.length - 1);
  for (const mkw of mapsKeywords) {
    try {
      addLog(`🗺️ Maps: "${mkw}"`);
      const mapsData = await serperMaps(mkw);
      for (const ent of allEntities) {
        // Ne pas écraser un GMB déjà trouvé
        if (results[ent.domain]?.gmb) continue;
        const gmb = getGMB(mapsData, ent.domain, ent.name);
        if (gmb && results[ent.domain]) results[ent.domain].gmb = gmb;
      }
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      addLog("⚠️ Maps " + err.message);
    }
  }

  // 4. Réseaux sociaux
  for (const ent of allEntities) {
    addLog(`📱 Réseaux sociaux: ${ent.name}`);
    try {
      results[ent.domain].socials = await searchSocials(ent.name);
    } catch { /* skip */ }
  }

  return { entities: results, topResults, paaResults, adsResults };
}

// ─── FORMAT POUR COPIER ──────────────────────────────────────────────────────

function getMissedOpportunities(entities, keywords) {
  const me = entities[STUDIO_M.domain];
  if (!me) return [];
  const missed = [];
  for (const kw of keywords) {
    if (me.positions[kw]) continue;
    const competitorsOnKw = Object.values(entities)
      .filter(d => !d.isMe && d.positions[kw])
      .map(d => ({ name: d.name, pos: d.positions[kw] }))
      .sort((a, b) => a.pos - b.pos);
    if (competitorsOnKw.length > 0) {
      missed.push({ keyword: kw, competitors: competitorsOnKw });
    }
  }
  return missed;
}

function formatForClaude(sector, data, prevPositions) {
  const entities = data.entities || data;
  const topResults = data.topResults || {};
  const paaResults = data.paaResults || {};
  const adsResults = data.adsResults || {};
  const me = entities[STUDIO_M.domain];
  const competitors = Object.values(entities).filter(d => !d.isMe);
  const missed = getMissedOpportunities(entities, sector.keywords);

  const formatEntity = (entity) => {
    const posLines = Object.entries(entity.positions || {})
      .map(([kw, pos]) => {
        let trend = "";
        if (prevPositions?.positions?.[entity.domain]?.[kw]) {
          const prev = prevPositions.positions[entity.domain][kw];
          if (pos && prev) {
            const diff = prev - pos;
            if (diff > 0) trend = ` (↑${diff})`;
            else if (diff < 0) trend = ` (↓${Math.abs(diff)})`;
          } else if (pos && !prev) trend = " (NEW)";
          else if (!pos && prev) trend = ` (PERDU, était #${prev})`;
        }
        return `  "${kw}": ${pos ? "#" + pos : "absent"}${trend}`;
      })
      .join("\n");
    const gmb = entity.gmb
      ? `  GMB: position #${entity.gmb.position} · ${entity.gmb.rating}⭐ (${entity.gmb.reviews} avis)`
      : "  GMB: absent du Local Pack";
    const socialLines = Object.entries(entity.socials || {})
      .map(([p, info]) => `  ${p}: ${info.url}`)
      .join("\n");
    const score = computeSeoScore(entity, sector.keywords.length);
    const snips = entity.snippets?.length ? `  Snippets: ${entity.snippets.slice(0, 2).join(" | ")}` : "";
    return `${entity.name} (${entity.domain}) — Score SEO: ${score}/100\n${posLines}\n${gmb}${socialLines ? "\n  Réseaux sociaux:\n" + socialLines : ""}${snips ? "\n" + snips : ""}`;
  };

  let text = `═══ VEILLE SEO — ${sector.label} ═══\n`;
  text += `Date : ${new Date().toLocaleDateString("fr-FR")}\n`;
  text += `Source : Serper API (Google France)\n`;
  text += `Mots-clés analysés : ${sector.keywords.length}\n\n`;
  text += `── STUDIO M RENNES (studio-m.fr) ──\n`;
  text += formatEntity(me) + "\n";
  text += `Page cible : ${STUDIO_M.page}\n\n`;

  if (missed.length > 0) {
    text += `── OPPORTUNITÉS MANQUÉES (Studio M absent, concurrents présents) ──\n`;
    missed.forEach(m => {
      text += `  "${m.keyword}" → ${m.competitors.map(c => `${c.name} #${c.pos}`).join(", ")}\n`;
    });
    text += "\n";
  }

  if (Object.keys(topResults).length > 0) {
    text += `── #1 GOOGLE PAR MOT-CLÉ ──\n`;
    sector.keywords.forEach(kw => {
      const top = topResults[kw];
      if (top) text += `  "${kw}" → ${top.domain} (${top.title})\n`;
    });
    text += "\n";
  }

  // Google Ads
  const allAdDomains = {};
  Object.entries(adsResults).forEach(([kw, ads]) => {
    ads.forEach(a => {
      if (!allAdDomains[a.domain]) allAdDomains[a.domain] = [];
      if (!allAdDomains[a.domain].includes(kw)) allAdDomains[a.domain].push(kw);
    });
  });
  if (Object.keys(allAdDomains).length > 0) {
    text += `── GOOGLE ADS (qui achète quels mots-clés) ──\n`;
    Object.entries(allAdDomains)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([domain, kws]) => {
        text += `  ${domain} → ${kws.length} mots-clés : ${kws.join(", ")}\n`;
      });
    text += "\n";
  }

  // PAA
  const allQuestions = new Set();
  Object.values(paaResults).forEach(questions => {
    questions.forEach(q => allQuestions.add(q.question));
  });
  if (allQuestions.size > 0) {
    text += `── PEOPLE ALSO ASK (questions fréquentes Google) ──\n`;
    [...allQuestions].slice(0, 15).forEach(q => {
      text += `  • ${q}\n`;
    });
    text += "\n";
  }

  text += `── CONCURRENTS ──\n`;
  text += competitors.map(formatEntity).join("\n\n");

  if (data.geo && data.geo.entities) {
    const g = data.geo;
    text += `\n\n── CITATIONS IA (GEO) — ${g.providers.map(p => p).join(", ")} · ${g.keywords.length} mots-clés ──\n`;
    Object.values(g.entities)
      .map(e => ({ ...e, rate: e.total ? Math.round((e.cited / e.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .forEach(e => { text += `  ${e.isMe ? "🎯 " : ""}${e.name} : ${e.rate}% cité (${e.cited}/${e.total} mesures IA)\n`; });
  }
  return text;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

const Tag = ({ children, color = T.dim }) => (
  <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600, background: color + "18", color, border: "1px solid " + color + "30", margin: "2px" }}>{children}</span>
);

const PosBadge = ({ pos, prev }) => {
  if (!pos) return <span style={{ fontSize: 11, color: T.dim }}>—</span>;
  const color = pos <= 3 ? T.green : pos <= 5 ? T.warm : pos <= 10 ? T.yellow : T.red;
  let trend = null;
  if (prev) {
    const diff = prev - pos;
    if (diff > 0) trend = { text: `↑${diff}`, color: T.green };
    else if (diff < 0) trend = { text: `↓${Math.abs(diff)}`, color: T.red };
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800, background: color + "18", color, border: "1px solid " + color + "35" }}>#{pos}</span>
      {trend && <span style={{ fontSize: 8, fontWeight: 800, color: trend.color }}>{trend.text}</span>}
    </span>
  );
};

function ScoreBar({ score, color }) {
  const bg = score >= 70 ? T.green : score >= 40 ? T.warm : T.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.elevated, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 3, background: bg, transition: "width .5s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: bg, minWidth: 32, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function EntityCard({ entity, isMe, sectorColor, totalKeywords, prevPositions }) {
  const avgPos = Object.values(entity.positions || {}).filter(Boolean);
  const avg = avgPos.length ? (avgPos.reduce((a, b) => a + b, 0) / avgPos.length).toFixed(1) : null;
  const ranked = avgPos.length;
  const total = Object.keys(entity.positions || {}).length;
  const coverage = total > 0 ? Math.round((ranked / total) * 100) : 0;
  const score = computeSeoScore(entity, totalKeywords);

  const socialIcons = { instagram: "📸", tiktok: "🎵", linkedin: "💼", youtube: "▶️", facebook: "👥" };

  return (
    <div style={{ background: T.card, border: "1px solid " + (isMe ? sectorColor + "40" : T.border), borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      {isMe && <div style={{ height: 2, background: sectorColor }} />}
      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: isMe ? sectorColor : T.text }}>{isMe ? "🎯 " : ""}{entity.name}</span>
            <span style={{ fontSize: 10, color: T.dim, marginLeft: 8, fontFamily: "monospace" }}>{entity.domain}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: T.sub, background: T.elevated, padding: "3px 10px", borderRadius: 99 }}>
              Couverture <strong style={{ color: coverage >= 60 ? T.green : coverage >= 30 ? T.warm : T.red }}>{coverage}%</strong> <span style={{ color: T.dim }}>({ranked}/{total})</span>
            </div>
            {avg && (
              <div style={{ fontSize: 10, color: T.sub, background: T.elevated, padding: "3px 10px", borderRadius: 99 }}>
                Moy. <strong style={{ color: T.text }}>#{avg}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Score SEO */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>Score SEO</div>
          <ScoreBar score={score} color={sectorColor} />
        </div>

        {/* Positions par mot-clé */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {Object.entries(entity.positions || {}).map(([kw, pos]) => {
            const prev = prevPositions?.positions?.[entity.domain]?.[kw];
            return (
              <div key={kw} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: T.elevated, borderRadius: 8 }}>
                <span style={{ fontSize: 10, color: T.sub, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw}</span>
                <PosBadge pos={pos} prev={prev} />
              </div>
            );
          })}
        </div>

        {/* GMB + Brand */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {entity.gmb ? (
            <Tag color={T.blue}>📍 GMB #{entity.gmb.position} · {entity.gmb.rating}⭐ ({entity.gmb.reviews} avis)</Tag>
          ) : (
            <Tag color={T.dim}>📍 GMB absent</Tag>
          )}
          {entity.brandPos && (
            <Tag color={entity.brandPos === 1 ? T.green : T.warm}>🏷️ Brand #{entity.brandPos}</Tag>
          )}
        </div>

        {/* Réseaux sociaux */}
        {Object.keys(entity.socials || {}).length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(entity.socials).map(([platform, info]) => (
              <a key={platform} href={info.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Tag color={T.cyan}>{socialIcons[platform] || "🌐"} {platform}</Tag>
              </a>
            ))}
            {SOCIAL_PLATFORMS.filter(p => !entity.socials[p]).map(p => (
              <Tag key={p} color={T.dim}>{socialIcons[p] || "🌐"} {p} absent</Tag>
            ))}
          </div>
        )}

        {/* Snippets */}
        {entity.snippets?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {entity.snippets.slice(0, 2).map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: T.sub, lineHeight: 1.6, padding: "4px 0", borderTop: i > 0 ? "1px solid " + T.border : "none" }}>"{s}"</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MissedOpportunities({ data, keywords }) {
  const missed = getMissedOpportunities(data, keywords);
  if (missed.length === 0) return (
    <div style={{ background: T.card, border: "1px solid " + T.green + "30", borderRadius: 14, padding: "14px 16px", marginBottom: 14, textAlign: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: T.green }}>Studio M est positionné sur tous les mots-clés !</span>
    </div>
  );
  return (
    <div style={{ background: T.card, border: "1px solid " + T.red + "30", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${T.red}, ${T.warm})` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: T.red }}>🚨 Opportunités manquées — Studio M absent</div>
        <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Mots-clés où Studio M n'apparaît pas dans le top 10, mais les concurrents oui</div>
        {missed.map(m => (
          <div key={m.keyword} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.elevated, borderRadius: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.warm, flex: 1 }}>"{m.keyword}"</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {m.competitors.map(c => (
                <span key={c.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: T.green + "15", color: T.green, border: "1px solid " + T.green + "30" }}>
                  {c.name.split(" ")[0]} #{c.pos}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PAASection({ paaResults }) {
  const allQuestions = [];
  const seen = new Set();
  Object.entries(paaResults).forEach(([kw, questions]) => {
    questions.forEach(q => {
      if (!seen.has(q.question)) {
        seen.add(q.question);
        allQuestions.push({ ...q, keyword: kw });
      }
    });
  });
  if (allQuestions.length === 0) return null;

  return (
    <div style={{ background: T.card, border: "1px solid " + T.blue + "30", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: T.blue }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: T.blue }}>❓ People Also Ask — Idées de contenu</div>
        <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Questions que les internautes posent sur Google. Répondre à ces questions sur votre site = trafic potentiel.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allQuestions.slice(0, 15).map((q, i) => (
            <div key={i} style={{ padding: "8px 12px", background: T.elevated, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: T.text, flex: 1 }}>{q.question}</span>
              <span style={{ fontSize: 9, color: T.dim, whiteSpace: "nowrap", padding: "2px 6px", background: T.card, borderRadius: 4 }}>{q.keyword.length > 25 ? q.keyword.slice(0, 25) + "…" : q.keyword}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeoPanel({ geo }) {
  if (!geo || !geo.entities) return null;
  const { entities, keywords, providers } = geo;
  const passes = geo.passes || 1;
  const me = entities[STUDIO_M.domain];
  const sorted = Object.values(entities)
    .map(e => ({ ...e, rate: e.total ? Math.round((e.cited / e.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);
  const provLabel = p => LLM_LABELS[p] || p;
  return (
    <div style={{ background: T.card, border: "1px solid " + T.purple + "30", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${T.purple}, ${T.cyan})` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: T.purple }}>🤖 Citations IA — GEO ({providers.map(provLabel).join(" · ")})</div>
        <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Taux où ton école est <b>nommée dans la réponse</b> de l'IA (pas juste consultée en source), recherche web activée, sur {keywords.length} mots-clés × <b>{passes} passage{passes > 1 ? "s" : ""}</b>. {passes > 1 ? "Mesure fiabilisée par répétition." : "1 passage = indicatif ; augmente les passages pour fiabiliser."}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {sorted.map((ent, i) => (
            <div key={ent.domain} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? T.green : T.sub, width: 18 }}>#{i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: ent.isMe ? 800 : 600, color: ent.isMe ? T.purple : T.text, width: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ent.isMe ? "🎯 " : ""}{ent.name}</span>
              <div style={{ flex: 1 }}><ScoreBar score={ent.rate} color={T.purple} /></div>
              <span style={{ fontSize: 10, color: T.dim, minWidth: 54, textAlign: "right" }}>{ent.cited}/{ent.total}</span>
            </div>
          ))}
        </div>
        {me && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>🎯 Studio M cité ? (mot-clé × moteur)</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead><tr>
                <th style={{ textAlign: "left", padding: "6px 8px", color: T.sub, borderBottom: "1px solid " + T.border }}>Mot-clé</th>
                {providers.map(p => <th key={p} style={{ textAlign: "center", padding: "6px 8px", color: T.purple, borderBottom: "1px solid " + T.border }}>{provLabel(p)}</th>)}
              </tr></thead>
              <tbody>
                {keywords.map(kw => (
                  <tr key={kw}>
                    <td style={{ padding: "6px 8px", color: T.text, borderBottom: "1px solid " + T.border, maxWidth: 220 }}>{kw}</td>
                    {providers.map(p => {
                      const c = me.byKw[kw] && me.byKw[kw][p];
                      const hit = c && c.cited > 0;
                      const label = !c ? "·" : (c.passes > 1 ? `${c.cited}/${c.passes}` : (c.cited ? "✓" : "·"));
                      const col = hit ? (c.cited === c.passes ? T.green : T.warm) : T.dim;
                      return <td key={p} style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid " + T.border, color: col, fontWeight: 800 }}>{label}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function geoSpark(values, color) {
  if (!values || values.length < 2) return null;
  const w = 120, h = 26, min = Math.min(...values), max = Math.max(...values, 1), span = (max - min) || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1) * w).toFixed(1)},${(h - 3 - ((v - min) / span) * (h - 6)).toFixed(1)}`).join(" ");
  return <svg width={w} height={h} style={{ verticalAlign: "middle" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
}

function GeoCoach({ geo, history }) {
  if (!geo || !geo.entities) return null;
  const me = geo.entities[STUDIO_M.domain];
  if (!me) return null;
  const rate = me.total ? Math.round((me.cited / me.total) * 100) : 0;
  const hist = (history || []).map(e => (e.rates ? e.rates[STUDIO_M.domain] : null)).filter(v => v != null);
  const prev = hist.length >= 2 ? hist[hist.length - 2] : null;
  const delta = prev != null ? rate - prev : null;
  const absents = (geo.keywords || []).filter(kw => {
    const row = me.byKw[kw] || {};
    return (geo.providers || []).every(p => !row[p] || row[p].cited === 0);
  });
  let verdict, vcolor;
  if (rate === 0) { verdict = "Tu n'es encore nommé sur aucune requête. C'est ta ligne de départ honnête — l'objectif immédiat est de passer au-dessus de 0."; vcolor = T.red; }
  else if (rate < 40) { verdict = "Tu perces sur quelques requêtes, mais tu restes minoritaire : les concurrents dominent encore le corpus de réputation que l'IA lit."; vcolor = T.warm; }
  else if (rate < 80) { verdict = "Bonne présence sur une partie des requêtes. Le travail restant : couvrir celles où tu es absent."; vcolor = T.yellow; }
  else { verdict = "Tu es nommé sur la majorité des requêtes — position solide. Il s'agit de la maintenir et de la défendre."; vcolor = T.green; }

  const levier = (titre, pourquoi, quoi) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text }}>{titre}</div>
      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2, lineHeight: 1.55 }}><b style={{ color: T.purple }}>Pourquoi : </b>{pourquoi}</div>
      <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2, lineHeight: 1.55 }}><b style={{ color: T.green }}>Quoi faire : </b>{quoi}</div>
    </div>
  );

  return (
    <div style={{ background: T.card, border: "1px solid " + T.green + "30", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${T.green},${T.cyan})` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: T.green }}>📈 Où j'en suis & comment progresser</div>
        <div style={{ fontSize: 12.5, color: T.text, marginBottom: 4 }}>Tu es nommé dans <b style={{ color: vcolor }}>{rate}%</b> des réponses IA mesurées ({me.cited}/{me.total}).</div>
        {delta != null && (
          <div style={{ fontSize: 11.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, color: delta > 0 ? T.green : delta < 0 ? T.red : T.sub }}>{delta > 0 ? `↑ +${delta} pts` : delta < 0 ? `↓ ${delta} pts` : "= stable"}</span>
            <span style={{ color: T.dim }}>depuis le dernier test ({prev}%)</span>
            {geoSpark(hist, T.purple)}
          </div>
        )}
        <div style={{ fontSize: 11.5, color: T.sub, marginBottom: 12, lineHeight: 1.6 }}>{verdict}</div>

        {absents.length > 0 && (
          <div style={{ fontSize: 11.5, color: T.sub, marginBottom: 12, padding: "8px 12px", background: T.red + "10", borderRadius: 8, lineHeight: 1.5 }}>
            <b style={{ color: T.warm }}>Totalement absent sur : </b>{absents.join(" · ")}.<br />Ce sont tes cibles prioritaires.
          </div>
        )}

        <div style={{ fontSize: 10.5, fontWeight: 800, color: T.purple, margin: "6px 0 6px", letterSpacing: ".06em" }}>POURQUOI UNE IA TE NOMME (OU PAS)</div>
        <div style={{ fontSize: 11.5, color: T.sub, marginBottom: 12, lineHeight: 1.6 }}>
          Pour « meilleure école… », l'IA recopie un <b>consensus</b> qu'elle lit dans des sources tierces (avis, classements, comparatifs). Elle ne te croit pas sur parole : elle nomme qui <b>revient</b> dans ces sources. D'où ce plan.
        </div>

        {levier("1. Réputation tierce — le plus puissant pour « meilleure / avis »",
          "« Le meilleur » est un consensus que l'IA recopie depuis les avis, classements et comparatifs. Ces requêtes se gagnent là, pas sur ton site.",
          "Récolte des avis Google (sollicite étudiants + diplômés) ; fais-toi lister et bien noter sur Diplomeo, Studyrama, L'Étudiant ; entre dans les articles « meilleures écoles … à Rennes ».")}
        {levier("2. Être trouvable & clairement identifiable",
          "L'IA ne nomme que ce qu'elle trouve et comprend. Sans page nette « école de [métier] à Rennes », tu n'es même pas candidat.",
          "Une page claire par programme × Rennes (titre + H1 explicites), des données structurées (schema), un Google Business Profile complet.")}
        {levier("3. Répondre aux sous-questions (prix, débouchés, programme)",
          "L'IA décompose « meilleure école » en sous-questions. Y répondre te rend plus citable — et te fait apparaître sur ces requêtes précises (ex. « … prix »).",
          "Ajoute des blocs-réponses datés : combien ça coûte, quels débouchés, quel programme, comment s'inscrire — plus une FAQ.")}
        {levier("4. Crédibilité (E-E-A-T)",
          "L'IA filtre pour les institutions fiables et reconnues.",
          "Mets en avant la reconnaissance RNCP, le taux d'insertion, les projets d'étudiants, les partenariats (TV Rennes…).")}

        <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>Refais le test après chaque action : si ce % monte, ton travail paie. C'est ta preuve.</div>
      </div>
    </div>
  );
}

function AdsSection({ adsResults, allEntities }) {
  // Agréger par annonceur
  const adsByDomain = {};
  Object.entries(adsResults).forEach(([kw, ads]) => {
    ads.forEach(a => {
      if (!adsByDomain[a.domain]) adsByDomain[a.domain] = { domain: a.domain, keywords: [], titles: new Set() };
      if (!adsByDomain[a.domain].keywords.includes(kw)) adsByDomain[a.domain].keywords.push(kw);
      adsByDomain[a.domain].titles.add(a.title);
    });
  });

  const sorted = Object.values(adsByDomain).sort((a, b) => b.keywords.length - a.keywords.length);
  if (sorted.length === 0) return null;

  return (
    <div style={{ background: T.card, border: "1px solid " + T.warm + "30", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${T.warm}, ${T.accent})` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: T.warm }}>💰 Google Ads — Qui achète quoi ?</div>
        <div style={{ fontSize: 11, color: T.sub, marginBottom: 12 }}>Annonceurs détectés sur vos mots-clés. Les mots-clés achetés ont une forte intention commerciale.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((ad, i) => {
            const isTracked = allEntities.some(e => ad.domain.includes(e.domain));
            return (
              <div key={i} style={{ padding: "8px 12px", background: T.elevated, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isTracked ? T.warm : T.pink }}>
                    {ad.domain}
                    {isTracked && <span style={{ marginLeft: 6, fontSize: 8, color: T.warm, background: T.warm + "15", padding: "1px 5px", borderRadius: 4 }}>concurrent</span>}
                    {!isTracked && <span style={{ marginLeft: 6, fontSize: 8, color: T.pink, background: T.pink + "15", padding: "1px 5px", borderRadius: 4 }}>externe</span>}
                  </span>
                  <span style={{ fontSize: 10, color: T.sub }}>{ad.keywords.length} mot{ad.keywords.length > 1 ? "s" : ""}-clé{ad.keywords.length > 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {ad.keywords.map(kw => (
                    <span key={kw} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: T.card, color: T.sub }}>{kw}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreOverview({ entities, totalKeywords, sectorColor }) {
  const sorted = Object.values(entities)
    .map(e => ({ ...e, score: computeSeoScore(e, totalKeywords) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${T.green}, ${sectorColor})` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>🏅 Score SEO global</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((ent, i) => (
            <div key={ent.domain} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? T.green : T.sub, width: 18 }}>#{i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: ent.isMe ? 800 : 600, color: ent.isMe ? sectorColor : T.text, width: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ent.isMe ? "🎯 " : ""}{ent.name}
              </span>
              <div style={{ flex: 1 }}>
                <ScoreBar score={ent.score} color={sectorColor} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsView({ sector, data, onCopy, copied, prevPositions, onRunGeo, geoStatus, availableLLM, geoPasses, onPassesChange, geoHistory }) {
  const entities = data.entities || data;
  const topResults = data.topResults || {};
  const paaResults = data.paaResults || {};
  const adsResults = data.adsResults || {};
  const me = entities[STUDIO_M.domain];
  const competitors = Object.values(entities).filter(d => !d.isMe);

  const allEntities = [me, ...competitors].filter(Boolean);
  const keywords = sector.keywords;
  const geoScanning = geoStatus === "scanning";
  const hasLLM = (availableLLM || []).length > 0;

  return (
    <div style={{ animation: "fadeIn .4s ease" }}>
      {/* Boutons */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, gap: 8, alignItems: "center" }}>
        {prevPositions && (
          <span style={{ fontSize: 10, color: T.dim }}>
            Comparé au {new Date(prevPositions.date).toLocaleDateString("fr-FR")}
          </span>
        )}
        {hasLLM && (
          <select value={geoPasses} onChange={e => onPassesChange(Number(e.target.value))} disabled={geoScanning} title="Nombre de répétitions par requête : plus = plus fiable" style={{ padding: "8px 10px", borderRadius: 9, fontSize: 11, fontWeight: 600, border: "1px solid " + T.border, background: T.elevated, color: T.sub }}>
            <option value={1}>1 passage (rapide)</option>
            <option value={3}>3 passages (fiable)</option>
            <option value={5}>5 passages (rigoureux)</option>
          </select>
        )}
        <button onClick={onRunGeo} disabled={geoScanning || !hasLLM} title={hasLLM ? "Mesure les citations IA sur tes mots-clés" : "Aucune clé IA configurée (GEMINI_API_KEY… dans les variables Vercel)"} style={{ padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "1px solid " + T.purple + "55", background: geoScanning ? T.elevated : T.purple + "18", color: hasLLM ? T.purple : T.dim }}>
          {geoScanning ? "🤖 Mesure GEO..." : hasLLM ? "🤖 Mesurer le GEO" : "🤖 GEO (clé IA manquante)"}
        </button>
        <button onClick={onCopy} style={{ padding: "9px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none", background: copied ? T.green : `linear-gradient(135deg,${T.accent},${T.warm})`, color: "#fff", transition: "all .3s" }}>
          {copied ? "✅ Copié ! Colle dans Claude Pro" : "📋 Copier pour Claude Pro"}
        </button>
      </div>

      {/* Score SEO */}
      <ScoreOverview entities={entities} totalKeywords={keywords.length} sectorColor={sector.color} />

      {/* GEO — citations IA */}
      {data.geo && <GeoPanel geo={data.geo} />}
      {data.geo && <GeoCoach geo={data.geo} history={geoHistory} />}

      {/* Opportunités manquées */}
      <MissedOpportunities data={entities} keywords={keywords} />

      {/* Google Ads */}
      <AdsSection adsResults={adsResults} allEntities={allEntities} />

      {/* PAA */}
      <PAASection paaResults={paaResults} />

      {/* Grille positions */}
      <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: 2, background: sector.color }} />
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>📊 Positions Google — {sector.label}</div>
            <div style={{ fontSize: 10, color: T.sub }}>{keywords.length} mots-clés analysés</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: T.sub, fontWeight: 600, borderBottom: "1px solid " + T.border, position: "sticky", left: 0, background: T.card, zIndex: 1 }}>Mot-clé</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: T.warm, fontWeight: 700, borderBottom: "1px solid " + T.border, whiteSpace: "nowrap", minWidth: 140 }}>🏆 #1 Google</th>
                  {allEntities.map(ent => (
                    <th key={ent.domain} style={{ textAlign: "center", padding: "6px 8px", color: ent.isMe ? sector.color : T.sub, fontWeight: 700, borderBottom: "1px solid " + T.border, whiteSpace: "nowrap" }}>
                      {ent.isMe ? "🎯 " : ""}{ent.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keywords.map(kw => {
                  const mePos = me?.positions?.[kw];
                  const isAbsent = !mePos;
                  const anyCompetitorPresent = competitors.some(c => c.positions?.[kw]);
                  const rowHighlight = isAbsent && anyCompetitorPresent;
                  const top = topResults[kw];
                  const isTracked = top && allEntities.some(e => top.domain.includes(e.domain));
                  const hasAds = adsResults[kw]?.length > 0;
                  return (
                    <tr key={kw} style={{ background: rowHighlight ? T.red + "08" : "transparent" }}>
                      <td style={{ padding: "6px 8px", color: rowHighlight ? T.warm : T.text, fontWeight: rowHighlight ? 700 : 400, borderBottom: "1px solid " + T.border, position: "sticky", left: 0, background: rowHighlight ? T.red + "08" : T.card, zIndex: 1, fontSize: 11, maxWidth: 220 }}>
                        {kw}
                        {hasAds && <span style={{ marginLeft: 4, fontSize: 8, color: T.warm }} title="Des annonces Google Ads sont actives sur ce mot-clé">💰</span>}
                      </td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid " + T.border, fontSize: 10, maxWidth: 160 }}>
                        {top ? (
                          <a href={top.link} target="_blank" rel="noopener noreferrer" style={{ color: isTracked ? T.green : T.pink, textDecoration: "none", fontWeight: 600 }} title={top.title}>
                            {top.domain}
                            {!isTracked && <span style={{ marginLeft: 4, fontSize: 8, color: T.pink, background: T.pink + "15", padding: "1px 5px", borderRadius: 4 }}>externe</span>}
                          </a>
                        ) : <span style={{ color: T.dim }}>—</span>}
                      </td>
                      {allEntities.map(ent => {
                        const prev = prevPositions?.positions?.[ent.domain]?.[kw];
                        return (
                          <td key={ent.domain} style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid " + T.border }}>
                            <PosBadge pos={ent.positions?.[kw]} prev={prev} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cards détaillées */}
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>📋 Détails par entité</div>
      {me && <EntityCard entity={me} isMe sectorColor={sector.color} totalKeywords={keywords.length} prevPositions={prevPositions} />}
      {competitors.map(c => <EntityCard key={c.domain} entity={c} isMe={false} sectorColor={sector.color} totalKeywords={keywords.length} prevPositions={prevPositions} />)}
    </div>
  );
}

function LogPanel({ logs }) {
  if (!logs.length) return null;
  return (
    <div style={{ maxHeight: 130, overflow: "auto", padding: "8px 12px", background: T.elevated, borderRadius: 10, border: "1px solid " + T.border, margin: "10px auto", maxWidth: 520 }}>
      {logs.slice(-10).map((l, i) => (
        <div key={i} style={{ fontSize: 9, fontFamily: "monospace", lineHeight: 1.9, color: l.includes("❌") ? T.red : l.includes("⚠️") ? T.yellow : l.includes("✅") || l.includes("🤖") ? T.green : l.includes("🔎") || l.includes("🗺️") ? T.cyan : T.dim }}>{l}</div>
      ))}
    </div>
  );
}

function relDate(daysAgo) {
  if (daysAgo <= 0) return "aujourd'hui";
  if (daysAgo === 1) return "hier";
  if (daysAgo < 7) return `il y a ${daysAgo} j`;
  return `il y a ${Math.round(daysAgo / 7)} sem.`;
}

function NewsView({ status, data, onRefresh, onClose }) {
  const items = (data && data.items) || [];
  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg + "FA", zIndex: 100, overflow: "auto", padding: "20px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>📰 Nouveautés GEO / SEO</div>
            <div style={{ fontSize: 11, color: T.sub }}>
              Actus des 3 dernières semaines · dates réelles de Google News (jamais devinées){data && data.fetchedAt ? " · maj " + new Date(data.fetchedAt).toLocaleString("fr-FR") : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onRefresh} disabled={status === "loading"} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "1px solid " + T.border, background: "transparent", color: T.sub }}>{status === "loading" ? "⏳ ..." : "⟳ Actualiser"}</button>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none", background: T.elevated, color: T.text }}>✕ Fermer</button>
          </div>
        </div>

        {status === "loading" && <div style={{ textAlign: "center", padding: 40, color: T.sub, fontSize: 13 }}>Recherche des actualités datées…</div>}
        {data && data.error && <div style={{ padding: 16, borderRadius: 12, background: T.red + "15", color: T.red, fontSize: 13 }}>{data.error}<div style={{ fontSize: 11, color: T.sub, marginTop: 6 }}>Vérifie que SERPER_API_KEY est bien définie dans les variables Vercel.</div></div>}

        {data && data.summary && (
          <div style={{ background: T.card, border: "1px solid " + T.purple + "30", borderRadius: 14, padding: "14px 16px", marginBottom: 14, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.purple, marginBottom: 8 }}>🤖 Ce qui ressort (synthèse Gemini)</div>
            {data.summary}
          </div>
        )}

        {status === "done" && items.length === 0 && !(data && data.error) && (
          <div style={{ textAlign: "center", padding: 40, color: T.sub, fontSize: 13 }}>Aucune nouveauté datée dans les 3 dernières semaines sur ces sujets. (C'est une info honnête, pas un bug.)</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it, i) => (
            <a key={i} href={it.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{it.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: it.daysAgo <= 7 ? T.green : T.warm, whiteSpace: "nowrap" }}>{relDate(it.daysAgo)}</span>
                </div>
                <div style={{ fontSize: 10, color: T.dim, marginTop: 4 }}>{it.source}{it.date ? " · " + it.date : ""}</div>
                {it.snippet && <div style={{ fontSize: 11, color: T.sub, marginTop: 6, lineHeight: 1.5 }}>{it.snippet}</div>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [allData, setAllData] = useState({});
  const [status, setStatus] = useState({});
  const [activeSector, setActiveSector] = useState("design");
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [prevPositions, setPrevPositions] = useState({});
  const [availableLLM, setAvailableLLM] = useState([]);
  const [geoStatus, setGeoStatus] = useState({});
  const [newsOpen, setNewsOpen] = useState(false);
  const [newsData, setNewsData] = useState(null);
  const [newsStatus, setNewsStatus] = useState("idle");
  const [geoPasses, setGeoPasses] = useState(3);
  const [geoHistory, setGeoHistory] = useState({});
  const scanning = useRef(false);

  useEffect(() => { getAvailableLLM().then(setAvailableLLM); }, []);

  const loadNews = useCallback(async (force) => {
    const CACHE = "geo_news_cache";
    if (!force) {
      try {
        const c = JSON.parse(localStorage.getItem(CACHE) || "null");
        if (c && Date.now() - c.ts < 6 * 3600 * 1000) { setNewsData(c.data); setNewsStatus("done"); return; }
      } catch { /* cache illisible */ }
    }
    setNewsStatus("loading");
    try {
      const r = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ windowDays: 21 }) });
      let data;
      try { data = await r.json(); } catch { data = { error: "L'API /api/news n'est pas disponible (déploie sur Vercel, ou lance `vercel dev` en local)." }; }
      setNewsData(data);
      setNewsStatus("done");
      if (data && !data.error) localStorage.setItem(CACHE, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      setNewsData({ error: e.message });
      setNewsStatus("done");
    }
  }, []);

  const openNews = useCallback(() => { setNewsOpen(true); loadNews(false); }, [loadNews]);

  const addLog = useCallback(msg => {
    const ts = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(p => [...p.slice(-40), ts + " " + msg]);
  }, []);

  const runSector = useCallback(async (sectorId) => {
    if (scanning.current) return;
    scanning.current = true;
    const sector = SECTORS.find(s => s.id === sectorId);
    setStatus(p => ({ ...p, [sectorId]: "scanning" }));
    setLogs([]);
    setCopied(false);
    try {
      addLog(`🚀 Analyse ${sector.label} — ${sector.competitors.length + 1} entités · ${sector.keywords.length} mots-clés`);
      const data = await collectAll(sector, addLog);

      // Récupérer l'historique AVANT de sauvegarder
      const prev = getPreviousPositions(sectorId);
      // Si pas d'historique précédent, utiliser les données actuelles du localStorage
      const existingPrev = prev || (() => {
        const key = `veille_history_${sectorId}`;
        const history = JSON.parse(localStorage.getItem(key) || "[]");
        return history.length > 0 ? history[history.length - 1] : null;
      })();
      setPrevPositions(p => ({ ...p, [sectorId]: existingPrev }));

      // Sauvegarder dans l'historique
      saveHistory(sectorId, data);

      setAllData(p => ({ ...p, [sectorId]: data }));
      setStatus(p => ({ ...p, [sectorId]: "done" }));

      const historyDates = getHistoryDates(sectorId);
      addLog(`✅ Données collectées ! (${historyDates.length} analyse${historyDates.length > 1 ? "s" : ""} en historique)`);
    } catch (err) {
      addLog("❌ " + err.message);
      setStatus(p => ({ ...p, [sectorId]: "error" }));
    }
    scanning.current = false;
  }, [addLog]);

  const runAll = useCallback(async () => {
    for (const s of SECTORS) {
      await runSector(s.id);
      await new Promise(r => setTimeout(r, 2000));
    }
  }, [runSector]);

  const runGEO = useCallback(async (sectorId) => {
    if (scanning.current) return;
    if (!availableLLM.length) { addLog("⚠️ Aucune clé IA configurée (GEMINI_API_KEY… dans Vercel)"); return; }
    const sector = SECTORS.find(s => s.id === sectorId);
    const hi = sector.keywords.filter(k => /meilleur|avis|prix|classement/i.test(k));
    const nbKw = (hi.length ? hi : sector.keywords).slice(0, 12).length;
    const totalCalls = nbKw * availableLLM.length * geoPasses;
    const paid = availableLLM.some(p => p === "openai" || p === "claude");
    if ((paid || totalCalls > 60) && !window.confirm(`Ce test = ${totalCalls} appels (${nbKw} mots-clés × ${availableLLM.length} moteur(s) × ${geoPasses} passage(s)).${paid ? " Des moteurs PAYANTS sont actifs." : ""} Continuer ?`)) return;
    scanning.current = true;
    setGeoStatus(p => ({ ...p, [sectorId]: "scanning" }));
    setLogs([]);
    try {
      addLog(`🤖 Mesure GEO ${sector.label} — ${availableLLM.map(p => LLM_LABELS[p] || p).join(", ")} × ${geoPasses} passage(s)`);
      const geo = await collectGEO(sector, availableLLM, addLog, geoPasses);
      saveGeoHistory(sectorId, geo);
      setGeoHistory(p => ({ ...p, [sectorId]: getGeoHistory(sectorId) }));
      setAllData(p => ({ ...p, [sectorId]: { ...(p[sectorId] || {}), geo } }));
      setGeoStatus(p => ({ ...p, [sectorId]: "done" }));
      addLog("✅ Citations IA mesurées !");
    } catch (err) {
      addLog("❌ " + err.message);
      setGeoStatus(p => ({ ...p, [sectorId]: "error" }));
    }
    scanning.current = false;
  }, [addLog, availableLLM, geoPasses]);

  const handleCopy = useCallback(() => {
    const sector = SECTORS.find(s => s.id === activeSector);
    const data = allData[activeSector];
    if (!data) return;
    const text = formatForClaude(sector, data, prevPositions[activeSector]);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [activeSector, allData, prevPositions]);

  const isScanning = Object.values(status).some(s => s === "scanning");
  const activeData = allData[activeSector];
  const activeStatus = status[activeSector] || "idle";
  const activeSectorData = SECTORS.find(s => s.id === activeSector);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box}button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
      `}</style>

      {/* Header */}
      <header style={{ padding: "0 20px", height: 58, borderBottom: "1px solid " + T.border, background: T.surface + "F8", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},#C43A15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900 }}>Studio M — <span style={{ background: `linear-gradient(90deg,${T.accent},${T.warm})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Veille concurrentielle</span></div>
            <div style={{ fontSize: 9, color: T.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>SEO · Ads · PAA · Score · Historique · Réseaux sociaux</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={openNews} style={{ padding: "7px 16px", borderRadius: 9, fontSize: 11, fontWeight: 700, border: "1px solid " + T.purple + "55", background: T.purple + "18", color: T.purple }}>
            📰 Nouveautés
          </button>
          <button onClick={() => runSector(activeSector)} disabled={isScanning} style={{ padding: "7px 18px", borderRadius: 9, fontSize: 11, fontWeight: 700, border: "none", background: isScanning ? T.elevated : `linear-gradient(135deg,${activeSectorData.color},${T.accent})`, color: isScanning ? T.sub : "#fff" }}>
            {isScanning ? "⏳ Analyse..." : `${activeSectorData.emoji} Analyser`}
          </button>
          <button onClick={runAll} disabled={isScanning} style={{ padding: "7px 14px", borderRadius: 9, fontSize: 11, fontWeight: 600, border: "1px solid " + T.border, background: "transparent", color: T.sub }}>
            Tout analyser
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 8 }}>
        {SECTORS.map(s => {
          const st = status[s.id] || "idle";
          const active = activeSector === s.id;
          const histCount = getHistoryDates(s.id).length;
          return (
            <button key={s.id} onClick={() => { setActiveSector(s.id); setCopied(false); }} style={{ padding: "10px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700, border: "1px solid " + (active ? s.color + "55" : T.border), background: active ? s.color + "12" : "transparent", color: active ? s.color : T.sub, position: "relative", transition: "all .2s" }}>
              {s.emoji} {s.label}
              {histCount > 0 && <span style={{ marginLeft: 6, fontSize: 8, color: T.dim, background: T.elevated, padding: "1px 5px", borderRadius: 4 }}>{histCount}x</span>}
              {st === "done" && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: T.green }} />}
              {st === "scanning" && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: T.yellow, animation: "pulse 1s infinite" }} />}
            </button>
          );
        })}
      </div>

      <main style={{ padding: "14px 20px 80px" }}>
        {/* Idle */}
        {activeStatus === "idle" && !activeData && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 16, textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>{activeSectorData.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Veille {activeSectorData.label}</div>
            <div style={{ fontSize: 13, color: T.sub, maxWidth: 460, lineHeight: 1.8 }}>
              Analyse {activeSectorData.keywords.length} mots-clés, {activeSectorData.competitors.length} concurrents.<br />
              Positions Google + Ads + PAA + Score SEO + Réseaux sociaux.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 420, width: "100%", marginTop: 8 }}>
              {[{ label: "studio-m.fr", tag: "Vous", color: T.accent }, ...activeSectorData.competitors.map(c => ({ label: c.name, tag: c.domain, color: T.dim }))].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 14px", background: T.card, borderRadius: 10, border: "1px solid " + (i === 0 ? T.accent + "40" : T.border) }}>
                  <span style={{ fontSize: 12, fontWeight: i === 0 ? 800 : 600, color: i === 0 ? T.accent : T.text }}>{i === 0 ? "🎯 " : ""}{item.label}</span>
                  <span style={{ fontSize: 10, color: T.dim, fontFamily: "monospace" }}>{item.tag}</span>
                </div>
              ))}
            </div>
            <button onClick={() => runSector(activeSector)} style={{ marginTop: 8, padding: "14px 36px", borderRadius: 14, fontSize: 14, fontWeight: 800, border: "none", background: `linear-gradient(135deg,${activeSectorData.color},${T.accent})`, color: "#fff" }}>
              {activeSectorData.emoji} Lancer l'analyse
            </button>
          </div>
        )}

        {/* Scanning */}
        {activeStatus === "scanning" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 16 }}>
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + T.border }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: activeSectorData.color, animation: "spin .8s linear infinite" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{activeSectorData.emoji}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Collecte en cours...</div>
            <div style={{ fontSize: 12, color: T.sub }}>Serper interroge Google France pour chaque mot-clé</div>
            <LogPanel logs={logs} />
          </div>
        )}

        {/* Error */}
        {activeStatus === "error" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.red, marginBottom: 12 }}>Erreur de collecte</div>
            <LogPanel logs={logs} />
            <button onClick={() => runSector(activeSector)} style={{ marginTop: 14, padding: "11px 26px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", background: `linear-gradient(135deg,${T.accent},${T.red})`, color: "#fff" }}>Réessayer</button>
          </div>
        )}

        {/* Résultats */}
        {activeData && activeStatus === "done" && (
          <ResultsView sector={activeSectorData} data={activeData} onCopy={handleCopy} copied={copied} prevPositions={prevPositions[activeSector]} onRunGeo={() => runGEO(activeSector)} geoStatus={geoStatus[activeSector]} availableLLM={availableLLM} geoPasses={geoPasses} onPassesChange={setGeoPasses} geoHistory={geoHistory[activeSector]} />
        )}
      </main>

      {newsOpen && <NewsView status={newsStatus} data={newsData} onRefresh={() => loadNews(true)} onClose={() => setNewsOpen(false)} />}
    </div>
  );
}
