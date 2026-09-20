export interface InputField {
  key: string
  label: string
  type: 'input' | 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "JSONSchema",
  slug: "jsonschema",
  productId: "PROD_4idZ4VpY5XSQhoRZ3wpFqs",
  priceMonthly: 19,
  yearlyProductId: "PROD_5Lswy0OSdLJOTzwWWQxj4i",
  priceYearly: 190,

  checkoutUrl: "https://pancake.waffo.ai/store/lixingliang-ai-tools-6cilbw8v/checkout/cs_8589a7a6-eb45-d9c4-a401-c3dacb04c84a",
  pipelineId: "json-schema-v1",
  rulesetId: "json-schema-rules@2026-07-19",
  rulesetVersion: "json-schema-rules@2026-07-19",
  tagline: "Turn sample JSON into a strict, valid JSON Schema",
  description: "JSONSchema turns a sample JSON object into a JSON Schema (draft 2020-12), explains each required field, and screens it with a deterministic compliance ruleset (type/required/format/enum). Export the schema your API can enforce.",
  toolTitle: "Generate a schema",
  resultLabel: "Your schema",
  ctaLabel: "Generate schema",
  features: [
    "Sample JSON to JSON Schema (draft 2020-12)",
    "Auto-marks required fields with explanation",
    "Deterministic compliance ruleset (json-schema-rules@2026-07-19)",
    "Flags missing type / bad format / duplicate enum",
    "Exportable schema report with runId",
    "Workflow runs — not bare AI credits"
  ],
  inputs: [
  {
    "key": "sample_json",
    "label": "Paste sample JSON",
    "type": "textarea",
    "placeholder": "e.g. {\"id\": 1, \"name\": \"Ada\", \"tags\": [\"x\"], \"active\": true}"
  },
  {
    "key": "strictness",
    "label": "Strictness",
    "type": "select",
    "options": [
      "Loose (allow extra)",
      "Strict (no extra props)"
    ]
  },
  {
    "key": "purpose",
    "label": "What is it for?",
    "type": "select",
    "options": [
      "API validation",
      "Docs",
      "TypeScript types"
    ]
  }
] as InputField[],
  definitionLead: "JSONSchema turns a sample JSON object into a strict JSON Schema (draft 2020-12), explains each required field, and lists the validation rules your API should enforce.",
  geoFaq: [
    { q: "What is JSONSchema?", a: "JSONSchema is a tool that turns a sample JSON object into a strict JSON Schema with explanations and validation rules." },
    { q: "What schema version does it use?", a: "It produces JSON Schema draft 2020-12, the current standard most validators support." },
    { q: "Does it mark required fields?", a: "Yes. It marks required fields automatically from the sample." },
    { q: "Does it explain the rules?", a: "It explains each validation rule in plain language so you know what the API should enforce." },
    { q: "Who should use it?", a: "API developers who want a strict, documented contract from a sample object." },
    { q: "Is it compliant with modern tooling?", a: "Draft 2020-12 compliance means the schema works with current validators." },
  ],
  systemPrompt: "You are a schema designer. Given a sample JSON, a strictness preference, and a purpose, produce a valid JSON Schema (draft 2020-12) with a declared $schema, mark required fields, and explain the key validation rules in plain English. Respect the deterministic compliance findings provided (missing type, bad format, duplicate enum, implicit additionalProperties). If purpose is TypeScript, also suggest equivalent types. In demo (mock) mode, return a realistic sample schema and explanation following exactly this structure.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "10 workflow runs / mo · watermarked export"
  },
  {
    "tier": "Pro",
    "price": "$19/mo",
    "desc": "300 workflow runs / mo · audit log · copy as Markdown/JSON text"
  },
  {
    "tier": "Enterprise",
    "price": "Custom",
    "desc": "SSO (roadmap) · BYOK · higher caps · shared rulesets"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const j = (inputs['sample_json'] || '').trim()
  const st = inputs['strictness'] || 'Loose'
  const pur = inputs['purpose'] || 'API validation'
  if (!j) return 'Paste a sample JSON object to generate a schema.'
  let out = 'JSON SCHEMA (' + st + ', for ' + pur + ')\n\n'
  out += '{\n'
  out += '  "$schema": "https://json-schema.org/draft/2020-12/schema",\n'
  out += '  "type": "object",\n'
  out += '  "required": ["id", "name"],\n'
  out += '  "properties": {\n'
  out += '    "id": { "type": "integer" },\n'
  out += '    "name": { "type": "string" },\n'
  out += '    "tags": { "type": "array", "items": { "type": "string" } },\n'
  out += '    "active": { "type": "boolean" }\n'
  out += '  }\n}\n\n'
  out += 'Rules:\n'
  out += '  - id, name are required; tags/active optional.\n'
  out += '  - ' + (st === 'Strict' ? 'additionalProperties: false (no extra keys allowed).' : 'additionalProperties allowed.') + '\n'
  out += '\n--- (Demo mode — not live AI. Add OPENAI_API_KEY for a schema from your real JSON.)'
  return out
}
}
