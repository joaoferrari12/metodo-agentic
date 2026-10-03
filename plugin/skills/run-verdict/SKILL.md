---
name: run-verdict
description: Closes a run with a verdict in three buckets - what closes, what is a defect to fix now, what is new scope for the next run - backed by measured numbers, a walk through the product as each kind of user, and the one lesson that moves up to the shared method. Use when finishing a feature, milestone or session, or when the user asks "are we done?", "what's left?" or "how did it go?".
---

# Verdict in three buckets

A run does not end with a list of what was done. It ends with a **verdict**: every loose end goes into
exactly one of three buckets, and "done" is established by looking at the product working, not only
at the checkers.

| Bucket | Means | What happens |
|---|---|---|
| **Closes** | Meets the DONE written in the run record, seen working | Stays closed |
| **Defect** | Was in scope and is wrong or missing | Fixed now, in this run, before the verdict is final |
| **New scope** | Was not in scope, or only became visible now | Goes to the next run's record, with a line saying why |

## Process

1. **Re-read the run record.** Each item's DONE is the bar, nothing softer.
2. **Look at the product, not the checkers.** Open it at the size real users use (a 360 px phone
   screen, if that is the audience) and walk the flow. A green suite with a broken screen is a defect.
3. **Walk it as each kind of person.** Owner, clerk, customer; or first-time player, the one who plays
   every day, the one who would pay. Write what confuses each of them **with its structural cause**,
   not just the symptom ("the button is hidden" → "the screen has two primary actions").
4. **Measure.** Tests, battery right/wrong counts, timings, the run's duration (`measure-pace`). Every
   number with the command that produced it.
5. **Split the human-only checks.** Sound, feel, frame rate on a real device, how a text reads: listed as
   **"to be checked by <name>"**, never as closed.
6. **Fill the three buckets.** Fix the defects now; then re-check.
7. **Name what moves up.** One line: the lesson from this run that applies to every project, and the
   file in the shared method where it now lives. "Nothing" is a valid answer; skipping the line is not.
8. **Present, do not close.** Closing the run is the human's gesture. Say what is waiting on them in
   one line, and whether the next step belongs **in this session or a new one**, with half a sentence
   of why.

Template: `${CLAUDE_SKILL_DIR}/templates/verdict.md`.

## Red flags

- "Done: implemented X, Y, Z." (a list, not a verdict)
- "All green" with nobody having opened the product.
- New scope silently done inside the run, or defects silently pushed to "next time".
- A "feel" item marked as closed by the agent.
- No line about what moves up.
