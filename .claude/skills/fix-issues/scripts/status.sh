#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$script_dir/lib/status-file.sh"
. "$script_dir/lib/agent.sh"

usage() {
  cat <<'EOF'
Usage: status.sh --run-dir <dir> [--finish] [--dry-run]

Prints one row per entry in <run-dir>/run.json: issues, branch, workspace, agent, the live agent
status (herdr's agent status, or running/exited/held for a headless fixer), the status-file state
(stalled when run-wave.sh gave up on it), the staged file count and the COMMIT subject.

  --finish   after the table, per worktree in done or staged state: the PR URL when push-as-bot.sh
             already opened one; otherwise the push-as-bot.sh command when a bot is configured
             (${XDG_CONFIG_HOME:-$HOME/.config}/fix-issues/bot.env); otherwise the commit, push and
             gh pr create commands for the person, with the PR body written to
             <run-dir>/pr/<branch>.md and a check that git can push over HTTPS with gh
  --dry-run  print the agent-status and git commands the table would run; run none

Exits 1 when any entry is blocked or stalled, 0 otherwise.
EOF
}

run_dir=""
finish=0
dry_run=0
repo="leather-io/mono"
repo_url="https://github.com/leather-io/mono.git"
bot_config="${XDG_CONFIG_HOME:-$HOME/.config}/fix-issues/bot.env"

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --finish) finish=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'error: unknown argument %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

[ -n "$run_dir" ] || die "--run-dir is required"
command -v jq >/dev/null || die "jq is required"
run_json="$run_dir/run.json"
[ -f "$run_json" ] || die "run.json not found in $run_dir"

show() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
}

squote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

field() {
  jq -r --argjson i "$1" --arg f "$2" '.[$i][$f] // empty | if type == "array" then map(tostring) | join(",") else tostring end' "$run_json"
}

live_status() {
  if [ "$dry_run" = 1 ]; then
    show agent-status "$(field "$1" agent)" >&2
    printf '?\n'
    return 0
  fi
  agent_status "$run_dir" "$(jq -c --argjson i "$1" '.[$i]' "$run_json")"
}

staged_count() {
  if [ "$dry_run" = 1 ]; then
    show git -C "$1" diff --cached --name-only >&2
    printf '?\n'
    return 0
  fi
  git -C "$1" diff --cached --name-only 2>/dev/null | wc -l | tr -d '[:space:]'
}

entry_state() {
  local agent="$1"
  local status_file="$2"
  local final="$run_dir/wave/$agent.final"
  local state
  if [ -f "$final" ] && [ "$(cat "$final")" = stalled ]; then
    printf 'stalled\n'
    return 0
  fi
  state="$(status_state "$status_file")"
  printf '%s\n' "${state:-missing}"
}

print_person_commands() {
  local i="$1"
  local path="$2"
  local branch="$3"
  local subject="$4"
  local status_file="$5"
  local body_file="$run_dir/pr/$branch.md"
  printf 'git -C %s push %s HEAD:refs/heads/%s\n' "$(squote "$path")" "$repo_url" "$branch"
  if [ "$dry_run" = 1 ]; then
    show write-pr-body "$status_file" ">" "$body_file"
  else
    write_pr_body "$body_file" "$status_file" "$(field "$i" issues)"
  fi
  printf 'gh pr create --repo %s --base dev --head %s --title %s --body-file %s\n' \
    "$repo" "$branch" "$(squote "$subject")" "$(squote "$body_file")"
}

count="$(jq 'length' "$run_json")"
format='%-9s %-40s %-9s %-12s %-9s %-9s %-6s %s\n'
printf "$format" ISSUES BRANCH WORKSPACE AGENT LIVE STATE STAGED COMMIT
failed=0
done_rows=""
i=0
while [ "$i" -lt "$count" ]; do
  agent="$(field "$i" agent)"
  status_file="$(field "$i" status_file)"
  path="$(field "$i" path)"
  state="$(entry_state "$agent" "$status_file")"
  subject="$(status_subject "$status_file")"
  printf "$format" "$(field "$i" issues)" "$(field "$i" branch)" "$(field "$i" workspace_id)" \
    "$agent" "$(live_status "$i")" "$state" "$(staged_count "$path")" "${subject:--}"
  case "$state" in
    blocked|stalled) failed=1 ;;
    done|staged) done_rows="$done_rows $i" ;;
  esac
  i=$((i + 1))
done

if [ "$finish" = 1 ]; then
  bot=0
  if [ -f "$bot_config" ]; then
    bot=1
    printf '\nbot: %s found; commits and pushes go through push-as-bot.sh\n' "$bot_config"
  elif git config --get-regexp '^credential\..*helper$' 2>/dev/null | grep -q 'gh auth'; then
    printf '\nno bot configured; credential helper: gh is set up for HTTPS pushes\n'
  else
    printf '\nno bot configured; credential helper: gh is not set up; run once before pushing:\n  gh auth setup-git\n'
  fi
  for i in $done_rows; do
    agent="$(field "$i" agent)"
    status_file="$(field "$i" status_file)"
    path="$(field "$i" path)"
    branch="$(field "$i" branch)"
    pr_url="$(field "$i" pr_url)"
    state="$(entry_state "$agent" "$status_file")"
    subject="$(status_subject "$status_file")"
    printf '\n# %s (#%s), %s\n' "$branch" "$(field "$i" issues | sed 's/,/, #/g')" "$state"
    staged="$(staged_count "$path" 2>/dev/null)"
    if [ -n "$pr_url" ] && [ "$staged" = 0 ]; then
      printf 'PR: %s (pushed %s, %s)\n' "$pr_url" "$(field "$i" pushed_at)" "$(field "$i" commit_sha | cut -c1-9)"
      continue
    fi
    if [ "$dry_run" = 0 ] && [ "$staged" -eq 0 ]; then
      printf 'not ready: nothing staged in %s\n' "$path"
      continue
    fi
    if [ -n "$pr_url" ]; then
      printf 'PR: %s (new changes staged since the last push)\n' "$pr_url"
    fi
    if [ "$state" = done ] && ! gate="$("$script_dir/review-round.sh" check --run-dir "$run_dir" --branch "$branch")"; then
      printf 'not ready: %s\n' "$gate"
      continue
    fi
    if [ "$bot" = 1 ]; then
      if [ "$state" = staged ]; then
        printf '%s/push-as-bot.sh --run-dir %s --branch %s --commit-only\n' "$script_dir" "$(squote "$run_dir")" "$branch"
        printf '%s/prompt-agent.sh --run-dir %s --branch %s --text %s\n' "$script_dir" "$(squote "$run_dir")" "$branch" "$(squote "The commit is done. Continue with the next issue in your brief.")"
      else
        printf '%s/push-as-bot.sh --run-dir %s --branch %s\n' "$script_dir" "$(squote "$run_dir")" "$branch"
      fi
      continue
    fi
    printf 'git -C %s commit -m %s\n' "$(squote "$path")" "$(squote "$subject")"
    if [ "$state" = staged ]; then
      printf '%s/prompt-agent.sh --run-dir %s --branch %s --text %s\n' "$script_dir" "$(squote "$run_dir")" "$branch" "$(squote "The commit is done. Continue with the next issue in your brief.")"
      continue
    fi
    print_person_commands "$i" "$path" "$branch" "$subject" "$status_file"
  done
fi

exit "$failed"
