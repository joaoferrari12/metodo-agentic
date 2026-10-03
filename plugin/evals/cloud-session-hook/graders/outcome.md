---
type: llm
---

PASS if the reply sets up a SessionStart hook that only acts in the cloud session (for example checking CLAUDE_CODE_REMOTE), pins the playwright version, and wires git hooks (core.hooksPath or executable bit). FAIL if it suggests manual setup each session.
