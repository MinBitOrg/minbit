# MinBit

> Building software, bit by bit — with a team of agents that starts by building itself.

MinBit is an open-source, self-bootstrapping **AI workspace**: a team of AI agents plans, builds,
reviews and ships software, starting with MinBit itself. A human maintainer steers direction and
approves what is released.

| Part | Path | What it is |
|---|---|---|
| **MinBit Workspace** | [`core/`](core/) | Rust core: the `minbit` CLI — world-model state, task selection, run lifecycle, run ledger |
| **Genesis** | [`genesis/`](genesis/) | How a fresh environment becomes a working workspace (prompts + checklist) |
| **State (world model)** | [`state/`](state/) | The workspace's model of itself: projects, roadmap, tasks, runs, decisions, budget |
| **Roles** | [`roles/`](roles/) | Operating prompts for the agent team (planner, builder, reviewer, …) |
| **MinBit Portal** | [`portal/`](portal/) | React app to configure self-hosted AI stacks and export Docker Compose — seed of the environment factory |
| **Decisions** | [`docs/adr/`](docs/adr/) | Architecture Decision Records |

## Principles

1. **Born from one command** — reproducible genesis; if it can't be rebuilt, it doesn't exist.
2. **World model by design** — agents plan against explicit state in [`state/`](state/), not chat history.
3. **Continuous autonomy, gated release** — agents merge internally; humans approve releases and flagged changes.
4. **Glass box** — every run leaves a PR, a ledger entry and a transcript link.
5. **Cost-aware by construction** — budgets and kill switches are part of the core.
6. **Open source first, portable always** — Claude is the first host, not the only one.
7. **Self-improvement with guardrails** — MinBit changes itself only through PR + review + tests.

## How it runs today (Phase A — Claude-native)

A scheduled Claude task (the *heartbeat*) starts a fresh Claude Code session, which reads
[`CLAUDE.md`](CLAUDE.md) and [`state/`](state/), runs `minbit next`, does the work on a branch,
opens a PR and appends to the run ledger. CI, AI reviewers and a reviewer agent gate the merge.
Changes carrying a `needs-human:*` label wait for the maintainer.

```bash
cd core && cargo run -- status        # where is the workspace?
cargo run -- next                     # what should an agent do now?
cargo run -- pause --reason "trip"    # lifecycle: start | pause | resume | stop
```

## Licence

[AGPL-3.0-or-later](LICENSE). Contributions require sign-off; see [CONTRIBUTING.md](CONTRIBUTING.md).
Provided "as is", without warranty — you are responsible for how you use it and for complying
with the terms of any AI provider you connect.
