# metodo-agentic

**A working method for shipping production software with Claude Code, as seven installable skills.**

Most of what makes an AI agent useful in a real codebase is not the code it writes. It is what you put
around it so you can trust what ships: plans with checkable DONE, scripts that refuse to publish when a
rule breaks, test batteries that record what is right and what is wrong, docs that cannot quietly go
stale, and a pace you measure in git instead of describing with adjectives.

[Português](README.pt-BR.md)

## Install

```text
/plugin marketplace add joaoferrari12/metodo-agentic
/plugin install metodo-agentic@joaoferrari12
```

The skills load on demand: Claude picks one when your request matches its description, or you call it
by name (`/metodo-agentic:refusing-guard`).

## The skills

| Skill | What it does | Ships with |
|---|---|---|
| [`plan-run`](plugin/skills/plan-run/SKILL.md) | Opens a *run*: one large scope built straight through, with a short record written first (DONE per item, commodity vs real decision, what only the human may do) | record template, worked example |
| [`refusing-guard`](plugin/skills/refusing-guard/SKILL.md) | Turns "remember to…" into a script that refuses the commit or publish, proven red before it counts | `publish-guard.mjs`, pre-commit template |
| [`right-and-wrong-battery`](plugin/skills/right-and-wrong-battery/SKILL.md) | End-to-end scenarios per kind of user, deterministic, with a report of everything right **and** wrong | `battery.mjs`, 4 example scenarios |
| [`point-dont-repeat`](plugin/skills/point-dont-repeat/SKILL.md) | Every fact that changes lives in one file; a checker refuses restated facts, dead links, bloated status files | `check-docs.mjs`, config template |
| [`run-verdict`](plugin/skills/run-verdict/SKILL.md) | Closes with a verdict in three buckets: closes, defect (fix now), new scope (next run) | verdict template |
| [`cloud-session-hook`](plugin/skills/cloud-session-hook/SKILL.md) | Makes Claude Code sessions on the web and phone start ready, and stay a no-op locally | `session-start.sh`, settings snippet |
| [`measure-pace`](plugin/skills/measure-pace/SKILL.md) | Run duration from git (record committed → last commit citing it), minutes per item, runs per day | `pace.mjs` |

Every script is plain Node with no dependencies, on purpose: a checker that needs installing is a
checker that stops running.

## Where this came from

I built it while shipping [Ferra](https://app.ferraia.com), a multi-tenant SaaS for small service
businesses, solo, with Claude Code doing most of the typing, from July 2026. The numbers, measured in that product's repositories on
2026-10-03:

| | | How it was measured |
|---|---:|---|
| Decision records | 208 | `ls docs/adr \| grep -c ADR-` |
| Database migrations | 133 | count of migration files |
| Test files | 305 | test files in the web app |
| Commits in September 2026 | 1,231 | `git log --since=2026-09-01 --until=2026-10-01`, three repositories |
| Minutes per item, one agent alone | 4 to 12 | `measure-pace` |
| Minutes per item, with a second agent in a terminal | 14 to 17 | `measure-pace` |

Every skill opens with the incident that made it necessary. The examples are rewritten with invented
businesses; no code, schema or data from the product is in this repository, and a guard
(`tools/check-leaks.mjs`) refuses any commit that would put it here.

## Measure it

`plugin/evals/` has one routing case per skill: a realistic request that does not name the skill, a
check that the skill fired, and a short rubric for the answer. With Claude Code 2.1.269 or later:

```bash
claude plugin eval plugin
```

It runs each case with and without the plugin and reports the difference. It uses your plan or API
credits.

Last run (2026-10-03, Claude Code 2.1.285, 3 runs per case, `--judge-model sonnet`, about US$ 4 at list
price): **21 of 21 runs pass with the plugin, 11 of 21 without it**, and the right skill fired in 21 of 21.
The two runs before it taught something: in an empty workspace the skills made Claude stop and ask for
the project instead of answering, so the prompts now carry their own context.

## Principles under the skills

- A run, not small batches. The record is written once, at the start and at the end.
- What every product does the same way is copied, not discussed. Only two or three things per
  project are real decisions.
- A rule that must not be forgotten becomes a script that refuses.
- Measure, don't opine. What only a human can judge is written as "to be checked by a human", never
  as done.
- A document points; it never repeats.
- Nothing important lives only in the conversation. If it is not committed, it did not happen.

## License

[Apache License 2.0](LICENSE). If you redistribute this work or build on it, keep the [NOTICE](NOTICE)
file, which carries the author's name.
