# 0002 — Core language: Rust

**Status:** accepted (2026-11-15)

## Context

MinBit's core (state, task selection, lifecycle, ledger, later the orchestrator and environment
factory) is written and maintained mostly by AI agents and reviewed by one maintainer who is new to
Rust. The core is not performance-bound: it coordinates external agent runtimes, it doesn't run LLM
loops itself.

## Decision

Write the core in **Rust**. Individual projects built by the workspace choose their own stack
(the Portal stays TypeScript).

## Consequences

- ✅ The compiler and `clippy` give agents fast, objective feedback; many mistakes never reach review.
- ✅ Single static binary: genesis on any host is "download and run".
- ✅ Types (`serde` + `deny_unknown_fields`) double as the state schema enforcement.
- ⚠️ Slower builds and more tokens per change than Python; mitigated by keeping the core small.
- ⚠️ Thinner LLM/agent ecosystem; acceptable because we orchestrate CLIs rather than embed SDKs.
- ⚠️ Maintainer review relies on tests and reviewer agents more than on reading every line.
