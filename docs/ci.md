# CI and required checks

`main` only accepts changes through a PR that passes the checks below. They are enforced by the
ruleset in [`.github/rulesets/main.json`](../.github/rulesets/main.json) (the repo file is the source
of truth; an admin applies it, see [genesis step 3](../genesis/README.md#steps)).

## Required checks

| Check | Source | What it runs | Reproduce locally |
|---|---|---|---|
| `rust` | [`ci.yml`](../.github/workflows/ci.yml) (GitHub Actions) | `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test` | same commands in `core/` |
| `state` | `ci.yml` | `check-jsonschema` of `state/workspace.yaml` and `state/tasks.yaml` against `state/schema/`; every `state/ledger/*.jsonl` line parses as JSON | `pip install check-jsonschema`, then the commands in the `state` job |
| `portal` | `ci.yml` | `npm ci`, `npm run lint`, `npx vitest run`, `npm run build` | `npm ci && npm run lint && npm test && npm run build` in `portal/` |
| `CodeRabbit` | CodeRabbit app | AI review must complete | — |
| `automerge-gate` | [`automerge.yml`](../.github/workflows/automerge.yml) | Passes once the label decision for the current head is made; blocks merging while it is pending | — |

Each check is pinned to its app (`integration_id`: GitHub Actions `15368`, CodeRabbit `347564`), so a
status with the same name posted by anything else does not satisfy it.

## Other rules on `main`

- No deletion, no force-push (non-fast-forward).
- PR required; review threads must be resolved; stale approvals are dismissed on push.

## Auto-merge

`automerge.yml` enables squash auto-merge only for same-repo, non-draft `agent/*` PRs **without** a
`needs-human:*` label, and only if `main` requires `automerge-gate`. GitHub then merges once every
check above is green. Labeled PRs wait for the maintainer (see [CLAUDE.md §3](../CLAUDE.md)).

## Changing CI

Adding, renaming or removing a CI job means updating this table **and** the ruleset; a required
check that never reports blocks every PR. Changes to the merge gate itself are `needs-human:security`.
