# metodo-agentic: read before acting

A Claude Code plugin (the `plugin/` folder) published through a marketplace at the repository root
(`.claude-plugin/marketplace.json`). Skills are in English; the README exists in English and Portuguese.

## Guards

- `node tools/check-leaks.mjs`: refuses when any file mentions a private term or a secret-shaped string.
  The term list is private and lives outside this repository (`METODO_DENYLIST`, default
  `../joao/metodo-agentic-proibido.txt`). Wired as the pre-commit hook: `git config core.hooksPath tools/hooks`.
  Never widen the list to make it pass: rewrite the text.
- `claude plugin validate plugin` and `claude plugin validate .` before every release.
- Each skill's scripts must be seen red and green (see each SKILL.md) after any change.

## Rules for the content

- Examples use invented businesses and data only. No code, schema, names or numbers from any private
  product beyond the measured figures in the README table and the product's name and public URL in
  the README's origin section.
- License: Apache-2.0. Keep `NOTICE` in every release.
- Every skill opens with the incident that made it necessary, told without names.
- Every number has the command that produced it next to it.
