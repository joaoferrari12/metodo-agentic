---
name: point-dont-repeat
description: Keeps project docs and AI instructions from rotting - every fact that changes (current phase, rule in force, counts, status) lives in exactly one file and every other file points to it, enforced by a dependency-free checker that also catches dead links and state files that only grow. Use when docs contradict each other, when a session acted on a stale rule, when setting up CLAUDE.md, README and status files, or before writing a number into a doc.
---

# Docs point, never repeat

**A fact that a document repeats rots when the fact changes. A pointer to where the fact lives
does not.**

**Why.** In the project this method comes from, a rule was superseded one morning. By the afternoon
the dead rule was still being handed to every new AI session from **five places at once**: the
project instructions, two paragraphs of `CLAUDE.md`, the README, and a struck-through line in the
first file every session reads. No review caught it; the owner did, by asking "is this still true?"
in the middle of something else. The previous enforcement was "remember to update both places", and
it had lasted twelve hours. Weeks later the same project's status file, which only ever grew, reached
156 KB and could only be read with grep.

## The rules

1. **One home per fact that changes.** Phase, rule in force, counts, status, the next milestone:
   each lives in one file. Everyone else writes "see `docs/STATUS.md`".
2. **A number is written next to the command that returns it.** `208 decision records
   (ls docs/adr | grep -c ADR-)`. A number nobody can re-run is an opinion.
3. **Config that lives outside git carries a version on its first line** (project instructions
   pasted into a web UI, a repository description). Otherwise the stale copy hides.
4. **The state file is short and rewritten, not appended.** History lives in git and in the run
   records. Give it a line budget and let the checker hold it.
5. **Evidence a record cites lives in git,** not in a scratch folder without history.
6. **`CLAUDE.md` is a map, not a source.** It says which file is which and where each project
   starts. A fact that changes does not belong in it.

## Process

1. Find the repeated facts: `grep -rn` the phase name, the current milestone, the version, every
   number. Every hit outside its home becomes a pointer.
2. Copy `${CLAUDE_SKILL_DIR}/templates/docs-facts.json` to the repository root and declare each fact
   with its home and a pattern that only a restatement would match.
3. Run `node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs` (or copy the script into `scripts/` so the
   project owns it). Watch it go red on a planted repeat, then fix and watch it go green.
4. Put it in front of commits with `refusing-guard`.

## What the checker refuses

| Rule | Example of a refusal |
|---|---|
| Dead relative link | `README.md:12 link to docs/old-plan.md does not exist` |
| Fact restated outside its home | `CLAUDE.md:30 restates fact "phase" (home: docs/STATUS.md)` |
| State file over budget | `docs/STATUS.md has 214 lines (budget 120): rewrite it, history is in git` |
| Unversioned outside-git config | `docs/project-instructions.txt first line has no version` |

Without `docs-facts.json` it checks links only, and says so.

## Red flags

- "I'll update it in both places."
- A status file with dated sections stacked on top of each other.
- A number in prose with no command beside it.
- Instructions pasted into a web UI with no version line.
