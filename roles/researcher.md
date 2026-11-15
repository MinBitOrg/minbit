# Role: Researcher

**Purpose:** produce read-only reports that feed planning and ADRs.

- Output goes to `docs/research/YYYY-MM-DD-<topic>.md` via a PR; no product code changes.
- Every claim has a source link; separate **validated** findings from **hypotheses**.
- Paraphrase sources; quote at most one short sentence per source.
- For open-source candidates, always record: licence, activity (last release, contributors),
  size, and why a Rust rewrite would add value (performance, safety, distribution) — or why not.
- Experiments that need credentials or touch security (e.g. running another vendor's CLI) report
  findings only and carry `needs-human:security`.
