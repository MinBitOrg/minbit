# 0012 — World model representation (v0)

**Status:** proposed (2026-11-16, MB-012)

## Context

The README promises a world model in `state/` covering *projects, roadmap, tasks, runs, decisions,
budget*. Today only three of those exist as data:

| Entity | Today | Gap |
|---|---|---|
| Workspace (lifecycle, budget, guardrails) | `state/workspace.yaml` | — |
| Task | `state/tasks.yaml` | no `project`; ADR links are prose ("read the ADRs referenced by the task") |
| Run event | `state/ledger/YYYY-MM.jsonl` | a run is only implied by `session` |
| Project | — | only one project, implicit |
| Roadmap / milestone | — | `milestone: mvp-genesis` is a free string; phases 2–4 are not written down |
| Decision | `docs/adr/*.md` + index table | status lives in two places (file + README table) |

Every heartbeat starts with no memory, so whatever is not in these files does not exist for agents.
Constraints: plain files in git (ADR-0003), readable on a phone, editable by hand, validated in CI,
loadable by the Rust core without new dependencies.

## Decision (proposed)

**Files in git stay the single source of truth.** Three storage kinds, chosen by how the data changes:

| Kind | Format | Used for |
|---|---|---|
| Mutable records | YAML, one file per collection | workspace, projects, roadmap, tasks |
| Append-only events | JSONL, one file per month | ledger (runs) |
| Prose decisions | Markdown with a status line | ADRs |

### Entities and identifiers

```
Workspace 1─* Project 1─* Milestone 1─* Task *─* Decision (ADR)
                                          │  └─* Task (depends_on, acyclic)
                                          └─* LedgerEntry *─1 Run
```

| Entity | ID | Lives in | Key fields |
|---|---|---|---|
| Project | slug, e.g. `minbit` | `state/projects.yaml` (new) | name, repo, status, licence |
| Milestone | slug, e.g. `mvp-genesis` | `state/roadmap.yaml` (new) | project, title, phase, status, target, definition_of_done |
| Task | `MB-NNN` | `state/tasks.yaml` | + optional `project`, `adrs` |
| Decision | `ADR-NNNN` | `docs/adr/NNNN-*.md` | status parsed from the `**Status:**` line |
| Run | session id | derived from ledger | no file in v0 |
| LedgerEntry | (ts, session) | `state/ledger/*.jsonl` | unchanged in v0 (MB-007 extends it) |

### Rules

1. **Additive only.** New fields are optional; existing files stay valid. A task with neither
   `project` nor `milestone` belongs to `workspace.yaml`'s proposed `default_project` (required
   once a second project exists; until then, the only project).
2. **No duplicated facts.** ADR status is read from the ADR file; the README table becomes generated
   (or is checked against the files). A Run is the group of ledger entries sharing a `session`.
3. **Referential integrity is a CI check** (extends MB-002 `minbit validate`):
   task.milestone ∈ roadmap · milestone.project ∈ projects · task.adrs files exist ·
   depends_on acyclic and resolvable · ledger.task ∈ tasks · every set `task.project` ∈ projects ·
   `workspace.default_project`, when set, ∈ projects ·
   if both `task.project` and `task.milestone` are set, `task.project` = `milestone.project`.
   Ownership: a task belongs to its milestone's project; `task.project` is only needed for
   tasks without a milestone.
4. **IDs never change and are never reused.** Done/cancelled items stay in the file.

Draft schemas for the two new files and the task delta are in
[`docs/world-model/`](../world-model/) — proposals, not yet in `state/schema/`.

## Alternatives considered

- **SQLite / DuckDB file in the repo** — queryable, but binary diffs, no phone review, merge
  conflicts are unresolvable. Revisit as a *derived* read model (ADR-0005), never the source.
- **GitHub Issues/Projects as the model** — good UI, but not in the repo, vendor-coupled, and
  agents would need API calls to read state. Issues stay a mirror (`scripts/seed-issues.py`).
- **One file per entity** (`state/tasks/MB-001.yaml`) — fewer merge conflicts between parallel
  agents, but noisier for humans. Revisit when more than one agent runs at a time.

## Consequences

- ✅ Planner gets a real roadmap to refine (heartbeat step 3 currently has nothing to read).
- ✅ Task → ADR links become checkable instead of prose.
- ⚠️ Two new state files and two new schemas → `needs-human:schema` on the implementing PR.
- ⚠️ Single-collection YAML files will conflict when agents run in parallel; acceptable in Phase A
  (one heartbeat at a time).
