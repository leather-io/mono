#!/usr/bin/env bash

detect_runner() {
  if command -v herdr >/dev/null && [ "${HERDR_ENV:-}" = 1 ]; then
    printf 'herdr\n'
  elif command -v claude >/dev/null; then
    printf 'headless\n'
  else
    printf 'none\n'
  fi
}

headless_dir() {
  printf '%s/agents\n' "$1"
}

headless_pid() {
  local file
  file="$(headless_dir "$1")/$2.pid"
  if [ -f "$file" ]; then
    cat "$file"
  fi
}

headless_alive() {
  local pid
  pid="$(headless_pid "$1" "$2")"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

headless_started() {
  [ -f "$(headless_dir "$1")/$2.pid" ]
}

headless_session_exists() {
  local out
  out="$(headless_dir "$1")/$2.out.jsonl"
  [ -f "$out" ] && grep -q -F "$3" "$out"
}

headless_start() {
  local run_dir="$1"
  local agent="$2"
  local path="$3"
  local session_id="$4"
  local prompt_file="$5"
  shift 5
  local dir cmd
  dir="$(headless_dir "$run_dir")"
  mkdir -p "$dir"
  cmd=(claude -p --output-format json --add-dir "$run_dir")
  if headless_session_exists "$run_dir" "$agent" "$session_id"; then
    cmd+=(--resume "$session_id")
  else
    cmd+=(--session-id "$session_id")
  fi
  if [ $# -gt 0 ]; then
    cmd+=("$@")
  fi
  (
    cd "$path"
    nohup "${cmd[@]}" < "$prompt_file" >> "$dir/$agent.out.jsonl" 2>> "$dir/$agent.err.log" &
    printf '%s\n' "$!" > "$dir/$agent.pid"
  )
}

entry_claude_args() {
  printf '%s' "$1" | jq -r '.claude_args[]?'
}

agent_status() {
  local run_dir="$1"
  local entry="$2"
  local runner agent
  runner="$(printf '%s' "$entry" | jq -r '.runner // "herdr"')"
  agent="$(printf '%s' "$entry" | jq -r '.agent')"
  if [ "$runner" = headless ]; then
    if headless_alive "$run_dir" "$agent"; then
      printf 'running\n'
    elif headless_started "$run_dir" "$agent"; then
      printf 'exited\n'
    else
      printf 'held\n'
    fi
    return 0
  fi
  if ! command -v herdr >/dev/null; then
    printf 'no-herdr\n'
    return 0
  fi
  herdr agent get "$agent" 2>/dev/null | jq -r '.result.agent.agent_status // "gone"' || printf 'gone\n'
}

agent_prompt() {
  local run_dir="$1"
  local entry="$2"
  local prompt_file="$3"
  local runner agent path session_id args line
  runner="$(printf '%s' "$entry" | jq -r '.runner // "herdr"')"
  agent="$(printf '%s' "$entry" | jq -r '.agent')"
  if [ "$runner" = headless ] && headless_alive "$run_dir" "$agent"; then
    printf 'agent %s is still running\n' "$agent" >&2
    return 1
  fi
  mkdir -p "$run_dir/wave"
  rm -f "$run_dir/wave/$agent.final"
  date +%s > "$run_dir/wave/$agent.since"
  if [ "$runner" = headless ]; then
    path="$(printf '%s' "$entry" | jq -r '.path')"
    session_id="$(printf '%s' "$entry" | jq -r '.session_id')"
    args=()
    while IFS= read -r line; do
      args+=("$line")
    done < <(entry_claude_args "$entry")
    if [ "${#args[@]}" -gt 0 ]; then
      headless_start "$run_dir" "$agent" "$path" "$session_id" "$prompt_file" "${args[@]}"
    else
      headless_start "$run_dir" "$agent" "$path" "$session_id" "$prompt_file"
    fi
    return 0
  fi
  command -v herdr >/dev/null || { printf 'herdr is not available to prompt %s\n' "$agent" >&2; return 1; }
  herdr agent prompt "$agent" "$(cat "$prompt_file")" >/dev/null
}

agent_prompt_command() {
  local entry="$1"
  local prompt_file="$2"
  local runner agent
  runner="$(printf '%s' "$entry" | jq -r '.runner // "herdr"')"
  agent="$(printf '%s' "$entry" | jq -r '.agent')"
  if [ "$runner" = headless ]; then
    printf '+ claude -p --resume %s ... < %s (in %s, background)\n' \
      "$(printf '%s' "$entry" | jq -r '.session_id')" "$prompt_file" "$(printf '%s' "$entry" | jq -r '.path')"
  else
    printf '+ herdr agent prompt %s "$(cat %s)"\n' "$agent" "$prompt_file"
  fi
}
