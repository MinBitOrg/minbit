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

    pub fn save(&self) -> Result<()> {
        fs::write(
            self.dir.join("workspace.yaml"),
            serde_yaml::to_string(&self.workspace)?,
        )?;
        fs::write(
            self.dir.join("tasks.yaml"),
            serde_yaml::to_string(&self.tasks)?,
        )?;
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
        problems
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
}
