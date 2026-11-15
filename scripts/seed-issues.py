#!/usr/bin/env python3
"""Mirror state/tasks.yaml into GitHub issues (one per task) under a milestone.

Usage: python3 scripts/seed-issues.py [--repo MinBitOrg/minbit] [--dry-run]
Requires: gh auth login, PyYAML (pip install pyyaml).
Idempotent: skips tasks whose id already appears in an issue title.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default="MinBitOrg/minbit")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    tasks = yaml.safe_load((ROOT / "state/tasks.yaml").read_text())["tasks"]
    existing = "" if a.dry_run else gh(
        "issue", "list", "--repo", a.repo, "--state", "all", "--limit", "500", "--json", "title"
    )
    existing_titles = {i["title"] for i in json.loads(existing or "[]")}

    for t in tasks:
        title = f"{t['id']}: {t['title']}"
        if any(x.startswith(t["id"] + ":") for x in existing_titles):
            print(f"skip  {t['id']} (exists)")
            continue
        deps = ", ".join(t.get("depends_on", [])) or "none"
        body = (
            f"Mirrors `state/tasks.yaml` → **{t['id']}** (source of truth is the state file).\n\n"
            f"- Role: `{t['role']}`\n- Priority: {t['priority']}\n- Depends on: {deps}\n"
        )
        labels = [f"role:{t['role']}", *t.get("labels", [])]
        cmd = ["issue", "create", "--repo", a.repo, "--title", title, "--body", body]
        for lab in labels:
            cmd += ["--label", lab]
        if t.get("milestone"):
            cmd += ["--milestone", t["milestone"]]
        if a.dry_run:
            print("would create:", title, labels)
        else:
            print("create", gh(*cmd).strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
