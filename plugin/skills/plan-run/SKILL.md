---
name: plan-run
description: Opens a "run" - one large scope built straight through until it works - with a short record written before any code - scope, what DONE means for each item, order, what is commodity to copy, the two or three real decisions, and what only the human may do. Use when starting a feature, a milestone or a batch of work, or when the user says "let's build X" and X has more than a couple of items.
---

# Plan a run

A **run** is one big scope, built straight through until it works, with the record written once:
a short plan before the code and a verdict after it (`run-verdict`). It replaces "small batch,
document per item, ask about every doubt", which looks careful and moves slowly.

**Why.** In the project this method comes from, ten consecutive small batches each produced a tidy
decision record and very little change in the product. The owner's words: *"in 10 batches, the
change in the product has been small."* Switching to runs, with one record per run, took the pace to
**4 to 12 minutes per item** (measured from git, see `measure-pace`) and 8 to 14 runs on a good day.

## Process

1. **Read what is in force.** Find the project's current rule or phase (one file says it; see
   `point-dont-repeat`). Do not propose anything outside it.
2. **Research before building.** In this repository, its dependencies, open-source repositories,
   articles, and products that already solve it. Building from zero is the last resort. Write down
   what you will copy and from where.
3. **Separate commodity from decision.** What every product of this kind does the same way
   (login with "Sign out", search, pagination, settings menu, undo) is **commodity**: copy the
   common pattern and move on. Missing commodity is a defect, not a backlog item. Only two or three
   things per project are **real decisions**; the run says which ones it touches.
4. **Write the run record** from `${CLAUDE_SKILL_DIR}/templates/run-record.md` into the project's
   records folder (for example `docs/runs/RUN-NNN-short-slug.md`). Every item gets a **DONE** that
   someone can check without asking you: a command, a URL, a screen at a given width, a number.
5. **Commit the record before the code.** Its first commit is the run's start time. That is what
   makes the pace measurable later without anyone stamping anything.
6. **Build straight through.** No document per item, no question you can answer yourself. Ask the
   human only for what is theirs (step 7). Before anything that takes minutes (a suite, a build, a
   subagent), say what will run and how long it should take: a long silence looks like a crash.
7. **List the human's gestures** in one line and keep going around them: publishing or giving a
   third party access, spending money, pricing, naming and brand, real personal data in a new
   place, rewriting git history, and closing the run.
8. **Close with `run-verdict`.**

## What a good DONE looks like

| Weak | Checkable |
|---|---|
| "Reorder works" | "On a 360 px screen, *Order again* on a past order opens the cart with the same 3 items; `npm test -- reorder` green" |
| "Faster page" | "List of 500 orders renders in under 300 ms (`node bench/list.mjs`, median of 5)" |
| "Better docs" | "`node scripts/check-docs.mjs` green and the state file under 120 lines" |

## Red flags

- A decision record per item, or a ticket per doubt.
- DONE that says "works", "better", "clean".
- Returning a choice to the human that you could make and justify.
- A number in the plan that nobody measured. If you chose it, write the measurement next to it.
- Rebuilding a commodity from scratch "to make it ours".

## Example

`${CLAUDE_SKILL_DIR}/examples/RUN-031-reorder.md`: a fictional bakery ordering app, one run with
four items, its commodity list and the one real decision it touched.
