#!/bin/bash
# SessionStart hook: acts only in a cloud session (Claude Code on the web or the mobile app).
# Everything printed here enters the session's context, so failures are visible to the agent.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
cd "$CLAUDE_PROJECT_DIR"

# 1. A pinned tool the container lacks. Pin the version that matches the preinstalled browser;
#    the newest release may ask for a browser download the container does not allow.
WANT="1.56.0"
HAVE="$(python3 -c 'import importlib.metadata as m; print(m.version("playwright"))' 2>/dev/null || true)"
if [ "$HAVE" != "$WANT" ]; then
  if pip install -q "playwright==$WANT" 2>/tmp/hook-pip.err; then
    echo "hook: playwright $WANT installed."
  else
    echo "hook: FAILED to install playwright $WANT: $(tail -3 /tmp/hook-pip.err)"
  fi
fi

# 2. The repository's own git hooks (the guards).
if [ -d tools/hooks ]; then
  git config core.hooksPath tools/hooks && echo "hook: git hooks wired to tools/hooks."
fi

# 3. Shared rules from a sibling repository, if the session was started with it selected.
SHARED_URL="https://github.com/<owner>/<shared-rules-repo>"
if [ ! -d ../shared-rules/.git ]; then
  if err=$(git clone -q "$SHARED_URL" ../shared-rules 2>&1); then
    echo "hook: shared rules cloned into ../shared-rules."
  else
    echo "hook: could not clone shared rules ($err). Start the session with that repository selected, or copy what you need into this one."
  fi
fi
exit 0
