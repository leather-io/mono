#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$script_dir/lib/agent.sh"

usage() {
  cat <<'EOF'
Usage: run-wave.sh --run-dir <dir> [--parallel 5] [--timeout-min 90] [--retries 2] [--dry-run]

Runs the fixers listed in <run-dir>/run.json in waves. Keeps at most --parallel agents working,
prompts held agents (bootstrap-worktree.sh --hold) as slots free, waits on each working agent in
turn (herdr agents with `herdr agent wait`, headless fixers by polling their claude -p process), and when one goes idle checks on disk that its status file says done or staged and that its
worktree has a staged diff. An agent that stopped short gets Escape and a re-prompt, up to
--retries times, then is marked stalled. An agent still working after --timeout-min minutes since
its last prompt is marked stalled. Exits 0 when every agent is done, staged, blocked or stalled.

One line per event on stdout. Run it detached:

  nohup run-wave.sh --run-dir <dir> >> <dir>/run.log 2>&1 &

  --parallel     agents working at once (default 5, maximum 5)
  --timeout-min  minutes an agent may work after its last prompt (default 90)
  --retries      re-prompts for an agent that stopped short (default 2)
  --dry-run      print each agent's state and the commands one pass would run; run none
EOF
}

run_dir=""
parallel=5
max_parallel=5
timeout_min=90
retries=2
dry_run=0
slice_ms=60000
escape_settle_seconds=2

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --parallel) parallel="$2"; shift 2 ;;
    --timeout-min) timeout_min="$2"; shift 2 ;;
    --retries) retries="$2"; shift 2 ;;
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
if jq -e 'any(.[]; (.runner // "herdr") == "herdr")' "$run_json" >/dev/null; then
  command -v herdr >/dev/null || die "run.json has herdr entries but herdr is not on the path"
fi
if jq -e 'any(.[]; .runner == "headless")' "$run_json" >/dev/null; then
  command -v claude >/dev/null || die "run.json has headless entries but claude is not on the path"
fi
headless_poll_seconds=30
if [ "$parallel" -gt "$max_parallel" ]; then
  parallel="$max_parallel"
fi
wave_dir="$run_dir/wave"
timeout_seconds=$((timeout_min * 60))

log() {
  printf '%s %s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S')" "$1" "$2"
}

show() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
}

entry_json() {
  jq -c --argjson i "$1" '.[$i]' "$run_json"
}

runner_of() {
  jq -r --argjson i "$1" '.[$i].runner // "herdr"' "$run_json"
}

field() {
  jq -r --argjson i "$1" --arg f "$2" '.[$i][$f] | if type == "array" then map(tostring) | join(",") else tostring end' "$run_json"
}

status_state() {
  local file="$1"
  if [ -f "$file" ]; then
    head -n 1 "$file" | sed -n 's/^STATE:[[:space:]]*//p' | tr -d '[:space:]'
  fi
}

staged_count() {
  git -C "$1" diff --cached --name-only 2>/dev/null | wc -l | tr -d '[:space:]'
}

marker() {
  local file="$wave_dir/$1.final"
  if [ -f "$file" ]; then
    cat "$file"
  fi
}

set_marker() {
  printf '%s\n' "$2" > "$wave_dir/$1.final"
}

retry_count() {
  local file="$wave_dir/$1.retries"
  if [ -f "$file" ]; then
    cat "$file"
  else
    printf '0\n'
  fi
}

mark_prompted_now() {
  date +%s > "$wave_dir/$1.since"
}

since() {
  local file="$wave_dir/$1.since"
  if [ ! -f "$file" ]; then
    mark_prompted_now "$1"
  fi
  cat "$file"
}

agent_state() {
  local i="$1"
  local name status_file final current prompted
  name="$(field "$i" agent)"
  status_file="$(field "$i" status_file)"
  final="$(marker "$name")"
  current="$(status_state "$status_file")"
  if [ "$current" = blocked ]; then
    printf 'blocked\n'
    return 0
  fi
  case "$final" in
    stalled|blocked) printf '%s\n' "$final"; return 0 ;;
    done|staged)
      if [ "$current" = "$final" ]; then
        printf '%s\n' "$final"
        return 0
      fi
      ;;
  esac
  prompted="$(field "$i" prompted)"
  if [ "$prompted" = "false" ]; then
    printf 'queued\n'
  else
    printf 'working\n'
  fi
}

herdr_wait() {
  herdr agent wait "$1" --until idle --until done --timeout "$slice_ms" 2>&1 >/dev/null
}

herdr_status() {
  herdr agent get "$1" 2>/dev/null | jq -r '.result.agent.agent_status // "gone"' || printf 'gone\n'
}

herdr_escape() {
  herdr agent send-keys "$1" Escape >/dev/null 2>&1 || true
}

herdr_prompt() {
  herdr agent prompt "$1" "$2" >/dev/null
}

set_prompted() {
  jq --argjson i "$1" '.[$i].prompted = true' "$run_json" > "$run_json.tmp"
  mv "$run_json.tmp" "$run_json"
}

prompt_queued() {
  local i="$1"
  local name prompt_file
  name="$(field "$i" agent)"
  prompt_file="$(field "$i" prompt_file)"
  if [ "$dry_run" = 1 ]; then
    agent_prompt_command "$(entry_json "$i")" "$prompt_file"
    return 0
  fi
  if agent_prompt "$run_dir" "$(entry_json "$i")" "$prompt_file"; then
    set_prompted "$i"
    mark_prompted_now "$name"
    log "$name" "prompted from queue"
  else
    log "$name" "queue prompt failed; will retry next pass"
  fi
}

reprompt() {
  local i="$1"
  local reason="$2"
  local name status_file retry_file tries
  name="$(field "$i" agent)"
  status_file="$(field "$i" status_file)"
  retry_file="$run_dir/prompts/$(field "$i" branch).retry.md"
  tries="$(retry_count "$name")"
  if [ "$tries" -ge "$retries" ]; then
    set_marker "$name" stalled
    log "$name" "stalled: $reason after $tries re-prompts"
    return 0
  fi
  if [ "$(runner_of "$i")" = herdr ]; then
    herdr_escape "$name"
    sleep "$escape_settle_seconds"
  fi
  mkdir -p "$(dirname "$retry_file")"
  printf 'Finish the task in your brief, or write STATE: blocked and the reason to %s.\n' "$status_file" > "$retry_file"
  if agent_prompt "$run_dir" "$(entry_json "$i")" "$retry_file"; then
    printf '%s\n' "$((tries + 1))" > "$wave_dir/$name.retries"
    mark_prompted_now "$name"
    log "$name" "re-prompted ($((tries + 1))/$retries): $reason"
  else
    log "$name" "re-prompt failed: $reason"
  fi
}

check_on_disk() {
  local i="$1"
  local name status_file path current count
  name="$(field "$i" agent)"
  status_file="$(field "$i" status_file)"
  path="$(field "$i" path)"
  current="$(status_state "$status_file")"
  count="$(staged_count "$path")"
  case "$current" in
    done|staged)
      if [ "$count" -gt 0 ]; then
        set_marker "$name" "$current"
        log "$name" "$current: $count staged files"
      else
        reprompt "$i" "status $current but nothing staged"
      fi
      ;;
    blocked)
      set_marker "$name" blocked
      log "$name" "blocked: $(sed -n '2,3p' "$status_file" | tr '\n' ' ')"
      ;;
    *)
      reprompt "$i" "stopped with status ${current:-missing}"
      ;;
  esac
}

wait_one() {
  local i="$1"
  local name status_file err code now started live
  name="$(field "$i" agent)"
  status_file="$(field "$i" status_file)"
  if [ "$dry_run" = 1 ]; then
    if [ "$(runner_of "$i")" = headless ]; then
      show kill -0 "<pid of $name>"
    else
      show herdr agent wait "$name" --until idle --until done --timeout "$slice_ms"
    fi
    show git -C "$(field "$i" path)" diff --cached --name-only
    return 0
  fi
  if [ "$(runner_of "$i")" = headless ]; then
    if headless_alive "$run_dir" "$name"; then
      headless_waiting=1
      now="$(date +%s)"
      started="$(since "$name")"
      if [ $((now - started)) -ge "$timeout_seconds" ]; then
        set_marker "$name" stalled
        log "$name" "stalled: still running after ${timeout_min} min (pid $(headless_pid "$run_dir" "$name"))"
      fi
    else
      check_on_disk "$i"
    fi
    return 0
  fi
  if err="$(herdr_wait "$name")"; then
    check_on_disk "$i"
    return 0
  fi
  code="$(printf '%s' "$err" | jq -r '.error.code // empty' 2>/dev/null || true)"
  live="$(herdr_status "$name")"
  case "$live" in
    gone)
      set_marker "$name" stalled
      log "$name" "stalled: agent is gone (${code:-no code})"
      return 0
      ;;
    blocked)
      log "$name" "dialog open"
      check_on_disk "$i"
      return 0
      ;;
    idle|done)
      check_on_disk "$i"
      return 0
      ;;
  esac
  now="$(date +%s)"
  started="$(since "$name")"
  if [ $((now - started)) -ge "$timeout_seconds" ]; then
    set_marker "$name" stalled
    log "$name" "stalled: still $live after ${timeout_min} min"
  fi
}

count="$(jq 'length' "$run_json")"
[ "$count" -gt 0 ] || die "run.json has no entries"

if [ "$dry_run" = 1 ]; then
  i=0
  working=0
  while [ "$i" -lt "$count" ]; do
    name="$(field "$i" agent)"
    state="$(agent_state "$i")"
    printf '%s %s %s\n' "$name" "$(field "$i" branch)" "$state"
    if [ "$state" = working ]; then
      working=$((working + 1))
    fi
    i=$((i + 1))
  done
  i=0
  while [ "$i" -lt "$count" ]; do
    state="$(agent_state "$i")"
    if [ "$state" = queued ] && [ "$working" -lt "$parallel" ]; then
      prompt_queued "$i"
      working=$((working + 1))
    elif [ "$state" = working ]; then
      wait_one "$i"
    fi
    i=$((i + 1))
  done
  exit 0
fi

mkdir -p "$wave_dir"
printf '%s\n' "$$" > "$run_dir/run-wave.pid"
log run-wave "start: $count agents, parallel $parallel, timeout ${timeout_min} min, retries $retries"

while :; do
  working=0
  pending=0
  i=0
  while [ "$i" -lt "$count" ]; do
    case "$(agent_state "$i")" in
      working) working=$((working + 1)); pending=$((pending + 1)) ;;
      queued) pending=$((pending + 1)) ;;
    esac
    i=$((i + 1))
  done
  if [ "$pending" -eq 0 ]; then
    break
  fi
  i=0
  while [ "$i" -lt "$count" ] && [ "$working" -lt "$parallel" ]; do
    if [ "$(agent_state "$i")" = queued ]; then
      prompt_queued "$i"
      working=$((working + 1))
    fi
    i=$((i + 1))
  done
  i=0
  headless_waiting=0
  herdr_waited=0
  while [ "$i" -lt "$count" ]; do
    if [ "$(agent_state "$i")" = working ]; then
      if [ "$(runner_of "$i")" = herdr ]; then
        herdr_waited=1
      fi
      wait_one "$i"
    fi
    i=$((i + 1))
  done
  if [ "$headless_waiting" = 1 ] && [ "$herdr_waited" = 0 ]; then
    sleep "$headless_poll_seconds"
  fi
done

i=0
while [ "$i" -lt "$count" ]; do
  log "$(field "$i" agent)" "final: $(agent_state "$i")"
  i=$((i + 1))
done
log run-wave "exit"
rm -f "$run_dir/run-wave.pid"
