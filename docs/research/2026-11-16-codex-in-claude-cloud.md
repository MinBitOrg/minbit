# Can a Claude Code cloud session run `codex exec` with a ChatGPT Go login?

**Task:** MB-006 · **Role:** researcher · **Date:** 2026-11-16 · **Status:** report only, no login attempted

## Answer

**Not in the current environment.** The Codex CLI installs and runs here, but this session's
egress proxy refuses connections to OpenAI hosts, so `codex exec` cannot reach a model whatever
the login. Even with egress opened, a ChatGPT login is a poor fit for ephemeral, unattended
sessions (see Risks). Recommendation: **park** until a persistent environment exists (ADR-0017) or
the gateway/API-key path (ADR-0008) lands.

## Validated (run in a heartbeat cloud session, 2026-11-16)

| Check | Result |
|---|---|
| `npm view @openai/codex version license` | `0.169.0`, `Apache-2.0` (npm registry reachable) |
| `npm i -g @openai/codex && codex --version` | `codex-cli 0.169.0` — installs and runs |
| `codex login --help` | Options include `--device-auth`, `--with-api-key` (stdin), `--with-access-token` (stdin) |
| `codex exec --help` | Non-interactive mode present; prompt as arg or stdin |
| `codex login status` | `Not logged in` (no credentials were provided or used) |
| `curl https://auth.openai.com/`, `https://api.openai.com/v1/models`, `https://chatgpt.com/` | `CONNECT tunnel failed, response 403` from the session's egress proxy |

The 403 comes from the sandbox proxy, not from OpenAI: the hosts are not on this environment's
network allowlist. Nothing was installed into the repo; the CLI lived only in the throwaway sandbox.

## From sources (not verified first-hand)

- **Login flows.** `codex login` uses a browser callback on localhost, which fails in containers;
  `codex login --device-auth` prints a URL and one-time code instead, and must be enabled on the
  account first. ([Vaughan, Codex CLI authentication](https://codex.danielvaughan.com/2026/04/01/codex-cli-authentication-flows-credential-management/))
- **Token handling.** Codex refreshes tokens during use and writes them back to `auth.json`;
  idle logins expire after roughly 8 days. For CI with a ChatGPT login, the pattern is to seed
  `auth.json` from a secret only if absent, persist the refreshed file, and serialise runs to avoid
  refresh races. The source calls `auth.json` "a password-equivalent secret". (same source)
- **API key path.** `codex login --with-api-key` via stdin is the simplest for pipelines, billed
  per use rather than through the subscription. (same source)
- **Go plan.** ADR-0016 records that Go includes limited Codex usage and no Codex Cloud. Reports
  say ChatGPT and Codex limits will be shared from December 2026 — not verified, page did not load
  ([TechRepublic](https://www.techrepublic.com/article/news-chatgpt-codex-shared-usage-limits/)).
  Official pages ([auth](https://developers.openai.com/codex/auth), [pricing](https://developers.openai.com/codex/pricing))
  now redirect to `learn.chatgpt.com`, which this run could not fetch.

## Risks if we opened egress anyway (hypotheses)

1. **Token persistence.** Each heartbeat is a fresh container. A refreshed token would be lost at
   the end of the run unless written back to a secret store the session can update — which the
   environment secret store does not obviously support. Stale seeds → login loops.
2. **Concurrency.** Two overlapping sessions refreshing the same token can invalidate each other.
3. **Blast radius.** A personal ChatGPT credential would sit in a sandbox that reads untrusted text
   (PR comments, CodeRabbit output, web pages). A prompt-injection leak exposes the whole ChatGPT
   account, not a scoped key.
4. **Policy.** Codex CLI is an official client, so ADR-0016 rule 1 is satisfied; using a personal
   subscription from an automated pipeline is still a terms question the maintainer should check.

## Options for the maintainer

| Option | Effort | Notes |
|---|---|---|
| A. Park MB-006 (recommended) | none | Revisit with ADR-0017 environments or ADR-0008 gateway. |
| B. Allow OpenAI hosts in this environment + API key secret | low | Usage-billed (`needs-human:spend`); scoped key limits blast radius. |
| C. Allow hosts + ChatGPT `auth.json` secret | medium | Risks 1–3 above; needs a write-back mechanism. |
| D. Run Codex on a maintainer-controlled machine/runner | medium | Persistent token store; Claude agents hand off via issues/PRs. |

## Follow-ups (not done here)

- If B or C is chosen: a task to document the network allowlist change and a smoke test
  (`codex exec "echo ok"`), labelled `needs-human:security`.
