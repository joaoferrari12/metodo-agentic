#!/usr/bin/env node
//
// Commits and pushes ONE repository, but only through guards that refuse before anything changes.
//
// THE GUARDS, in the order they refuse (all BEFORE `git add`):
//   1. the current branch is the allowed one (default `main`);
//   2. the working tree EQUALS the list declared with --declared (the `git status --short` the
//      session said out loud). A different tree means something changed after the list was said;
//   3. the check command is green (default `npm test`), run in the repository;
//   4. history is never rewritten: there is no --force here, and if `origin/<branch>` is not an
//      ancestor of HEAD the push is refused instead of "resolved".
//
// Usage:
//   node publish-guard.mjs --declared "M a.ts;?? b.md" -m "message" [--check "npm test"]
//        [--branch main] [--remote origin] [--dir <repo>] [--dry-run] [--ci-already-red]
//   --declared ""     clean tree (for example, only pushing a merge)
//   --dry-run         run every guard and stop before `git add`
//   --dir             another folder; use it with --dry-run on a broken copy to watch it go red
//
// No dependencies, on purpose.

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d }
const has = (n) => args.includes(n)

const DIR = resolve(opt('--dir', process.cwd()))
const BRANCH = opt('--branch', 'main')
const REMOTE = opt('--remote', 'origin')
const CHECK = opt('--check', 'npm test')
const declared = opt('--declared')
const message = opt('-m')
const dryRun = has('--dry-run')

const stop = (msg) => { console.error(`\n⛔ NOT PUBLISHED - ${msg}`); process.exit(1) }
const git = (...a) => {
  const r = spawnSync('git', ['-c', 'core.quotepath=false', ...a], { cwd: DIR, encoding: 'utf8' })
  return { ok: r.status === 0, out: (r.stdout || '').trimEnd(), err: (r.stderr || '').trim() }
}

if (declared === undefined) stop('missing --declared: the `git status --short` you said in the conversation ("" for a clean tree).')
if (!dryRun && !message && declared.trim() !== '') stop('missing -m: the commit message.')
if (has('--force')) stop('there is no --force. History is never rewritten by this script.')

// 1. branch
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
if (!branch.ok) stop(`${DIR} is not a git repository.`)
if (branch.out !== BRANCH) stop(`on branch "${branch.out}", only "${BRANCH}" publishes.`)

// 2. tree equals the declared list
const norm = (s) => s.split(/[;\n]/).map((l) => l.trim().replace(/\s+/g, ' ')).filter(Boolean).sort()
const actual = norm(git('status', '--short', '--untracked-files=all').out)
const said = norm(declared)
const missing = said.filter((l) => !actual.includes(l))
const extra = actual.filter((l) => !said.includes(l))
if (missing.length || extra.length) {
  stop(['the tree is not the list you declared.',
    ...missing.map((l) => `   declared, not in the tree: ${l}`),
    ...extra.map((l) => `   in the tree, not declared: ${l}`),
    '   Say the new `git status --short` in the conversation and call again with it.'].join('\n'))
}
console.log(`✅ tree equals the declared list (${actual.length} change(s)).`)

// 3. check command
if (CHECK) {
  console.log(`… running "${CHECK}" in ${DIR}`)
  const r = spawnSync(CHECK, { cwd: DIR, shell: true, stdio: 'inherit' })
  if (r.status !== 0) stop(`"${CHECK}" is red. Fix it; this script does not have a skip flag.`)
  console.log(`✅ "${CHECK}" green.`)
}

// 4. no history rewrite
git('fetch', REMOTE, BRANCH)
const remoteRef = `${REMOTE}/${BRANCH}`
if (git('rev-parse', '--verify', remoteRef).ok) {
  if (!git('merge-base', '--is-ancestor', remoteRef, 'HEAD').ok) {
    stop(`${remoteRef} is not an ancestor of HEAD. Someone pushed meanwhile: merge or rebase locally, never force.`)
  }
  console.log(`✅ ${remoteRef} is an ancestor of HEAD.`)
}

if (dryRun) { console.log('\n🧪 dry run: every guard passed; stopping before `git add`.'); process.exit(0) }

if (said.length) {
  if (!git('add', '-A').ok) stop('git add failed.')
  const c = git('commit', '-m', message)
  if (!c.ok) stop(`git commit failed: ${c.err}`)
}
const p = git('push', REMOTE, `HEAD:${BRANCH}`)
if (!p.ok) stop(`git push failed: ${p.err}`)
console.log(`\n🚀 published ${git('rev-parse', '--short', 'HEAD').out} to ${remoteRef}.`)
