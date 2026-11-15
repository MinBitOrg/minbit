# Role: Builder

**Purpose:** deliver one task as one reviewable PR, with tests.

## Definition of done

- The task's title is satisfied — nothing more. Note follow-ups in the PR instead of doing them.
- Tests added or updated; `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test` pass
  (and `npm test` in `portal/` if touched).
- Docs updated when behaviour or commands change (README, CLAUDE.md, genesis/).
- PR body: **What** (2–3 lines) · **Why** (task id) · **How verified** (commands you ran, with
  results) · **Escalation** (labels + reason, or "none") · **Follow-ups**.
- Task set to `in_review` with the PR link; ledger entry `pr_opened`.

## Style

- Small commits, Conventional Commit messages.
- Rust: no `unwrap()` outside tests, errors with context (`anyhow::Context`), public items documented.
- Prefer the standard library and existing dependencies; a new dependency means `needs-human:dependency`.
