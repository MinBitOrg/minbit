use anyhow::{bail, Context, Result};
use chrono::{DateTime, Duration, Local};
use clap::{Parser, Subcommand, ValueEnum};
use minbit::{find_state_dir, now, LedgerEntry, Mode, Outcome, State, Status};
use std::path::PathBuf;

/// MinBit Workspace CLI — read and change the workspace's world model.
#[derive(Parser)]
#[command(name = "minbit", version, about)]
struct Cli {
    /// Path to the state directory (default: search upwards for state/workspace.yaml)
    #[arg(long, global = true, env = "MINBIT_STATE")]
    state: Option<PathBuf>,
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Show lifecycle mode, budget and task counts
    Status,
    /// Print the next task an agent should pick up (exit code 3 if none)
    Next {
        #[arg(long)]
        json: bool,
    },
    /// Claim a queued task for a session
    Claim {
        task: String,
        #[arg(long)]
        session: String,
    },
    /// Set a task's status
    SetStatus {
        task: String,
        status: StatusArg,
        #[arg(long)]
        pr: Option<String>,
    },
    /// Resume work: mode always-on or until-done
    Start {
        #[arg(long, value_enum, default_value_t = StartMode::UntilDone)]
        mode: StartMode,
        #[arg(long)]
        reason: Option<String>,
    },
    /// Pause: no new work is claimed; state is kept
    Pause {
        #[arg(long)]
        reason: Option<String>,
    },
    /// Resume after a pause (back to until-done)
    Resume {
        #[arg(long)]
        reason: Option<String>,
    },
    /// Stop: like pause, but signals that the heartbeat should be disabled
    Stop {
        #[arg(long)]
        reason: Option<String>,
    },
    /// Append a run-ledger entry
    Ledger {
        #[arg(long)]
        task: String,
        #[arg(long, value_enum)]
        outcome: OutcomeArg,
        #[arg(long)]
        summary: String,
        #[arg(long)]
        session: Option<String>,
        #[arg(long)]
        pr: Option<String>,
    },
    /// Render the daily digest (Markdown) from tasks + ledger
    Digest {
        /// Only ledger entries at or after this RFC 3339 time (default: 24 hours ago)
        #[arg(long)]
        since: Option<String>,
    },
    /// Check the state files for structural problems (exit code 1 if any)
    Validate,
}

#[derive(Clone, Copy, ValueEnum)]
enum StartMode {
    AlwaysOn,
    UntilDone,
}

#[derive(Clone, Copy, ValueEnum)]
enum StatusArg {
    Queued,
    InProgress,
    InReview,
    Done,
    Blocked,
    Cancelled,
}

impl From<StatusArg> for Status {
    fn from(s: StatusArg) -> Self {
        match s {
            StatusArg::Queued => Status::Queued,
            StatusArg::InProgress => Status::InProgress,
            StatusArg::InReview => Status::InReview,
            StatusArg::Done => Status::Done,
            StatusArg::Blocked => Status::Blocked,
            StatusArg::Cancelled => Status::Cancelled,
        }
    }
}

#[derive(Clone, Copy, ValueEnum)]
enum OutcomeArg {
    PrOpened,
    Done,
    Failed,
    Blocked,
    Skipped,
    RateLimited,
}

impl From<OutcomeArg> for Outcome {
    fn from(o: OutcomeArg) -> Self {
        match o {
            OutcomeArg::PrOpened => Outcome::PrOpened,
            OutcomeArg::Done => Outcome::Done,
            OutcomeArg::Failed => Outcome::Failed,
            OutcomeArg::Blocked => Outcome::Blocked,
            OutcomeArg::Skipped => Outcome::Skipped,
            OutcomeArg::RateLimited => Outcome::RateLimited,
        }
    }
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let dir = match cli.state {
        Some(d) => d,
        None => find_state_dir(&std::env::current_dir()?)?,
    };
    let mut state = State::load(&dir)?;

    match cli.cmd {
        Cmd::Status => {
            let w = &state.workspace;
            println!("workspace : {}", w.name);
            println!(
                "mode      : {:?}{}",
                w.lifecycle.mode,
                w.lifecycle
                    .milestone
                    .as_ref()
                    .map(|m| format!(" (milestone {m})"))
                    .unwrap_or_default()
            );
            if let Some(r) = &w.lifecycle.reason {
                println!("reason    : {r}");
            }
            println!(
                "budget    : {} · heartbeat every {}h · max {} runs/day",
                w.budget.plan, w.budget.heartbeat_interval_hours, w.budget.max_runs_per_day
            );
            let counts: Vec<String> = state
                .summary()
                .iter()
                .map(|(s, n)| format!("{s:?}={n}"))
                .collect();
            println!("tasks     : {}", counts.join(" "));
            if !w.lifecycle.mode.accepts_work() {
                println!("⚠ not accepting work");
            }
        }
        Cmd::Next { json } => {
            if !state.workspace.lifecycle.mode.accepts_work() {
                eprintln!(
                    "workspace is {:?}; no work to pick up",
                    state.workspace.lifecycle.mode
                );
                std::process::exit(3);
            }
            match state.next_task() {
                Some(t) if json => println!("{}", serde_json::to_string_pretty(t)?),
                Some(t) => println!("{} [{}] p{} — {}", t.id, t.role, t.priority, t.title),
                None => {
                    eprintln!("no ready task in the active milestone");
                    std::process::exit(3);
                }
            }
        }
        Cmd::Claim { task, session } => {
            state.claim(&task, &session)?;
            state.save()?;
            println!("claimed {task}");
        }
        Cmd::SetStatus { task, status, pr } => {
            state.set_status(&task, status.into(), pr)?;
            state.save()?;
            println!("{task} updated");
        }
        Cmd::Start { mode, reason } => {
            let m = match mode {
                StartMode::AlwaysOn => Mode::AlwaysOn,
                StartMode::UntilDone => Mode::UntilDone,
            };
            state.set_mode(m, reason);
            state.save()?;
            println!("mode = {m:?}");
        }
        Cmd::Pause { reason } => {
            state.set_mode(Mode::Paused, reason);
            state.save()?;
            println!("paused");
        }
        Cmd::Resume { reason } => {
            if state.workspace.lifecycle.mode == Mode::Stopped {
                bail!("workspace is stopped; use `minbit start` explicitly");
            }
            state.set_mode(Mode::UntilDone, reason);
            state.save()?;
            println!("resumed (until-done)");
        }
        Cmd::Stop { reason } => {
            state.set_mode(Mode::Stopped, reason);
            state.save()?;
            println!("stopped — also disable the heartbeat scheduled task");
        }
        Cmd::Ledger {
            task,
            outcome,
            summary,
            session,
            pr,
        } => {
            if summary.chars().count() > 280 {
                bail!("summary longer than 280 characters");
            }
            let path = state.append_ledger(&LedgerEntry {
                ts: now(),
                task,
                session,
                outcome: outcome.into(),
                summary,
                pr,
            })?;
            println!("ledger += {}", path.display());
        }
        Cmd::Digest { since } => {
            let since = match since {
                Some(s) => DateTime::parse_from_rfc3339(&s)
                    .with_context(|| format!("--since {s:?} is not RFC 3339"))?,
                None => (Local::now() - Duration::hours(24)).fixed_offset(),
            };
            let ledger = state.read_ledger()?;
            print!("{}", state.digest(&ledger, since));
        }
        Cmd::Validate => {
            let problems = state.validate();
            if problems.is_empty() {
                println!("state OK ({} tasks)", state.tasks.tasks.len());
            } else {
                for p in &problems {
                    eprintln!("✗ {p}");
                }
                std::process::exit(1);
            }
        }
    }
    Ok(())
}
