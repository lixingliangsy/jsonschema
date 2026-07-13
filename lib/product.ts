export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "JSONSchema",
  slug: "jsonschema",
  tagline: "Turn sample JSON into a strict schema + validator.",
  description: "Paste a sample JSON object and get a JSON Schema (draft 2020-12), a plain explanation of required fields, and the validation rules your API should enforce.",
  toolTitle: "Generate a schema",
  resultLabel: "Your schema",
  ctaLabel: "Generate schema",
  features: [
  "Sample JSON to JSON Schema",
  "Mark required fields automatically",
  "Explain each validation rule",
  "Draft 2020-12 compliant"
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
  systemPrompt: "You are a schema designer. Given a sample JSON, a strictness preference, and a purpose, produce a valid JSON Schema (draft 2020-12), mark required fields, and explain the key validation rules in plain English. If purpose is TypeScript, also suggest the equivalent types. In demo (mock) mode, return a realistic sample schema and explanation following exactly this structure.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "10 schemas/mo"
  },
  {
    "tier": "Pro",
    "price": "$19/mo",
    "desc": "Unlimited, save history"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const j = (inputs['sample_json'] || '').trim()
  const st = inputs['strictness'] || 'Loose'
  const pur = inputs['purpose'] || 'API validation'
  if (!j) return 'Paste a sample JSON object to generate a schema.'
  let out = 'JSON SCHEMA (' + st + ', for ' + pur + ')\n\n'
  out += '{\n'
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
  out += '\n--- (Mock demo. Paste your real JSON for a tailored schema.)'
  return out
}
}
