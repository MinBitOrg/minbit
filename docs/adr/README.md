# Architecture Decision Records

Format: `NNNN-short-title.md`, sections **Status · Context · Decision · Consequences**.
Status is one of `proposed`, `accepted`, `superseded by NNNN`, `rejected`.
Agents may only create `proposed` ADRs; the maintainer accepts them.

| # | Title | Status |
|---|---|---|
| 0001 | Name and repo layout: MinBit monorepo | accepted |
| 0002 | Core language: Rust | accepted |
| 0003 | Hosting: Phase A, Claude-native | accepted |
| 0004 | Agent runtimes | accepted (Phase A) |
| 0005 | Orchestration and durable state beyond Phase A | open (MB-011) |
| 0006 | Repo topology and promotion | accepted (Phase A) |
| 0007 | Isolation model | open |
| 0008 | LLM access and cost control | accepted (Phase A) |
| 0009 | Observability | accepted (Phase A) |
| 0010 | Human-in-the-loop policy | accepted |
| 0011 | Secrets and identity | open |
| 0012 | World model representation | open (MB-012) |
| 0013 | Licensing policy for rewrites and reverse engineering | open |
| 0014 | Project licence: AGPL-3.0-or-later | accepted |
| 0015 | Portal backend and AI gateway | open |
| 0016 | Subscription usage policy | accepted |
| 0017 | Environment factory (IaC) | open |

Decisions marked accepted without a file yet are summarised in the kickoff doc and will be written
up by agents as `docs/adr/` files (planner tasks).
