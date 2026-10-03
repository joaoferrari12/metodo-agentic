#!/usr/bin/env node
//
// How long each run took, measured in git:
//   start = the commit that created the run's record file
//   end   = the latest commit, in this or any --repos repository, whose message cites the run id
// Items = rows of the record's first table whose first cell is a number (the plan-run template's
// "Items and DONE" table), or "- [ ]" checkboxes when there is no such table.
//
// Usage: node pace.mjs --records docs/runs [--id 'RUN-\d+'] [--repos ../a,../b] [--since YYYY-MM-DD]
//
// Does NOT measure time the human spent away or deciding. No dependencies, on purpose.

import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d }
const recordsDir = resolve(opt('--records', 'docs/runs'))
const idRe = new RegExp(opt('--id', 'RUN-\\d+'), 'i')
const repos = [process.cwd(), ...(opt('--repos', '') || '').split(',').filter(Boolean)].map((r) => resolve(r))
const since = opt('--since')

const git = (cwd, ...a) => spawnSync('git', a, { cwd, encoding: 'utf8' }).stdout?.trim() || ''

const rows = []
for (const f of readdirSync(recordsDir).filter((n) => n.endsWith('.md')).sort()) {
  const id = f.match(idRe)?.[0]
  if (!id) continue
  const file = join(recordsDir, f)
  const added = git(recordsDir, 'log', '--diff-filter=A', '--follow', '--format=%cI', '--', f).split('\n').filter(Boolean).pop()
  if (!added) continue
  if (since && added.slice(0, 10) < since) continue
  const ends = repos.map((r) => git(r, 'log', '-i', '-E', `--grep=${id}([^0-9]|$)`, '-1', '--format=%cI')).filter(Boolean)
  const lastRecord = git(recordsDir, 'log', '-1', '--format=%cI', '--', f)
  const end = [...ends, lastRecord].filter(Boolean).sort((a, b) => new Date(a) - new Date(b)).pop()
  const text = readFileSync(file, 'utf8')
  let items = (text.match(/^\|\s*\d+\s*\|/gm) || []).length
  if (!items) items = (text.match(/^\s*-\s*\[[ x]\]/gim) || []).length
  const minutes = Math.round((new Date(end) - new Date(added)) / 60000)
  rows.push({ id, start: added, minutes, items, perItem: items ? minutes / items : null })
}

if (!rows.length) { console.error(`⛔ no run records with ids matching ${idRe} in ${recordsDir}`); process.exit(1) }

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const perDay = {}
for (const r of rows) perDay[r.start.slice(0, 10)] = (perDay[r.start.slice(0, 10)] || 0) + 1

console.log('| Run | Started | Minutes | Items | Min/item |')
console.log('|---|---|---:|---:|---:|')
for (const r of rows) console.log(`| ${r.id} | ${r.start.slice(0, 16).replace('T', ' ')} | ${r.minutes} | ${r.items} | ${r.perItem == null ? '-' : r.perItem.toFixed(1)} |`)
const per = rows.map((r) => r.perItem).filter((x) => x != null)
console.log('')
console.log(`Runs: ${rows.length} · median minutes per run: ${median(rows.map((r) => r.minutes))}` +
  (per.length ? ` · median minutes per item: ${median(per).toFixed(1)} (min ${Math.min(...per).toFixed(1)}, max ${Math.max(...per).toFixed(1)})` : ''))
console.log(`Runs per day: ${Object.entries(perDay).map(([d, n]) => `${d}: ${n}`).join(' · ')}`)
console.log('Not measured: time the human was away, asleep or deciding.')
