//! MinBit Workspace core.
//!
//! The world model lives as plain files under `state/` so that any agent (or human) can read it,
//! diff it in a PR and rebuild the workspace anywhere. This crate is the single, typed way to read
//! and change it.

use anyhow::{bail, Context, Result};
use chrono::{DateTime, FixedOffset, Local, SecondsFormat};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

// ---------- workspace.yaml ----------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Mode {
    AlwaysOn,
    UntilDone,
    Paused,
    Stopped,
}

impl Mode {
    /// Whether an agent run may pick up work in this mode.
    pub fn accepts_work(self) -> bool {
        matches!(self, Mode::AlwaysOn | Mode::UntilDone)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Lifecycle {
    pub mode: Mode,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub milestone: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Budget {
    pub plan: String,
    pub heartbeat_interval_hours: u32,
    pub max_runs_per_day: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub upgrade_trigger: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Maintainer {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub review_window: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Guardrails {
    pub auto_merge: bool,
    pub releases_allowed: bool,
    pub escalation_labels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Workspace {
    pub version: u32,
    pub name: String,
    pub lifecycle: Lifecycle,
    pub budget: Budget,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub maintainer: Option<Maintainer>,
    pub guardrails: Guardrails,
}

// ---------- tasks.yaml ----------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Status {
    Queued,
    InProgress,
    InReview,
    Done,
    Blocked,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub role: String,
    pub status: Status,
    pub priority: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub milestone: Option<String>,
    #[serde(default)]
    pub depends_on: Vec<String>,
    #[serde(default)]
    pub labels: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub claimed_by: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pr: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TaskList {
    pub tasks: Vec<Task>,
}

// ---------- ledger ----------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Outcome {
    PrOpened,
    Done,
    Failed,
    Blocked,
    Skipped,
    RateLimited,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LedgerEntry {
    pub ts: String,
    pub task: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session: Option<String>,
    pub outcome: Outcome,
    pub summary: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pr: Option<String>,
}

// ---------- the state directory ----------

pub struct State {
    pub dir: PathBuf,
    pub workspace: Workspace,
    pub tasks: TaskList,
}

/// Walk up from `start` until a directory containing `state/workspace.yaml` is found.
pub fn find_state_dir(start: &Path) -> Result<PathBuf> {
    for dir in start.ancestors() {
        let candidate = dir.join("state");
        if candidate.join("workspace.yaml").is_file() {
            return Ok(candidate);
        }
    }
    bail!(
        "no state/workspace.yaml found in {} or any parent directory",
        start.display()
    )
}

/// `https://github.com/o/r/pull/21` -> `21`; anything else is returned unchanged.
fn pr_number(url: &str) -> &str {
    url.rsplit_once("/pull/")
        .map(|(_, n)| n.trim_end_matches('/'))
        .unwrap_or(url)
}

pub fn now() -> String {
    Local::now().to_rfc3339_opts(SecondsFormat::Secs, false)
}

impl State {
    pub fn load(dir: &Path) -> Result<Self> {
        let ws_path = dir.join("workspace.yaml");
        let workspace: Workspace = serde_yaml::from_str(
            &fs::read_to_string(&ws_path)
                .with_context(|| format!("reading {}", ws_path.display()))?,
        )
        .with_context(|| format!("parsing {}", ws_path.display()))?;
        let tasks_path = dir.join("tasks.yaml");
        let tasks: TaskList = if tasks_path.exists() {
            serde_yaml::from_str(&fs::read_to_string(&tasks_path)?)
                .with_context(|| format!("parsing {}", tasks_path.display()))?
        } else {
            TaskList::default()
        };
        Ok(Self {
            dir: dir.to_path_buf(),
            workspace,
            tasks,
        })
    }

    /// Write `tasks.yaml`, then `workspace.yaml`. Tasks go first so a failed write can never leave
    /// a lifecycle change (such as an until-done auto-stop) on disk without the task change that
    /// caused it; the next `minbit next` simply re-derives the stop.
    pub fn save(&self) -> Result<()> {
        let tasks_path = self.dir.join("tasks.yaml");
        fs::write(&tasks_path, serde_yaml::to_string(&self.tasks)?)
            .with_context(|| format!("writing {}", tasks_path.display()))?;
        let ws_path = self.dir.join("workspace.yaml");
        fs::write(&ws_path, serde_yaml::to_string(&self.workspace)?)
            .with_context(|| format!("writing {}", ws_path.display()))?;
        Ok(())
    }

    /// Structural checks beyond what the types already enforce. Returns a list of problems.
    pub fn validate(&self) -> Vec<String> {
        let mut problems = Vec::new();
        if self.workspace.version != 1 {
            problems.push(format!(
                "unsupported workspace version {}",
                self.workspace.version
            ));
        }
        if DateTime::<FixedOffset>::parse_from_rfc3339(&self.workspace.lifecycle.updated_at)
            .is_err()
        {
            problems.push("lifecycle.updated_at is not RFC 3339".into());
        }
        let mut seen = HashSet::new();
        for t in &self.tasks.tasks {
            if !seen.insert(t.id.as_str()) {
                problems.push(format!("duplicate task id {}", t.id));
            }
            if !(1..=5).contains(&t.priority) {
                problems.push(format!("{}: priority must be 1..=5", t.id));
            }
            for label in &t.labels {
                if label.starts_with("needs-human:")
                    && !self.workspace.guardrails.escalation_labels.contains(label)
                {
                    problems.push(format!("{}: unknown escalation label {label}", t.id));
                }
            }
        }
        let ids: HashSet<&str> = self.tasks.tasks.iter().map(|t| t.id.as_str()).collect();
        for t in &self.tasks.tasks {
            for d in &t.depends_on {
                if !ids.contains(d.as_str()) {
                    problems.push(format!("{} depends on unknown task {d}", t.id));
                }
                if d == &t.id {
                    problems.push(format!("{} depends on itself", t.id));
                }
            }
        }
        for cycle in self.dependency_cycles() {
            problems.push(format!("dependency cycle: {}", cycle.join(" -> ")));
        }
        problems
    }

    /// Dependency cycles of length ≥ 2 among known tasks (self-dependencies and unknown ids are
    /// reported separately by [`State::validate`]). Returns an empty list if and only if the graph
    /// is acyclic; otherwise one entry per back edge found by a depth-first search, as the path of
    /// ids that closes on its first element, e.g. `["MB-001", "MB-002", "MB-001"]`.
    pub fn dependency_cycles(&self) -> Vec<Vec<String>> {
        #[derive(Clone, Copy, PartialEq)]
        enum Mark {
            New,
            OnStack,
            Finished,
        }
        let index: HashMap<&str, usize> = self
            .tasks
            .tasks
            .iter()
            .enumerate()
            .map(|(i, t)| (t.id.as_str(), i))
            .collect();
        let edges: Vec<Vec<usize>> = self
            .tasks
            .tasks
            .iter()
            .map(|t| {
                t.depends_on
                    .iter()
                    .filter(|d| *d != &t.id)
                    .filter_map(|d| index.get(d.as_str()).copied())
                    .collect()
            })
            .collect();
        let mut mark = vec![Mark::New; edges.len()];
        let mut cycles = Vec::new();
        // Iterative DFS: each frame is (node, next edge to visit).
        for root in 0..edges.len() {
            if mark[root] != Mark::New {
                continue;
            }
            let mut stack: Vec<(usize, usize)> = vec![(root, 0)];
            mark[root] = Mark::OnStack;
            while let Some(frame) = stack.last_mut() {
                let (node, next) = *frame;
                if let Some(&dep) = edges[node].get(next) {
                    frame.1 += 1;
                    match mark[dep] {
                        Mark::New => {
                            mark[dep] = Mark::OnStack;
                            stack.push((dep, 0));
                        }
                        Mark::OnStack => {
                            let start = stack.iter().position(|(n, _)| *n == dep).unwrap_or(0);
                            let mut cycle: Vec<String> = stack[start..]
                                .iter()
                                .map(|(n, _)| self.tasks.tasks[*n].id.clone())
                                .collect();
                            cycle.push(self.tasks.tasks[dep].id.clone());
                            cycles.push(cycle);
                        }
                        Mark::Finished => {}
                    }
                } else {
                    mark[node] = Mark::Finished;
                    stack.pop();
                }
            }
        }
        cycles
    }

    fn task_mut(&mut self, id: &str) -> Result<&mut Task> {
        self.tasks
            .tasks
            .iter_mut()
            .find(|t| t.id == id)
            .with_context(|| format!("no task with id {id}"))
    }

    /// The next task an agent should pick up: queued, dependencies done, in the active milestone
    /// (if one is set), lowest priority number first, then lowest id.
    pub fn next_task(&self) -> Option<&Task> {
        let status: HashMap<&str, Status> = self
            .tasks
            .tasks
            .iter()
            .map(|t| (t.id.as_str(), t.status))
            .collect();
        let milestone = self.workspace.lifecycle.milestone.as_deref();
        self.tasks
            .tasks
            .iter()
            .filter(|t| t.status == Status::Queued)
            .filter(|t| milestone.is_none() || t.milestone.as_deref() == milestone)
            .filter(|t| {
                t.depends_on.iter().all(|d| {
                    matches!(
                        status.get(d.as_str()),
                        Some(Status::Done | Status::Cancelled)
                    )
                })
            })
            .min_by(|a, b| a.priority.cmp(&b.priority).then_with(|| a.id.cmp(&b.id)))
    }

    pub fn claim(&mut self, id: &str, session: &str) -> Result<()> {
        if !self.workspace.lifecycle.mode.accepts_work() {
            bail!(
                "workspace is {:?}; not accepting work",
                self.workspace.lifecycle.mode
            );
        }
        let t = self.task_mut(id)?;
        if t.status != Status::Queued {
            bail!("task {id} is {:?}, not queued", t.status);
        }
        t.status = Status::InProgress;
        t.claimed_by = Some(session.to_string());
        Ok(())
    }

    pub fn set_status(&mut self, id: &str, status: Status, pr: Option<String>) -> Result<()> {
        let t = self.task_mut(id)?;
        t.status = status;
        if pr.is_some() {
            t.pr = pr;
        }
        Ok(())
    }

    pub fn set_mode(&mut self, mode: Mode, reason: Option<String>) {
        let lc = &mut self.workspace.lifecycle;
        lc.mode = mode;
        if reason.is_some() {
            lc.reason = reason;
        }
        lc.updated_at = now();
    }

    /// Whether the `until-done` goal is reached: the mode is `until-done` and every task in the
    /// active milestone (or every task, when no milestone is set) is `done` or `cancelled`.
    /// An empty scope never counts as complete, so a mistyped milestone cannot stop the workspace.
    pub fn until_done_complete(&self) -> bool {
        if self.workspace.lifecycle.mode != Mode::UntilDone {
            return false;
        }
        let milestone = self.workspace.lifecycle.milestone.as_deref();
        let mut scope = self
            .tasks
            .tasks
            .iter()
            .filter(|t| milestone.is_none() || t.milestone.as_deref() == milestone)
            .peekable();
        scope.peek().is_some()
            && scope.all(|t| matches!(t.status, Status::Done | Status::Cancelled))
    }

    /// Stop the workspace if [`State::until_done_complete`] holds. Returns `true` when it stopped.
    /// The caller is responsible for saving.
    pub fn stop_if_until_done_complete(&mut self) -> bool {
        if !self.until_done_complete() {
            return false;
        }
        let what = match &self.workspace.lifecycle.milestone {
            Some(m) => format!("milestone {m}"),
            None => "all tasks".to_string(),
        };
        self.set_mode(
            Mode::Stopped,
            Some(format!("until-done: {what} complete (auto-stop)")),
        );
        true
    }

    pub fn ledger_path(&self) -> PathBuf {
        let month = Local::now().format("%Y-%m").to_string();
        self.dir.join("ledger").join(format!("{month}.jsonl"))
    }

    pub fn append_ledger(&self, entry: &LedgerEntry) -> Result<PathBuf> {
        let path = self.ledger_path();
        fs::create_dir_all(path.parent().unwrap())?;
        let mut f = OpenOptions::new().create(true).append(true).open(&path)?;
        writeln!(f, "{}", serde_json::to_string(entry)?)?;
        Ok(path)
    }

    /// Read every ledger entry under `ledger/*.jsonl`, oldest file first, in file order.
    pub fn read_ledger(&self) -> Result<Vec<LedgerEntry>> {
        let dir = self.dir.join("ledger");
        let read = match fs::read_dir(&dir) {
            Ok(r) => r,
            // No ledger yet is a normal empty state; any other error (permissions, not a
            // directory, ...) must surface instead of rendering an empty digest.
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
            Err(e) => return Err(e).with_context(|| format!("reading {}", dir.display())),
        };
        let mut files: Vec<PathBuf> = read
            .map(|e| e.map(|e| e.path()))
            .collect::<std::io::Result<Vec<_>>>()
            .with_context(|| format!("listing {}", dir.display()))?
            .into_iter()
            .filter(|p| p.extension().is_some_and(|x| x == "jsonl"))
            .collect();
        files.sort();
        let mut entries = Vec::new();
        for f in files {
            let content =
                fs::read_to_string(&f).with_context(|| format!("reading {}", f.display()))?;
            for (i, line) in content.lines().enumerate() {
                if line.trim().is_empty() {
                    continue;
                }
                let e: LedgerEntry = serde_json::from_str(line)
                    .with_context(|| format!("{}:{}: invalid ledger entry", f.display(), i + 1))?;
                entries.push(e);
            }
        }
        Ok(entries)
    }

    /// Render the daily digest as Markdown: done since `since`, in progress, blocked, waiting for
    /// the human, and usage notes. Ledger entries whose `ts` does not parse are ignored.
    pub fn digest(&self, ledger: &[LedgerEntry], since: DateTime<FixedOffset>) -> String {
        let recent: Vec<&LedgerEntry> = ledger
            .iter()
            .filter(|e| {
                DateTime::<FixedOffset>::parse_from_rfc3339(&e.ts).is_ok_and(|t| t >= since)
            })
            .collect();
        let link = |pr: &Option<String>| -> String {
            match pr {
                Some(url) => format!(" · [PR #{}]({url})", pr_number(url)),
                None => String::new(),
            }
        };
        let task_line = |t: &Task| format!("- **{}** {}{}", t.id, t.title, link(&t.pr));
        // Escalation labels as a suffix, e.g. " — `needs-human:schema`", or "" if none.
        let escalations = |t: &Task| -> String {
            let esc: Vec<&str> = t
                .labels
                .iter()
                .filter(|l| l.starts_with("needs-human:"))
                .map(String::as_str)
                .collect();
            if esc.is_empty() {
                String::new()
            } else {
                format!(" — `{}`", esc.join("`, `"))
            }
        };
        let entry_line = |e: &LedgerEntry| format!("- **{}** {}{}", e.task, e.summary, link(&e.pr));
        let with_status = |s: Status| -> Vec<&Task> {
            self.tasks.tasks.iter().filter(|t| t.status == s).collect()
        };
        let mut out = String::new();
        let mut section = |title: &str, lines: Vec<String>| {
            out.push_str(&format!("### {title}\n"));
            if lines.is_empty() {
                out.push_str("- _none_\n");
            } else {
                for l in lines {
                    out.push_str(&l);
                    out.push('\n');
                }
            }
            out.push('\n');
        };

        let done: Vec<String> = recent
            .iter()
            .filter(|e| matches!(e.outcome, Outcome::Done | Outcome::PrOpened))
            .map(|e| entry_line(e))
            .collect();
        section("✅ Done since last digest", done);

        section(
            "🔨 In progress",
            with_status(Status::InProgress)
                .into_iter()
                .map(task_line)
                .collect(),
        );

        let mut blocked: Vec<String> = with_status(Status::Blocked)
            .into_iter()
            .map(|t| format!("{}{}", task_line(t), escalations(t)))
            .collect();
        blocked.extend(
            recent
                .iter()
                .filter(|e| matches!(e.outcome, Outcome::Blocked | Outcome::Failed))
                .map(|e| entry_line(e)),
        );
        section("⛔ Blocked", blocked);

        let waiting: Vec<String> = with_status(Status::InReview)
            .into_iter()
            .map(|t| match escalations(t) {
                e if e.is_empty() => format!("{} — review/merge", task_line(t)),
                e => format!("{}{e}", task_line(t)),
            })
            .collect();
        section("🙋 Waiting for you", waiting);

        let count = |o: Outcome| recent.iter().filter(|e| e.outcome == o).count();
        let b = &self.workspace.budget;
        let mut usage = vec![format!(
            "- {} ledger {} since {} · plan `{}`, max {} runs/day",
            recent.len(),
            if recent.len() == 1 {
                "entry"
            } else {
                "entries"
            },
            since.format("%Y-%m-%d %H:%M %:z"),
            b.plan,
            b.max_runs_per_day
        )];
        let limited = count(Outcome::RateLimited);
        let skipped = count(Outcome::Skipped);
        if limited > 0 || skipped > 0 {
            usage.push(format!("- rate_limited: {limited} · skipped: {skipped}"));
        }
        section("📊 Usage", usage);
        out.trim_end().to_string() + "\n"
    }

    /// Counts per status, for `minbit status`.
    pub fn summary(&self) -> Vec<(Status, usize)> {
        let order = [
            Status::Queued,
            Status::InProgress,
            Status::InReview,
            Status::Blocked,
            Status::Done,
            Status::Cancelled,
        ];
        order
            .iter()
            .map(|s| {
                (
                    *s,
                    self.tasks.tasks.iter().filter(|t| t.status == *s).count(),
                )
            })
            .filter(|(_, n)| *n > 0)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> (tempfile::TempDir, State) {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join("state");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("workspace.yaml"),
            r#"version: 1
name: test
lifecycle: { mode: until-done, milestone: m1, updated_at: "2026-11-15T18:30:00+01:00" }
budget: { plan: p, heartbeat_interval_hours: 2, max_runs_per_day: 8 }
guardrails: { auto_merge: true, releases_allowed: false, escalation_labels: ["needs-human:schema"] }
"#,
        )
        .unwrap();
        fs::write(
            dir.join("tasks.yaml"),
            r#"tasks:
  - { id: MB-001, title: first task, role: builder, status: queued, priority: 2, milestone: m1 }
  - { id: MB-002, title: urgent but blocked, role: builder, status: queued, priority: 1, milestone: m1, depends_on: [MB-001] }
  - { id: MB-003, title: other milestone, role: builder, status: queued, priority: 1, milestone: m2 }
"#,
        )
        .unwrap();
        let state = State::load(&dir).unwrap();
        (tmp, state)
    }

    #[test]
    fn next_respects_dependencies_and_milestone() {
        let (_tmp, mut s) = fixture();
        assert_eq!(s.next_task().unwrap().id, "MB-001");
        s.set_status("MB-001", Status::Done, None).unwrap();
        assert_eq!(s.next_task().unwrap().id, "MB-002");
        s.set_status("MB-002", Status::Done, None).unwrap();
        assert!(
            s.next_task().is_none(),
            "MB-003 is outside the active milestone"
        );
    }

    #[test]
    fn paused_workspace_refuses_claims() {
        let (_tmp, mut s) = fixture();
        s.set_mode(Mode::Paused, Some("trip".into()));
        assert!(s.claim("MB-001", "session-1").is_err());
        s.set_mode(Mode::UntilDone, None);
        s.claim("MB-001", "session-1").unwrap();
        assert!(s.claim("MB-001", "session-2").is_err(), "already claimed");
    }

    #[test]
    fn until_done_stops_when_milestone_tasks_are_finished() {
        let (_tmp, mut s) = fixture();
        assert!(!s.stop_if_until_done_complete());
        s.set_status("MB-001", Status::Done, None).unwrap();
        assert!(!s.until_done_complete(), "MB-002 still queued");
        s.set_status("MB-002", Status::Cancelled, None).unwrap();
        // MB-003 is queued but outside milestone m1, so it does not count.
        assert!(s.stop_if_until_done_complete());
        assert_eq!(s.workspace.lifecycle.mode, Mode::Stopped);
        assert_eq!(
            s.workspace.lifecycle.reason.as_deref(),
            Some("until-done: milestone m1 complete (auto-stop)")
        );
        assert!(s.claim("MB-003", "session-1").is_err());
        assert!(!s.stop_if_until_done_complete(), "already stopped");
    }

    #[test]
    fn until_done_without_milestone_needs_every_task() {
        let (_tmp, mut s) = fixture();
        s.workspace.lifecycle.milestone = None;
        s.set_status("MB-001", Status::Done, None).unwrap();
        s.set_status("MB-002", Status::Done, None).unwrap();
        assert!(!s.until_done_complete(), "MB-003 still queued");
        s.set_status("MB-003", Status::Done, None).unwrap();
        assert!(s.stop_if_until_done_complete());
        assert_eq!(
            s.workspace.lifecycle.reason.as_deref(),
            Some("until-done: all tasks complete (auto-stop)")
        );
    }

    #[test]
    fn until_done_never_stops_on_empty_scope_or_other_modes() {
        let (_tmp, mut s) = fixture();
        s.workspace.lifecycle.milestone = Some("typo".into());
        assert!(!s.until_done_complete(), "no task in milestone typo");
        s.workspace.lifecycle.milestone = Some("m1".into());
        for id in ["MB-001", "MB-002"] {
            s.set_status(id, Status::Done, None).unwrap();
        }
        s.set_mode(Mode::AlwaysOn, None);
        assert!(
            !s.stop_if_until_done_complete(),
            "always-on never auto-stops"
        );
        s.set_mode(Mode::Paused, None);
        assert!(!s.stop_if_until_done_complete(), "paused stays paused");
        assert_eq!(s.workspace.lifecycle.mode, Mode::Paused);
    }

    #[test]
    fn save_and_reload_round_trip() {
        let (_tmp, mut s) = fixture();
        s.claim("MB-001", "session-1").unwrap();
        s.save().unwrap();
        let again = State::load(&s.dir).unwrap();
        assert_eq!(again.tasks.tasks[0].status, Status::InProgress);
        assert_eq!(
            again.tasks.tasks[0].claimed_by.as_deref(),
            Some("session-1")
        );
    }

    #[test]
    fn validate_catches_bad_references() {
        let (_tmp, mut s) = fixture();
        assert!(s.validate().is_empty());
        s.tasks.tasks[0].depends_on.push("MB-999".into());
        s.tasks.tasks[1].labels.push("needs-human:unknown".into());
        let problems = s.validate();
        assert_eq!(problems.len(), 2, "{problems:?}");
    }

    #[test]
    fn validate_detects_dependency_cycles() {
        let (_tmp, mut s) = fixture();
        assert!(s.dependency_cycles().is_empty());
        // MB-002 -> MB-001 already exists; close the loop.
        s.tasks.tasks[0].depends_on.push("MB-002".into());
        let cycles = s.dependency_cycles();
        assert_eq!(cycles.len(), 1, "{cycles:?}");
        let cycle = &cycles[0];
        assert_eq!(cycle.first(), cycle.last());
        assert_eq!(cycle.len(), 3, "{cycle:?}");
        let problems = s.validate();
        assert!(
            problems.iter().any(|p| p.starts_with("dependency cycle: ")),
            "{problems:?}"
        );
        // A cycled task is never selectable.
        assert!(s.next_task().is_none());
    }

    #[test]
    fn longer_cycle_is_found_and_self_loop_is_not_double_reported() {
        let (_tmp, mut s) = fixture();
        s.tasks.tasks[2].depends_on.push("MB-002".into()); // 3 -> 2 -> 1
        s.tasks.tasks[0].depends_on.push("MB-003".into()); // 1 -> 3
        let cycles = s.dependency_cycles();
        assert_eq!(cycles.len(), 1, "{cycles:?}");
        assert_eq!(cycles[0].len(), 4, "{cycles:?}");

        let (_tmp2, mut s2) = fixture();
        s2.tasks.tasks[0].depends_on.push("MB-001".into());
        assert!(s2.dependency_cycles().is_empty());
        assert_eq!(s2.validate(), vec!["MB-001 depends on itself".to_string()]);
    }

    #[test]
    fn diamond_is_not_a_cycle() {
        let (_tmp, mut s) = fixture();
        s.tasks.tasks[2].depends_on = vec!["MB-001".into(), "MB-002".into()];
        assert!(s.dependency_cycles().is_empty());
        assert!(s.validate().is_empty());
    }

    #[test]
    fn ledger_appends_json_lines() {
        let (_tmp, s) = fixture();
        let entry = LedgerEntry {
            ts: now(),
            task: "MB-001".into(),
            session: None,
            outcome: Outcome::PrOpened,
            summary: "opened PR".into(),
            pr: Some("https://example.invalid/pr/1".into()),
        };
        let path = s.append_ledger(&entry).unwrap();
        s.append_ledger(&entry).unwrap();
        let content = fs::read_to_string(path).unwrap();
        assert_eq!(content.lines().count(), 2);
        let parsed: LedgerEntry = serde_json::from_str(content.lines().next().unwrap()).unwrap();
        assert_eq!(parsed.outcome, Outcome::PrOpened);
    }

    #[test]
    fn repo_state_is_valid() {
        // The real state/ shipped in this repo must always load and validate.
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../state");
        let s = State::load(&dir).expect("state/ must parse");
        assert_eq!(s.validate(), Vec::<String>::new());
    }

    #[test]
    fn digest_sections_and_since_filter() {
        let (_tmp, mut s) = fixture();
        s.set_status(
            "MB-001",
            Status::InReview,
            Some("https://github.com/o/r/pull/7".into()),
        )
        .unwrap();
        s.tasks.tasks[0].labels.push("needs-human:schema".into());
        s.set_status("MB-002", Status::Blocked, None).unwrap();
        s.tasks.tasks[1].labels.push("needs-human:schema".into());
        let mk = |ts: &str, task: &str, outcome| LedgerEntry {
            ts: ts.into(),
            task: task.into(),
            session: None,
            outcome,
            summary: format!("{task} summary"),
            pr: None,
        };
        let ledger = vec![
            mk("2026-11-15T10:00:00+00:00", "OLD", Outcome::Done),
            mk("2026-11-17T10:00:00+00:00", "MB-001", Outcome::PrOpened),
            mk("2026-11-17T11:00:00+00:00", "MB-009", Outcome::RateLimited),
            mk("not a date", "BAD", Outcome::Done),
        ];
        let since = DateTime::parse_from_rfc3339("2026-11-16T12:00:00+00:00").unwrap();
        let md = s.digest(&ledger, since);
        assert!(md.contains("- **MB-001** MB-001 summary"), "{md}");
        assert!(!md.contains("OLD") && !md.contains("BAD"), "{md}");
        assert!(
            md.contains("[PR #7](https://github.com/o/r/pull/7) — `needs-human:schema`"),
            "{md}"
        );
        assert!(
            md.contains("- **MB-002** urgent but blocked — `needs-human:schema`"),
            "{md}"
        );
        assert!(md.contains("### 🔨 In progress\n- _none_"), "{md}");
        assert!(md.contains("2 ledger entries since"), "{md}");
        assert!(md.contains("rate_limited: 1"), "{md}");
    }

    #[test]
    fn read_ledger_reads_all_months_in_order() {
        let (_tmp, s) = fixture();
        let dir = s.dir.join("ledger");
        fs::create_dir_all(&dir).unwrap();
        let line = |task: &str| {
            format!(
                r#"{{"ts":"2026-11-01T00:00:00+00:00","task":"{task}","outcome":"done","summary":"x"}}"#
            )
        };
        fs::write(dir.join("2026-11.jsonl"), line("B") + "\n\n").unwrap();
        fs::write(dir.join("2026-10.jsonl"), line("A") + "\n").unwrap();
        let tasks: Vec<String> = s
            .read_ledger()
            .unwrap()
            .into_iter()
            .map(|e| e.task)
            .collect();
        assert_eq!(tasks, ["A", "B"]);
    }

    #[test]
    fn read_ledger_missing_dir_is_empty() {
        let (_tmp, s) = fixture();
        assert!(s.read_ledger().unwrap().is_empty());
    }

    #[test]
    fn read_ledger_errors_when_ledger_is_not_a_dir() {
        let (_tmp, s) = fixture();
        fs::write(s.dir.join("ledger"), "oops").unwrap();
        assert!(s.read_ledger().is_err());
    }

    #[test]
    fn pr_number_extracts_trailing_number() {
        assert_eq!(pr_number("https://github.com/o/r/pull/21"), "21");
        assert_eq!(pr_number("https://github.com/o/r/pull/21/"), "21");
        assert_eq!(pr_number("weird"), "weird");
    }
}
