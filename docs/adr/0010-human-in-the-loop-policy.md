# 0010 — Human-in-the-loop policy

**Status:** accepted (2026-11-15)

## Decision

Agents work continuously and merge to `main` without a human when CI and agent review pass.
A human decision is required for:

| Label | Trigger |
|---|---|
| `needs-human:dependency` | new or upgraded third-party dependency |
| `needs-human:licence` | licence changes, external code, code under another licence |
| `needs-human:security` | auth, secrets, sandboxing, network exposure, security findings |
| `needs-human:schema` | persisted data formats, `state/schema/` |
| `needs-human:spend` | anything that raises cost |
| `needs-human:release` | tags, releases, public announcements, outbound actions |

Labeled PRs are never auto-merged. The maintainer is notified through the daily digest and push
notifications, and decides from a phone where possible (approve, comment, or close).

## Consequences

- Release cadence is decoupled from development cadence: agents keep progressing; releases wait.
- Over-escalation is preferred to silent risky merges; the reviewer agent adds missing labels.
- The policy is revisited when external maintainers join (Phase 4).
