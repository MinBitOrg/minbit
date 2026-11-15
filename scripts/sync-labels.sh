#!/usr/bin/env bash
# Create or update the labels MinBit's workflow relies on. Requires: gh auth login.
set -euo pipefail
REPO="${1:-MinBitOrg/minbit}"

label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force; }

label "needs-human:dependency" "d93f0b" "Adds or upgrades a third-party dependency"
label "needs-human:licence"    "d93f0b" "Licence change or external code"
label "needs-human:security"   "b60205" "Auth, secrets, sandboxing, network, security findings"
label "needs-human:schema"     "d93f0b" "Persisted data formats or state/schema"
label "needs-human:spend"      "d93f0b" "Raises cost"
label "needs-human:release"    "5319e7" "Tag, release or outbound action"
label "role:planner"           "0e8a16" "Planner task"
label "role:builder"           "0e8a16" "Builder task"
label "role:reviewer"          "0e8a16" "Reviewer task"
label "role:researcher"        "0e8a16" "Researcher task"
label "digest"                 "c5def5" "Daily digest issue"
