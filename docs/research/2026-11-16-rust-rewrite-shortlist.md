# Shortlist: 10 open-source projects worth (or not worth) a Rust rewrite

**Task:** MB-010 · **Role:** researcher · **Date:** 2026-11-16 · **Status:** report only, no code copied

## Answer

Of 10 candidates picked for fit with MinBit's roadmap (workspace tooling, environment factory,
DuckDB/data product), **3 look worth a rewrite**, 3 are **maybe**, and 4 are **no — a maintained
Rust port already exists** (better to use or contribute to it).

| # | Project | Verdict | One-line reason |
|---|---|---|---|
| 1 | Apprise | **go** | MinBit needs notification fan-out; Rust ports are days old with ~0 users |
| 2 | Cookiecutter | **go** | Environment factory needs templating; single binary beats a Python runtime |
| 3 | Supervisor | **go** (small) | Process control inside env images; no mature Rust supervisord found |
| 4 | yamllint | maybe | Small and well-scoped, but GPL-3.0 → wait for ADR-0013 |
| 5 | sqlglot | maybe | Data-product fit, but `polyglot` (Rust, MIT, ~1k★) already exists |
| 6 | Datasette | maybe | DuckDB fit, but its value is the Python plugin ecosystem |
| 7 | sqlfluff | no | `sqruff` (Rust, Apache-2.0, ~1.4k★) is active |
| 8 | MkDocs | no | `zensical` (by the Material for MkDocs team, MIT, ~6k★) is the successor |
| 9 | mermaid-cli | no | `mermaid-rs-renderer` (MIT, ~1.8k★) renders without a browser |
| 10 | detect-secrets | no | `kingfisher` (Rust, Apache-2.0, ~1.3k★, MongoDB) covers the use case |

**Blocker for any "go":** ADR-0013 (licensing policy for rewrites) is still open. CLAUDE.md says
rewrites follow it, so no rewrite task should be queued until the maintainer accepts it.

## Method

- Candidates chosen by hand (hypothesis-driven, not exhaustive) for relevance to MinBit's roadmap
  in the kickoff decisions: notifications, environment factory, data product, docs/diagrams, CI.
- **Validated** metadata: GitHub search API (`gh api -X GET search/repositories -f q='repo:<owner>/<name>'`),
  run 2026-11-16 ~10:20 UTC. Fields: SPDX licence, primary language, stars, last push, repo size
  (KB). Existing Rust ports found with `search/repositories` queries like `"<name> language:Rust"`
  sorted by stars.
- **Not collected this run:** last release tag/date and contributor counts. Web fetches were
  refused by the session (no URL provenance; WebSearch classifier errors), and `gh` is restricted
  to search here. Follow-up below.

## Candidates (validated metadata)

| Project | Licence (SPDX) | Lang | Stars | Last push | Size KB |
|---|---|---|---|---|---|
| [caronc/apprise](https://github.com/caronc/apprise) | BSD-2-Clause | Python | 17,775 | 2026-11-16 | 15,782 |
| [cookiecutter/cookiecutter](https://github.com/cookiecutter/cookiecutter) | BSD-3-Clause | Python | 25,180 | 2026-04-01 | 3,499 |
| [Supervisor/supervisor](https://github.com/Supervisor/supervisor) | NOASSERTION¹ | Python | 9,169 | 2025-12-21 | 5,848 |
| [adrienverge/yamllint](https://github.com/adrienverge/yamllint) | GPL-3.0 | Python | 3,492 | 2026-09-19 | 836 |
| [tobymao/sqlglot](https://github.com/tobymao/sqlglot) | MIT | Python | 9,796 | 2026-11-16 | 54,104 |
| [simonw/datasette](https://github.com/simonw/datasette) | Apache-2.0 | Python | 11,578 | 2026-11-16 | 12,789 |
| [sqlfluff/sqlfluff](https://github.com/sqlfluff/sqlfluff) | MIT | Python | 10,026 | 2026-11-15 | 57,160 |
| [mkdocs/mkdocs](https://github.com/mkdocs/mkdocs) | BSD-2-Clause | Python | 22,555 | 2025-10-20 | 33,238 |
| [mermaid-js/mermaid-cli](https://github.com/mermaid-js/mermaid-cli) | MIT | JavaScript | 5,169 | 2026-11-16 | 3,453 |
| [Yelp/detect-secrets](https://github.com/Yelp/detect-secrets) | Apache-2.0 | Python | 4,675 | 2026-04-02 | 2,174 |

¹ GitHub could not classify the licence. *Hypothesis:* Supervisor uses a BSD-style licence derived
from the Repoze licence; a human must read its `LICENSES.txt` before any rewrite.

Size is the git repo size, not lines of code — a rough proxy for rewrite effort only.

## Existing Rust alternatives (validated via search API)

| For | Rust project | Licence | Stars | Last push |
|---|---|---|---|---|
| Apprise | [AlphaJack/mercurio](https://github.com/AlphaJack/mercurio) | Apache-2.0 | 2 | 2026-11-16 |
| Apprise | [dinglebear-ai/rapprise](https://github.com/dinglebear-ai/rapprise) | AGPL-3.0 | 2 | 2026-11-02 |
| Supervisor | [toshsan/supervisors](https://github.com/toshsan/supervisors) | MIT | 3 | 2025-06-22 |
| yamllint | [hiromaily/yaml-lint-rs](https://github.com/hiromaily/yaml-lint-rs) | MIT | 8 | 2026-02-27 |
| sqlglot | [tobilg/polyglot](https://github.com/tobilg/polyglot) | MIT | 1,010 | 2026-11-09 |
| sqlfluff | [quarylabs/sqruff](https://github.com/quarylabs/sqruff) | Apache-2.0 | 1,422 | 2026-11-16 |
| MkDocs | [zensical/zensical](https://github.com/zensical/zensical) | MIT | 6,182 | 2026-11-14 |
| mermaid-cli | [1jehuang/mermaid-rs-renderer](https://github.com/1jehuang/mermaid-rs-renderer) | MIT | 1,823 | 2026-10-04 |
| detect-secrets | [mongodb/kingfisher](https://github.com/mongodb/kingfisher) | Apache-2.0 | 1,310 | 2026-11-16 |

No Rust port surfaced for Cookiecutter (only Cookiecutter *templates for* Rust projects, and
[vmchale/project-init](https://github.com/vmchale/project-init), BSD-3-Clause, 139★, last push
2023-09-11) or Datasette.

## Why (per candidate) — hypotheses unless marked

1. **Apprise — go.** One CLI/library that sends to many notification services. MinBit plans
   Matrix/Signal notifications (kickoff decisions). A static Rust binary is easy to drop into any
   environment and an MCP server is a natural add-on. Start with a small, compatible subset of URL
   schemes (Matrix, ntfy, email, Slack, Telegram); the full service list is the long tail.
   Licence BSD-2 is compatible with AGPL distribution (validated: SPDX from API).
2. **Cookiecutter — go.** Project templating from a directory + JSON prompts with Jinja. The
   environment factory (ADR-0017, open) and the Portal both need "render a template into a repo".
   Rust has a Jinja-compatible engine (minijinja — dependency → `needs-human:dependency`). Value:
   one binary, no Python, fast; risk: template compatibility with Jinja extensions.
3. **Supervisor — go (small).** Starts and restarts processes from an INI config. Useful inside
   demo/test environment images. Rust value: small static binary, lower memory. Narrow scope
   (no XML-RPC web UI at first). Licence must be confirmed by a human first (¹).
4. **yamllint — maybe.** Small, clear rule set, and MinBit lints YAML state. But it is GPL-3.0:
   a clean-room rewrite from docs/behaviour is possible in principle, yet this is exactly what
   ADR-0013 must govern. Small Rust ports already exist (8★) — check them first.
5. **sqlglot — maybe.** SQL parser/transpiler, relevant to the DuckDB product. `polyglot` already
   targets the same space in Rust/Wasm; better to evaluate and contribute than to start a third.
6. **Datasette — maybe.** Publishing data from SQLite; a DuckDB-native equivalent could be
   interesting, but Datasette's strength is its Python plugin ecosystem, which a rewrite loses.
7. **sqlfluff — no.** `sqruff` exists and is active.
8. **MkDocs — no.** `zensical` from the Material for MkDocs team is the active successor.
9. **mermaid-cli — no.** The Chrome dependency was the pain point; Rust renderers now exist.
10. **detect-secrets — no.** `kingfisher` (and Go tools such as gitleaks) cover this.

Also considered and dropped without a row: Sphinx (no Rust port found, but its value is the
Python extension ecosystem; licence shown as NOASSERTION by GitHub), pyinfra (MIT; configs are
Python code, so a Rust rewrite would change the user model).

## Licence notes for ADR-0013

- Permissive candidates (MIT, BSD-2/3, Apache-2.0) can be reimplemented and shipped under
  AGPL-3.0-or-later; any copied code must keep its notices (*hypothesis — needs human/legal check*).
- GPL-3.0 sources (yamllint): even with a clean-room approach, the policy should say whether
  reading the source is allowed.
- Unclassified licences (Supervisor, Sphinx): a human reads the file before any work starts.
- Not legal advice; the maintainer decides in ADR-0013.

## Suggested follow-ups (not done here)

- Fill in last release + contributor counts for the 3 "go" candidates once web access works.
- Planner: after ADR-0013 is accepted, turn Apprise-subset and Cookiecutter-compatible renderer
  into tasks (each would likely carry `needs-human:dependency` and `needs-human:licence`).
- Evaluate `polyglot` against MinBit's DuckDB use cases before considering any SQL work.
