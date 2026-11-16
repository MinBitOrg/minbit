# Genesis — how MinBit is born

Genesis turns an empty environment plus this repository into a working workspace.
Phase A host: **Claude** (a Claude Project + Claude Code cloud sessions + scheduled tasks).
The same steps are meant to be reproducible elsewhere; host-specific parts are marked *(Claude)*.

## Definition of "born"

- [ ] Repository exists, `main` protected, CI green on `main`.
- [ ] Labels synced (`scripts/sync-labels.sh`), auto-merge enabled in repo settings.
- [ ] AI reviewers installed on the repo (CodeRabbit, Copilot code review) — free on public repos.
- [ ] `state/workspace.yaml` initialised; `minbit status` runs.
- [ ] MVP backlog seeded as issues (`scripts/seed-issues.py`, after creating the `mvp-genesis` milestone) and mirrored in `state/tasks.yaml`.
- [ ] Heartbeat scheduled *(Claude: scheduled task using [`heartbeat-prompt.md`](heartbeat-prompt.md))*.
- [ ] Digest delivery works (push notification + GitHub digest issue).
- [ ] Kill switch tested: disabling the heartbeat stops all work; `minbit pause` is respected.

## Steps

1. Create the GitHub repository `MinBitOrg/minbit` (public) and push this tree.
2. Settings → General: allow auto-merge, allow squash merge only, delete branches on merge.
3. Apply the merge gate (admin): `gh api -X POST repos/MinBitOrg/minbit/rulesets --input .github/rulesets/main.json`.
   It requires a PR plus the `rust`, `state`, `portal`, `CodeRabbit` and `automerge-gate` checks
   ([docs/ci.md](../docs/ci.md)). Without it, the automerge
   workflow refuses to run (an earlier PR was merged before CI and review finished).
4. Install CodeRabbit and enable Copilot code review on the repo.
5. Run `scripts/sync-labels.sh` and `python3 scripts/seed-issues.py` (needs `gh auth login`; create the `mvp-genesis` milestone first).
6. *(Claude)* In the "AI workspace" Project, start a Claude Code session on the repo with
   [`genesis-prompt.md`](genesis-prompt.md). It verifies the checklist above and fixes what it can.
7. *(Claude)* Create the heartbeat scheduled task with [`heartbeat-prompt.md`](heartbeat-prompt.md).

## Rebirth test

Genesis is done when someone can repeat steps 1–7 on a fresh account in under 30 minutes, with no
step that isn't written here.
