# 0014 — Project licence: AGPL-3.0-or-later

**Status:** accepted (2026-11-15)

## Context

MinBit is open source and may later be offered as a hosted service. The maintainer wants some
protection against closed proprietary reuse, with the option to become more permissive later.

## Decision

License all MinBit code under **AGPL-3.0-or-later**. Every source file may carry
`SPDX-License-Identifier: AGPL-3.0-or-later`.

## Consequences

- Anyone running a modified MinBit as a network service must offer its source to users.
- Some companies avoid AGPL dependencies; acceptable at this stage.
- **Relicensing later** (e.g. to Apache-2.0) needs consent from every copyright holder. Before
  accepting external contributions we adopt a contributor licence grant that allows it
  (see CONTRIBUTING.md). Until then, only the maintainer and his agents contribute.
- *Hypothesis:* the copyright status of purely AI-generated code is legally unsettled; the project
  doesn't depend on it either way.
