# 0003 — Hosting: Phase A, Claude-native

**Status:** accepted (2026-11-15)

## Context

Options considered: A (SaaS-first, zero infrastructure), B (single VPS, self-hosted core),
C (small control plane + elastic/local workers). Budget preference: free tiers and existing
subscriptions first. Local hardware is deferred until usage data exists.

## Decision

Start with **A, Claude-native**: Claude Code cloud sessions do the work, Claude scheduled tasks
provide the heartbeat, GitHub hosts repos/CI/review. Everything the workspace needs to rebuild
itself lives in this repo, so it can move to other hosts.

- B is not a permanent tier: it becomes an **environment the workspace generates on demand** with
  IaC when a project needs something the Claude sandbox can't provide (ADR-0017).
- C is the long-term target.

## Consequences

- ✅ Near-zero infrastructure cost and ops effort; fast start.
- ✅ The heartbeat model forces all state into files — good for the world model and portability.
- ⚠️ Not truly always-on; throughput bounded by subscription limits (ADR-0016).
- ⚠️ Some vendor coupling to Claude; mitigated by keeping prompts, roles and state host-neutral.
