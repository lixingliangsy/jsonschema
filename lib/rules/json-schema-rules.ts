/**
 * JSONSchema vertical ruleset — deterministic JSON Schema compliance checks.
 * Runs AFTER the model emits a schema, so the output is screened for
 * type/required/format/enum correctness before you ship it.
 * Sources: JSON Schema 2020-12 Validation (see SOURCES.md).
 */
export const RULESET_VERSION = 'json-schema-rules@2026-07-19.3'

export type JsonRule = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  check: (ctx: { text: string; parsed: unknown }) => boolean
  remediation: string
  ref?: string
}

/** Registered format attributes (2020-12 + common OpenAPI extensions). Not types. */
const KNOWN_FORMATS = new Set([
  'date-time',
  'date',
  'time',
  'duration',
  'email',
  'idn-email',
  'hostname',
  'idn-hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'iri',
  'iri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex',
  // Common OpenAPI / tooling extensions
  'password',
  'byte',
  'binary',
  'int32',
  'int64',
  'float',
  'double',
  'decimal',
])

function parseIfPossible(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const JSON_SCHEMA_RULES: JsonRule[] = [
  {
    id: 'JS-01',
    title: 'Root schema is missing a "type" keyword',
    severity: 'high',
    check: ({ text, parsed }) => {
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>
        // enum/const alone can be valid without type (2020-12); skip if present
        if ('enum' in obj || 'const' in obj || '$ref' in obj) return false
        return !('type' in obj)
      }
      return !/"type"\s*:/.test(text)
    },
    remediation:
      'Declare a root "type" (usually "object"), or use enum/const/$ref intentionally. Without type/enum/const, validators accept almost anything.',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-02',
    title: '"required" lists a key that is not defined in "properties"',
    severity: 'medium',
    check: ({ parsed }) => {
      const obj = parsed as Record<string, any>
      if (!obj || typeof obj !== 'object' || !Array.isArray(obj.required) || !obj.properties) return false
      const props = Object.keys(obj.properties)
      return obj.required.some((k: string) => !props.includes(k))
    },
    remediation:
      'Every key in "required" should also exist in "properties" for a clear contract. required asserts presence; properties describes the value shape (JSON Schema 2020-12 §6.5.3).',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-03',
    title: 'Unknown "format" value (not in the JSON Schema registry)',
    severity: 'low',
    check: ({ text, parsed }) => {
      const fmts: string[] = []
      const re = /"format"\s*:\s*"([^"]+)"/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) fmts.push(m[1])
      if (parsed && typeof parsed === 'object') {
        JSON.stringify(parsed, (_k, v) => {
          if (v && typeof v === 'object' && typeof (v as any).format === 'string') fmts.push((v as any).format)
          return v
        })
      }
      return fmts.some((f) => !KNOWN_FORMATS.has(f))
    },
    remediation:
      'Use a registered format (e.g. "email", "date-time", "uri", "uuid"). Unknown formats are often ignored and give a false sense of safety (2020-12 format vocabulary).',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html#name-format',
  },
  {
    id: 'JS-04',
    title: '"enum" contains duplicate values',
    severity: 'low',
    check: ({ text }) => {
      const re = /"enum"\s*:\s*\[([\s\S]*?)\]/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) {
        const items = m[1].split(',').map((s) => s.trim()).filter(Boolean)
        if (new Set(items).size !== items.length) return true
      }
      return false
    },
    remediation:
      'Remove duplicate entries from "enum". 2020-12 says enum elements SHOULD be unique.',
    ref: 'https://www.learnjsonschema.com/2020-12/validation/enum/',
  },
  {
    id: 'JS-05',
    title: '"additionalProperties" left implicit on an object with "properties"',
    severity: 'medium',
    check: ({ text, parsed }) => {
      const obj = parsed as Record<string, any>
      if (!obj || typeof obj !== 'object' || !obj.properties) return false
      const strictIntent = /strict/i.test(text)
      const hasAdditional = 'additionalProperties' in obj
      return strictIntent && !hasAdditional
    },
    remediation:
      'In strict mode, set "additionalProperties": false explicitly. Leaving it implicit allows unknown keys, which defeats the closed-object contract.',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-06',
    title: 'Missing "$schema" (draft not declared)',
    severity: 'low',
    check: ({ text, parsed }) => {
      const obj = parsed as Record<string, any>
      if (obj && typeof obj === 'object' && '$schema' in obj) return false
      return !/\$schema/.test(text)
    },
    remediation:
      'Declare "$schema": "https://json-schema.org/draft/2020-12/schema" so validators agree on keyword semantics.',
    ref: 'https://json-schema.org/draft/2020-12',
  },
  {
    id: 'JS-07',
    title: 'Nested "object" is missing its own "properties"',
    severity: 'medium',
    check: ({ text, parsed }) => {
      const str = JSON.stringify(parsed ?? {})
      const re = /"type"\s*:\s*"object"/g
      let count = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(str))) count++
      if (count <= 1) return false
      const propsCount = (str.match(/"properties"\s*:/g) || []).length
      return count > propsCount
    },
    remediation:
      'Define "properties" for every nested object. An "object" with no properties validates as a loose any-object.',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-08',
    title: '"type" array contains duplicate type strings',
    severity: 'medium',
    check: ({ parsed }) => {
      const walk = (node: unknown): boolean => {
        if (!node || typeof node !== 'object') return false
        if (Array.isArray(node)) return node.some(walk)
        const obj = node as Record<string, unknown>
        if (Array.isArray(obj.type)) {
          const types = obj.type as string[]
          if (new Set(types).size !== types.length) return true
        }
        return Object.values(obj).some(walk)
      }
      return walk(parsed)
    },
    remediation:
      'When "type" is an array, elements MUST be unique strings (JSON Schema 2020-12 §6.1.1).',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-09',
    title: '"required" array contains duplicate property names',
    severity: 'low',
    check: ({ parsed }) => {
      const walk = (node: unknown): boolean => {
        if (!node || typeof node !== 'object') return false
        if (Array.isArray(node)) return node.some(walk)
        const obj = node as Record<string, unknown>
        if (Array.isArray(obj.required)) {
          const req = obj.required as string[]
          if (new Set(req).size !== req.length) return true
        }
        return Object.values(obj).some(walk)
      }
      return walk(parsed)
    },
    remediation:
      'Elements of "required" MUST be unique strings (JSON Schema 2020-12 §6.5.3).',
    ref: 'https://json-schema.org/draft/2020-12/json-schema-validation.html',
  },
  {
    id: 'JS-10',
    title: 'Output makes exaggerated efficacy / guarantee claims',
    severity: 'low',
    check: ({ text }) => /(100% valid|guaranteed valid|always validates|never fails|perfect schema)/i.test(text),
    remediation:
      'Avoid exaggerated claims. Schema correctness depends on the validator + data; state "compliance findings" not absolute guarantees.',
    ref: 'https://json-schema.org/draft/2020-12',
  },
]

export function runDeterministicChecks(schemaText: string) {
  const safe = String(schemaText || '')
  const parsed = parseIfPossible(safe)
  const hits = JSON_SCHEMA_RULES.filter((r) => r.check({ text: safe, parsed })).map((r) => ({
    id: r.id,
    title: r.title,
    severity: r.severity,
    remediation: r.remediation,
    source: 'Rule-based' as const,
    ref: r.ref,
  }))
  return { rulesetVersion: RULESET_VERSION, hits }
}
