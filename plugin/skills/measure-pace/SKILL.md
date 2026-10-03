---
name: measure-pace
description: Answers "is this going fast enough?" or "is this the right way to work?" with numbers from git instead of adjectives - how long each run took, from the commit that created its record to the last commit that cites it, minutes per item, runs per day - across one or several repositories. Use when the user questions pace or strategy, compares ways of working (one agent vs two, small batches vs runs), or before anyone claims something is faster.
---

# Measure pace in git

When someone asks whether the strategy is working, the answer is a table from `git log`, not
"it's going well". And measure **before** defending: once, the number contradicted the defense
that was about to be made.

**Why, and the trap.** The obvious measure is the span between a run's first and last commit. In the
project this method comes from, that measure **silently stopped working**: once the agent started
building without a second terminal agent, it grouped a whole run into one or two commits at the end
(publishing runs the full test suite, so nobody publishes item by item). Spans went from 239 and 67
minutes to 1 and 0 minutes. The runs had not become instant; the measure had broken.

The fix was not a new ritual ("stamp each item"), because rituals depend on remembering. It was a
milestone that already exists without anyone doing anything: **the moment the run's record entered
git** (`plan-run` commits it before the code). So:

    run duration = (record first committed) → (last commit, in any repository, that cites the run id)

With that measure the same project read **4 to 12 minutes per item** for one agent alone, against
**14 to 17** with a second agent in a terminal: the second agent was not speeding anything up.

## Process

1. Make sure runs have ids in their record filenames (`RUN-031-...md`) and that commits cite the id
   (`feat: order again (RUN-031)`). A commit-message guard (`refusing-guard`) can require it.
2. Run:

   ```bash
   node ${CLAUDE_SKILL_DIR}/scripts/pace.mjs --records docs/runs [--repos ../app,../api] [--since 2026-09-01]
   ```

3. Read the table: duration, items (rows of the record's items table), minutes per item, and the
   median. Runs per day come from the record dates.
4. Answer the question with the table, and say what the number does **not** measure.

## What it does not measure

Time the human spent asleep, answering something else, or deciding. A run opened at 22:00 and closed
at 02:00 the next day may contain an hour of real work. Say so next to the number; a number that hides
its blind spot becomes a lie the first time someone leans on it.

## Red flags

- "It's faster now" with no table.
- Comparing two ways of working on different kinds of tasks.
- Commit span as the measure when commits are batched.
- A pace number reported without its blind spot.
