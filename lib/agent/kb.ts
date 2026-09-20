import type { KbEntry } from "../support-kit/types";
export type { KbEntry };

export const KB: KbEntry[] = [
  {
    id: "what",
    title: "What JSONSchema does",
    keywords: ["JSONSchema", "jsonschema", "what", "product", "about", "Turn sample JSON into a strict, valid JSON Schema"],
    body: "Turn sample JSON into a strict, valid JSON Schema. JSONSchema turns a sample JSON object into a strict JSON Schema (draft 2020-12), explains each required field, and lists the validation rules your API should enforce.",
    source: "JSONSchema product definition",
    tags: [],
  },
  {
    id: "features",
    title: "JSONSchema features",
    keywords: ["features", "feature", "can", "does", "Sample JSON to JSON Schema (draft 2020-12)", "Auto-marks required fields with explanation", "Deterministic compliance ruleset (json-schema-rules@2026-07-19)", "Flags missing type / bad format / duplicate enum", "Exportable schema report with runId", "Workflow runs — not bare AI credits"],
    body: "JSONSchema includes: Sample JSON to JSON Schema (draft 2020-12); Auto-marks required fields with explanation; Deterministic compliance ruleset (json-schema-rules@2026-07-19); Flags missing type / bad format / duplicate enum; Exportable schema report with runId; Workflow runs — not bare AI credits. It does not add capabilities that are not listed here.",
    source: "JSONSchema feature list",
    tags: [],
  },
  {
    id: "pricing",
    title: "JSONSchema pricing",
    keywords: ["price", "pricing", "plan", "cost", "billing", "subscription", "monthly", "yearly"],
    body: "Listed prices for JSONSchema: $19/month and $190/year. Checkout uses the in-app checkout route. This assistant cannot change a subscription or issue a refund.",
    source: "JSONSchema pricing fields",
    tags: [],
  },
  {
    id: "howto",
    title: "How to use JSONSchema",
    keywords: ["how", "start", "use", "tool", "run", "Generate a schema"],
    body: "Open JSONSchema and use Generate a schema. The form asks for: Paste sample JSON.",
    source: "JSONSchema tool fields",
    tags: [],
  },
  {
    id: "faq-1",
    title: "What is JSONSchema?",
    keywords: ["What", "is", "JSONSchema?"],
    body: "JSONSchema is a tool that turns a sample JSON object into a strict JSON Schema with explanations and validation rules.",
    source: "JSONSchema FAQ",
    tags: [],
  },
  {
    id: "faq-2",
    title: "What schema version does it use?",
    keywords: ["What", "schema", "version", "does", "it", "use?"],
    body: "It produces JSON Schema draft 2020-12, the current standard most validators support.",
    source: "JSONSchema FAQ",
    tags: [],
  },
  {
    id: "faq-3",
    title: "Does it mark required fields?",
    keywords: ["Does", "it", "mark", "required", "fields?"],
    body: "Yes. It marks required fields automatically from the sample.",
    source: "JSONSchema FAQ",
    tags: [],
  },
  {
    id: "honesty",
    title: "What this assistant will not claim",
    keywords: ["legal", "advice", "guarantee", "demo", "human", "refund", "support"],
    body: "Answers about JSONSchema are decision support only, not legal, tax, accessibility-certification, or compliance sign-off. This assistant does not invent integrations, SSO, CSV export, or Slack connections unless they are already in the product description. If live AI is unavailable, the product must not pretend a demo result is live. Say you want a human and leave an email if you need a person.",
    source: "JSONSchema support policy",
    tags: ["compliance"],
  },
];

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}
function toWords(s: string): string[] {
  return normalize(s).split(/\s+/).map((w) => w.trim()).filter(Boolean);
}
function cjkBigrams(s: string): string[] {
  const grams: string[] = [];
  const han = /[\u4e00-\u9fff]/;
  for (const w of toWords(s)) {
    if (han.test(w) && w.length >= 2) {
      for (let i = 0; i < w.length - 1; i++) grams.push(w.slice(i, i + 2));
    }
  }
  return grams;
}
function scoreEntry(entry: KbEntry, query: string): number {
  const q = normalize(query);
  const qWords = new Set(toWords(q));
  const qGrams = new Set(cjkBigrams(q));
  let s = 0;
  for (const kw of entry.keywords) {
    const k = kw.toLowerCase();
    if (q.includes(k)) s += 3;
  }
  for (const tw of toWords(entry.title)) {
    if (qWords.has(tw)) s += 2;
  }
  const idx = normalize(entry.keywords.join(" ") + " " + entry.title + " " + entry.body.slice(0, 400));
  for (const g of qGrams) if (idx.includes(g)) s += 0.5;
  return s;
}

export interface RetrieveResult {
  entries: KbEntry[];
  topScore: number;
}

export function retrieve(query: string, topK = 4, entries: KbEntry[] = KB): RetrieveResult {
  const scored = entries
    .map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  return { entries: scored.map((x) => x.e), topScore: scored.length ? scored[0].s : 0 };
}

export function isComplianceRelated(entries: KbEntry[]): boolean {
  return entries.some((e) => e.tags.includes("compliance"));
}
