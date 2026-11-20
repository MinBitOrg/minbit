# CLAUDE.md — Operating manual for MinBit agents

You are an agent working inside **MinBit**, a self-building AI workspace. Read this file fully at the
start of every session. It overrides your defaults; the maintainer's explicit instructions override it.

## 1. Orientation (every session, in this order)

1. `cd core && cargo run -q -- status` — lifecycle mode and budget. If mode is `paused` or `stopped`,
   **do nothing except** append a ledger entry with outcome `skipped` and end the session.
2. Read `state/workspace.yaml`, then the task you are given or `cargo run -q -- next`.
3. Read your role file in `roles/` (the task's `role` field). Stay inside that role.
4. Read the ADRs referenced by the task, if any.

## 2. The loop

1. **Claim**: `cargo run -q -- claim <task-id> --session <session-url-or-id>` (sets `in_progress`).
2. **Branch**: `agent/<task-id>-<short-slug>`. Never commit to `main`.
3. **Work** in small, reviewable commits (Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
4. **Verify** locally: `cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test` in `core/`;
   `npm ci && npm test && npm run build` in `portal/` when you touched it. Required checks: [docs/ci.md](docs/ci.md).
5. **PR** using the template; link the task id; fill the escalation checklist honestly.
6. **Record**: `cargo run -q -- ledger --task <id> --outcome <pr_opened|done|failed|blocked> --summary "<one line>"
   --model <model id> --usage-estimate <low|medium|high>` (low = orientation/skip, medium = normal task,
   high = long run), and commit the ledger update on the same branch. Weekly view: `cargo run -q -- usage`.
7. **Stop** when the task is done or you are blocked. Never start a second task in the same session
   unless the heartbeat prompt says so.

## 3. Escalation — when a human must decide

Add the label (and say why in the PR body) when the change:

| Label | Trigger |
|---|---|
| `needs-human:dependency` | adds or upgrades a third-party dependency |
| `needs-human:licence` | touches `LICENSE`, adds code under another licence, or copies external code |
| `needs-human:security` | auth, secrets, sandboxing, network exposure, or any security finding |
| `needs-human:schema` | changes `state/schema/` or any persisted data format |
| `needs-human:spend` | would raise cost (new paid service, bigger model, more frequent heartbeat) |
| `needs-human:release` | prepares a tag, release or public announcement |

Labeled PRs are **never** auto-merged. Unlabeled PRs auto-merge when CI and review pass.
When in doubt, label. Over-escalating is cheap; a wrong silent merge is not.

## 4. Hard rules

- No secrets in the repo, logs, PR bodies or ledger. Use the environment's secret store.
- No outbound actions on third parties (issues/PRs on other repos, posts, emails) without `needs-human:release`.
- Respect provider terms: use only official clients with subscriptions; never spoof clients or evade limits.
  If you hit a usage limit, write a ledger entry with outcome `rate_limited` and stop.
- Respect licences: no copying code from incompatible licences; rewrites of existing projects follow ADR-0013.
- Nothing related to the maintainer's employer, ever.
- Don't delete history: no force-push to shared branches, no rewriting others' commits.

## 5. Writing style

- PRs and ledger entries are read on a phone: lead with the outcome, keep it short, link details.
- Separate **validated** facts (you ran it, you saw it) from **hypotheses** (you think so). Label them.

## 6. Where things live

- World model: `state/` (`workspace.yaml`, `tasks.yaml`, `ledger/*.jsonl`), schemas in `state/schema/`.
- Decisions: `docs/adr/`. Propose new ADRs as `docs/adr/NNNN-title.md` with status `proposed`.
- Roles: `roles/`. Genesis and heartbeat prompts: `genesis/`.
