#!/usr/bin/env node
//
// Refuses a commit when this public repository mentions something private.
//
// WHY THIS EXISTS. This repository is the public face of a method that was built inside a private
// product. The examples here are rewritten, never copied, but "rewritten" is a promise, and a
// promise is a rule that depends on remembering. So the rule is a script: every commit runs it, and
// it refuses when a forbidden term or a secret-shaped string shows up in any tracked or staged file.
//
// The list of forbidden terms is NOT in this repository: a public list of what is secret would be
// the leak. It lives in a private file next to this repository, and the guard refuses to run
// without it (a guard that passes silently when its input is missing is not a guard).
//
//   METODO_DENYLIST=<path>   private list, one term per line, '#' comments. Default:
//                            ../joao/metodo-agentic-proibido.txt (relative to this repository)
//
// Run:  node tools/check-leaks.mjs            (all files git knows about, plus untracked ones)
//       node tools/check-leaks.mjs --dir <x>  (scan another folder, to watch it go red)
//
// No dependencies, on purpose.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const dirArg = args.includes('--dir') ? resolve(args[args.indexOf('--dir') + 1]) : ROOT
const listPath = process.env.METODO_DENYLIST || resolve(ROOT, '..', 'joao', 'metodo-agentic-proibido.txt')

const stop = (msg) => { console.error(`\n⛔ REFUSED - ${msg}`); process.exit(1) }

if (!existsSync(listPath)) stop(`private deny-list not found at ${listPath}. Set METODO_DENYLIST.`)
const terms = readFileSync(listPath, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
if (terms.length === 0) stop('the deny-list is empty: refusing to pretend everything is fine.')

// Secret-shaped strings, checked regardless of the list.
const SHAPES = [
  ['Anthropic key', /sk-ant-[A-Za-z0-9_-]{10,}/],
  ['OpenAI-style key', /\bsk-[A-Za-z0-9]{20,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['hosted database URL', /[a-z0-9]{20}\.supabase\.co/],
  ['email address', /[A-Za-z0-9._%+-]+@(?!example\.(com|org)\b)(?!anthropic\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
]

const SKIP_DIRS = new Set(['.git', 'node_modules', 'results', '.tmp'])
const files = []
const walk = (d) => {
  for (const name of readdirSync(d)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(d, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p)
    else if (s.size < 2_000_000) files.push(p)
  }
}
walk(dirArg)

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const termRes = terms.map((t) => [t, new RegExp(`(^|[^A-Za-z0-9])${escape(t)}($|[^A-Za-z0-9])`, 'i')])

const hits = []
for (const f of files) {
  const rel = relative(dirArg, f)
  if (rel === relative(ROOT, listPath)) continue
  const text = readFileSync(f, 'utf8')
  if (text.includes('\u0000')) continue // binary
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [t, re] of termRes) if (re.test(line)) hits.push(`${rel}:${i + 1}  forbidden term "${t}"`)
    for (const [label, re] of SHAPES) if (re.test(line)) hits.push(`${rel}:${i + 1}  looks like a ${label}`)
  })
}

if (hits.length) {
  console.error(hits.join('\n'))
  stop(`${hits.length} line(s) above would make something private public. Rewrite them; never widen the list to pass.`)
}
console.log(`✅ no leaks: ${files.length} files, ${terms.length} private terms, ${SHAPES.length} secret shapes.`)
