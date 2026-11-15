# 0016 — Subscription usage policy

**Status:** accepted (2026-11-15)

## Context

Phase A runs on personal subscriptions: Claude Pro (Max later) and ChatGPT Go.

- *Validated (Nov 2026):* Claude subscription limits apply only in Anthropic's own clients
  (Claude.ai, Claude Code); since 4 April 2026 third-party harnesses such as OpenClaw cannot use them.
- *Validated:* ChatGPT Go includes limited Codex usage; Codex Cloud is not available on Go.

## Decision

1. Use subscriptions **only through official clients** (Claude Code, Claude scheduled tasks; Codex CLI).
2. **Never** spoof clients, share tokens with unofficial tools, or work around rate limits.
3. On a usage limit, the run records `rate_limited` and stops; the heartbeat tries again later.
4. Upgrade trigger: Claude Max when limits stop > 5 heartbeats in a week.
5. Before MinBit serves anyone other than the maintainer, move to API keys behind a gateway
   (ADR-0008) — subscriptions are for building, not for serving users.

## Consequences

- Throughput is capped by the plan; the planner prefers small, high-value tasks.
- Using Codex from Claude sessions is an open experiment (task MB-006), gated by `needs-human:security`.
