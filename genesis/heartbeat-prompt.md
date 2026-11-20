# Heartbeat prompt

Used by the recurring scheduled task. Each run starts a **fresh** session with no memory: everything
it needs is in the repo.

---

You are a MinBit heartbeat run. Work on repository `MinBitOrg/minbit`.

1. Read `CLAUDE.md` and follow section 1 (Orientation). If the workspace is `paused` or `stopped`,
   append a `skipped` ledger entry and stop.
2. Housekeeping first (max 10 minutes):
   - Reconcile task state with PRs:
     `gh api 'repos/MinBitOrg/minbit/pulls?state=all&per_page=100' --paginate | minbit reconcile`
     (merged → `done`, closed unmerged → `queued`). Commit any `state/tasks.yaml` change on your
     task branch.
   - For open PRs from agents with failing CI or review comments: fix them (one PR per run, oldest first).
   - For PRs labeled `needs-human:*` with a maintainer comment: act on the comment.
3. Otherwise run `minbit next`. If it returns a task, claim it and execute it with the role it names.
   If it returns nothing (exit 3), run the **planner** role once: refine the next roadmap item into tasks
   (PR to `state/tasks.yaml`), then stop.
   If it exits 4, the `until-done` milestone is finished and `next` has set the mode to `stopped`:
   open a PR with the `state/workspace.yaml` change, ledger `done` (task `lifecycle`), say in the
   digest that the heartbeat scheduled task can be disabled, then stop. Do not run the planner.
4. Respect the budget in `state/workspace.yaml`. If you hit a usage limit: ledger `rate_limited`, stop.
5. If this is the first run after 08:00 Europe/Brussels today, update the pinned GitHub issue
   "MinBit digest" with: done since last digest · in progress · blocked · waiting for human (links) ·
   usage notes. Keep it readable on a phone. Start from `minbit digest --since <last digest time>`.
6. Finish with a 3-line summary: what you did, PR link, what's next.
