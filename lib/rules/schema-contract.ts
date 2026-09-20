// Alias module for standard L1 tool import path.
export { RULESET_VERSION, JSON_SCHEMA_RULES } from './json-schema-rules'
export const RULESET_ID = 'schema-contract'

export type RuleHit = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  passed: boolean
  remediation?: string
  ref?: string
}

import { runDeterministicChecks as _raw } from './json-schema-rules'

/** Adapt vertical checker (returns {hits}) to L1 RuleHit[] shape. */
export function runDeterministicChecks(inputs: Record<string, string>): RuleHit[] {
  const blob = Object.values(inputs || {}).join('\n')
  const out = _raw(blob) as any
  const hits = Array.isArray(out) ? out : out?.hits || []
  return hits.map((r: any) => ({
    id: String(r.id || r.ruleId || 'R'),
    title: String(r.title || r.name || 'check'),
    severity: (r.severity as 'low' | 'medium' | 'high') || 'medium',
    passed: r.passed !== undefined ? !!r.passed : false,
    remediation: r.remediation || r.message,
    ref: r.ref || r.source,
  }))
}

export function runAllRules(text: string) {
  return runDeterministicChecks({ text })
}
