---
name: cloud-session-hook
description: Sets up a SessionStart hook so that a Claude Code session running in the cloud (claude.ai/code, the mobile app) starts ready to work - installs the pinned tools the container lacks, wires the repository's git hooks, fetches shared rules from a sibling repository - and does nothing on the local machine. Use when a project will be worked on from the web or a phone, or after a cloud session failed on a missing tool, an unhooked commit or a missing shared file.
---

# Cloud session hook

A cloud session starts in a fresh container. Whatever your laptop has that the repository does not
declare (a test browser at the right version, git hooks switched on, the shared rules in a sibling
folder) is missing, and the first half hour goes to rediscovering it. A **SessionStart hook** fixes
that once, inside the repository.

**Why.** The first project worked from a phone ran its bots, build and browser tests at phone width in
the cloud, with no laptop involved. What failed was only the environment: the browser-automation
library installed at a version that wanted a download the container forbids, the shared rules folder
that only existed next to the repository on the laptop, and a commit hook that git ignored because it
was not marked executable. One hook script fixed all three.

## Process

1. **List what the last cloud session tripped on.** Missing tool, wrong version, hook not running,
   file outside the repository.
2. **Copy the templates** into the repository:
   - `${CLAUDE_SKILL_DIR}/templates/session-start.sh` → `.claude/hooks/session-start.sh`
   - merge `${CLAUDE_SKILL_DIR}/templates/settings.json` into `.claude/settings.json`
3. **Keep it a no-op locally.** The script exits at once unless `CLAUDE_CODE_REMOTE` is `true`.
4. **Pin versions** to what the container's preinstalled browser or runtime matches. "Latest" is how
   a hook breaks on a Tuesday.
5. **Print one line per action, and failures with their reason.** The hook's output enters the
   session's context, so the agent sees what failed instead of guessing.
6. **Mark it executable in git**: `git update-index --chmod=+x .claude/hooks/session-start.sh`.
   On Windows the file system will not do it for you.
7. **Anything from another repository gets copied in**, or the session must be started with that
   repository selected too: a cloud session only reaches the repositories chosen when it starts.
8. **Never exit non-zero for a soft failure.** Report it and let the session start.

## Red flags

- A hook that also runs on the laptop and slows every local start.
- `pip install <tool>` without a version.
- A hook that fails silently.
- Depending on `../other-repo` existing in the cloud.
