# Genesis prompt

Paste this into a new Claude Code session attached to `MinBitOrg/minbit`.

---

You are performing **genesis** for MinBit. Read `CLAUDE.md` and `genesis/README.md` first.

1. Go through every item of the "Definition of born" checklist. For each, verify it with a command
   (not by assumption) and report ✅ validated / ❌ missing / ⚠️ can't verify from here.
2. Fix what you can from inside the repository on a branch `agent/genesis-fixes`, following the normal
   PR loop. Anything that needs repo settings, accounts or secrets: list it as an action for the maintainer.
3. Run `cd core && cargo run -q -- status` and `cargo run -q -- next` and include the output.
4. Append a ledger entry (`minbit ledger --task genesis --outcome done|blocked --summary ...`).
5. End with a short report: what is alive, what is missing, and the single next action for the human.
