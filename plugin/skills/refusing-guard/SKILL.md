---
name: refusing-guard
description: Turns a rule someone has to remember ("run the tests before deploying", "never push from a branch", "the docs checker must be green") into a script that refuses the commit, export or publish when the rule fails, and proves the guard by watching it go red before trusting it. Use when the same mistake happened twice, when writing deploy, publish or commit steps, or when the user says always, never or "remember to".
---

# Guard that refuses

**A rule that depends on remembering will be forgotten.** The fix is not a checklist or a stronger
reminder in the prompt. It is a script standing at the choke point (commit, export, publish) that
**refuses** when the rule fails, says why, and says what to do.

**Why.** In the project this method comes from, one day produced nine separate incidents, each
caused by a rule that only lived in someone's memory. Another time two deploys in a row left the
main branch red because generated types did not match the database schema; the CI asked that
question *after* the push. The guard now asks the same question one step *before* the push.

## Process

1. **Name the rule in one sentence**, with the incident that proves it matters.
2. **Find the choke point**: the one command every change must pass through. If there are two ways
   to publish, the guard must sit in front of both, or one must disappear. The best guard *is* the
   publish command: the session passes values, the script does the steps.
3. **Write the guard**, using `${CLAUDE_SKILL_DIR}/scripts/publish-guard.mjs` as a starting point:
   - Refuse **before** changing anything (before `git add`, before the build is uploaded).
   - Refuse loudly: what failed, and the exact next step. `⛔ NOT PUBLISHED - <why>`.
   - No dependencies. A checker that needs installing is a checker that stops running.
   - No `--force`, no `--skip`. The escape hatch, if any, is named and narrow
     (`--ci-already-red` to push the fix for a red CI), never "ignore everything".
   - Never rewrite history: if the remote is not an ancestor of HEAD, refuse instead of "resolving".
4. **Prove it red.** Break the rule on purpose (a copy of the repo with a failing test, a file not in
   the declared list) and run the guard with `--dry-run`. Paste the refusal. A guard that was never
   seen refusing is not a guard yet.
5. **Prove it green** on the real repository.
6. **Wire it in** as the only path: a git hook (`templates/pre-commit`, enabled with
   `git config core.hooksPath <folder>`), the `npm run publish` script, or the export script.
7. **Write the guard down** in the project's `CLAUDE.md` (name, command, what it refuses) so the
   next session uses it instead of retyping the steps.

## The declared-list guard

The most useful single guard in this method: **the working tree must equal the list of changes the
session announced**. The session says `git status --short` in the conversation, then passes that
list to the publisher. If the tree differs, something (another session, a formatter, a stray script)
changed files after the list was said, and the publish is refused. It costs nothing and catches the
change nobody reviewed.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/publish-guard.mjs \
  --declared "M src/cart.ts;?? test/reorder.test.ts" \
  --check "npm test" -m "feat: order again from a past order (RUN-031)"
```

## Red flags

- "I'll remember to run it." "It's in the checklist." "The CI will catch it."
- A guard with a bypass flag that is used more than once a month.
- A guard that passes when its input is missing (no config, empty list, test runner not found).
- A guard written but never seen failing.
- Two publish paths, one guarded.
