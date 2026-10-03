#!/usr/bin/env node
//
// Checks a repository's Markdown for the defect docs keep producing: a fact that was true when it
// was typed, copied into a second file, and never updated there. Also: dead relative links, state
// files that only grow, and config kept outside git without a version line.
//
// Config: docs-facts.json at the repository root (optional; without it only links are checked).
// Run:    node check-docs.mjs [--root <dir>]
//
// No dependencies, on purpose: a checker that needs installing is a checker that stops running.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative, sep } from 'node:path'

const args = process.argv.slice(2)
const ROOT = resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd())
const cfgPath = join(ROOT, 'docs-facts.json')
const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : null
const ignore = (cfg?.ignore || []).concat(['.git/', 'node_modules/'])
const rel = (p) => relative(ROOT, p).split(sep).join('/')
const ignored = (r) => ignore.some((i) => r === i.replace(/\/$/, '') || r.startsWith(i))

const md = []
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    const r = rel(p)
    if (ignored(r + (statSync(p).isDirectory() ? '/' : ''))) continue
    if (statSync(p).isDirectory()) walk(p)
    else if (n.endsWith('.md')) md.push(p)
  }
}
walk(ROOT)

const problems = []
const report = (file, line, rule, detail) => problems.push(`${file}:${line}  [${rule}] ${detail}`)

// 1. dead relative links: [text](path) that is not a URL or an anchor
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
for (const f of md) {
  readFileSync(f, 'utf8').split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(LINK)) {
      const target = m[1].split('#')[0]
      if (!target || /^[a-z]+:/i.test(target) || target.startsWith('${')) continue
      if (!existsSync(resolve(dirname(f), decodeURI(target)))) report(rel(f), i + 1, 'dead-link', `link to ${target} does not exist`)
    }
  })
}

if (cfg) {
  // 2. a fact restated outside its home
  for (const fact of cfg.facts || []) {
    const re = new RegExp(fact.pattern, 'i')
    if (!existsSync(join(ROOT, fact.home))) report(fact.home, 0, 'missing-home', `home of fact "${fact.id}" does not exist`)
    for (const f of md) {
      if (rel(f) === fact.home) continue
      readFileSync(f, 'utf8').split(/\r?\n/).forEach((line, i) => {
        if (re.test(line)) report(rel(f), i + 1, 'repeated-fact', `restates fact "${fact.id}" (home: ${fact.home}); point to it instead`)
      })
    }
  }
  // 3. state files have a line budget
  for (const s of cfg.stateFiles || []) {
    const p = join(ROOT, s.path)
    if (!existsSync(p)) continue
    const n = readFileSync(p, 'utf8').split(/\r?\n/).length
    if (n > s.maxLines) report(s.path, n, 'state-too-long', `${n} lines (budget ${s.maxLines}): rewrite it, history is in git`)
  }
  // 4. config kept outside git carries a version on its first line
  for (const v of cfg.versionedOutsideGit || []) {
    const p = join(ROOT, v)
    if (!existsSync(p)) continue
    const first = readFileSync(p, 'utf8').split(/\r?\n/)[0]
    if (!/\b(v\d+|version\s*\S+|\d{4}-\d{2}-\d{2})/i.test(first)) report(v, 1, 'unversioned', 'first line has no version or date')
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\n⛔ ${problems.length} problem(s) in the docs.`)
  process.exit(1)
}
console.log(`✅ docs ok: ${md.length} Markdown files${cfg ? `, ${(cfg.facts || []).length} facts with one home` : ' (links only: no docs-facts.json)'}.`)
