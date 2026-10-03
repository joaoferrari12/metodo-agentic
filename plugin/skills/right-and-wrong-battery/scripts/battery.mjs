#!/usr/bin/env node
//
// Runs every *.scenario.mjs in a folder, serially, with a fixed seed, and writes a report that lists
// what is RIGHT and what is WRONG. Exit code 1 if anything is wrong, so a guard can refuse on it.
//
// Usage: node battery.mjs <folder> [--seed 42] [--out battery-report.md] [--human "item;item"]
//
// No dependencies, on purpose.

import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d }
const dir = resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))) || '.')
const seed = Number(opt('--seed', '42'))
const out = opt('--out', 'battery-report.md')
const human = (opt('--human', '') || '').split(';').map((s) => s.trim()).filter(Boolean)

// mulberry32: small, fast, and the same sequence on every machine for the same seed.
const makeRng = (s) => () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0
  let t = Math.imul(s ^ (s >>> 15), 1 | s)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const show = (v) => (typeof v === 'string' ? v : JSON.stringify(v))

const files = readdirSync(dir).filter((f) => f.endsWith('.scenario.mjs')).sort()
if (files.length === 0) { console.error(`⛔ no *.scenario.mjs in ${dir}`); process.exit(1) }

const results = []
for (const [i, f] of files.entries()) {
  const mod = (await import(pathToFileURL(join(dir, f)).href)).default
  const lines = []
  const t = {
    rng: makeRng(seed + i),
    right: (label, observed) => lines.push({ ok: true, label, observed }),
    wrong: (label, expected, observed) => lines.push({ ok: false, label, expected, observed }),
    check(label, cond, expected, observed) { cond ? this.right(label, observed) : this.wrong(label, expected, observed) },
  }
  try { await mod.run(t) } catch (e) { lines.push({ ok: false, label: 'scenario threw', expected: 'no error', observed: String(e?.message || e) }) }
  if (lines.length === 0) lines.push({ ok: false, label: 'scenario recorded nothing', expected: 'at least one observation', observed: 'none' })
  results.push({ name: mod.name || f, persona: mod.persona || '', lines })
}

const all = results.flatMap((r) => r.lines)
const wrongs = all.filter((l) => !l.ok).length
const md = [
  `# Battery report`,
  ``,
  `Seed ${seed} · ${results.length} scenarios · **${all.length - wrongs} right · ${wrongs} wrong**`,
  ``,
  ...results.flatMap((r) => [
    `## ${r.name}${r.persona ? ` (${r.persona})` : ''}`,
    ``,
    ...r.lines.map((l) => (l.ok
      ? `- ✅ ${l.label}: ${show(l.observed)}`
      : `- ❌ ${l.label}: expected ${JSON.stringify(l.expected)}, saw ${JSON.stringify(l.observed)}`)),
    ``,
  ]),
  `## To be checked by a human`,
  ``,
  ...(human.length ? human.map((h) => `- [ ] ${h}`) : ['- (none declared: pass --human "sound;feel on a real phone")']),
  ``,
].join('\n')

writeFileSync(out, md)
console.log(md)
process.exit(wrongs ? 1 : 0)
