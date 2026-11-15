#!/usr/bin/env python3
"""Mirror state/tasks.yaml into GitHub issues (one per task) under a milestone.

Usage: python3 scripts/seed-issues.py [--repo MinBitOrg/minbit] [--dry-run]
Requires: gh auth login, PyYAML (pip install pyyaml). Python 3.9+.

Idempotent: skips tasks whose id already appears in an issue title.
Creates missing milestones and labels before creating issues.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent

ESCALATION_COLOR = "d93f0b"
ROLE_COLOR = "0e8a16"


class GhError(RuntimeError):
    pass


def gh(*args: str) -> str:
    """Run gh and return stdout; raise GhError carrying gh's own error message."""
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        msg = (proc.stderr or proc.stdout).strip()
        raise GhError(f"gh {' '.join(args[:2])} failed: {msg}")
    return proc.stdout


def ensure_milestones(repo: str, names: set, dry_run: bool) -> None:
    existing = {
        m["title"]
        for m in json.loads(gh("api", f"repos/{repo}/milestones?state=all&per_page=100"))
    }
    for name in sorted(names - existing):
        if dry_run:
            print(f"would create milestone {name}")
        else:
            gh("api", f"repos/{repo}/milestones", "-f", f"title={name}")
            print(f"milestone {name} created")


def ensure_labels(repo: str, names: set, dry_run: bool) -> None:
    existing = {
        lab["name"]
        for lab in json.loads(gh("label", "list", "--repo", repo, "--limit", "200", "--json", "name"))
    }
    for name in sorted(names - existing):
        color = ROLE_COLOR if name.startswith("role:") else ESCALATION_COLOR
        if dry_run:
            print(f"would create label {name}")
        else:
            gh("label", "create", name, "--repo", repo, "--color", color, "--force")
            print(f"label {name} created")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default="MinBitOrg/minbit")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    tasks = yaml.safe_load((ROOT / "state/tasks.yaml").read_text())["tasks"]

    try:
        gh("auth", "status")
        ensure_milestones(a.repo, {t["milestone"] for t in tasks if t.get("milestone")}, a.dry_run)
        ensure_labels(
            a.repo,
            {f"role:{t['role']}" for t in tasks} | {lab for t in tasks for lab in t.get("labels", [])},
            a.dry_run,
        )
        issues = json.loads(
            gh("issue", "list", "--repo", a.repo, "--state", "all", "--limit", "500", "--json", "title")
        )
    except GhError as e:
        print(f"✗ {e}", file=sys.stderr)
        return 1

    titles = [i["title"] for i in issues]
    failures = 0
    for t in tasks:
        if any(x.startswith(t["id"] + ":") for x in titles):
            print(f"skip   {t['id']} (exists)")
            continue
        deps = ", ".join(t.get("depends_on", [])) or "none"
        body = (
            f"Mirrors `state/tasks.yaml` → **{t['id']}** (source of truth is the state file).\n\n"
            f"- Role: `{t['role']}`\n- Priority: {t['priority']}\n- Depends on: {deps}\n"
        )
        cmd = ["issue", "create", "--repo", a.repo, "--title", f"{t['id']}: {t['title']}", "--body", body]
        for lab in [f"role:{t['role']}", *t.get("labels", [])]:
            cmd += ["--label", lab]
        if t.get("milestone"):
            cmd += ["--milestone", t["milestone"]]
        if a.dry_run:
            print("would create:", t["id"])
            continue
        try:
            print("create", gh(*cmd).strip())
        except GhError as e:
            failures += 1
            print(f"✗ {t['id']}: {e}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())