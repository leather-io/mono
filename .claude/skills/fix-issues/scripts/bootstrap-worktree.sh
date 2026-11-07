#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_dir="$(dirname "$script_dir")"
template_file="$skill_dir/references/fixer-prompt.md"
poll_seconds=10
build_timeout_seconds=3600

usage() {
  cat <<'EOF'
Usage: bootstrap-worktree.sh --run-dir <dir> --branch <branch> --brief <file> --issues <n[,n]>
                             [--base origin/dev] [--label <text>] [--agent <name>] [--model <model>]
                             [--skip-build] [--hold] [--dry-run] [-- <claude args>]

Creates (or reuses) a herdr worktree for <branch>, runs `pnpm i && pnpm build` in its pane, copies
the gitignored .env files from the main checkout, fills the fixer prompt from the brief, starts a
Claude agent in the pane, prompts it and appends the entry to <run-dir>/run.json.

  --run-dir     run directory created by the fix-issues skill (holds run.json, status/, prompts/)
  --branch      branch to create, e.g. fix/123-fee-row-shows-zero
  --brief       the brief file for this worktree
  --issues      comma-separated issue numbers handled in this worktree
  --base        base ref for a new branch (default origin/dev)
  --label       herdr workspace label (default: the branch)
  --agent       herdr agent name (default: fix-<first issue>)
  --model       Claude model, passed to claude as --model
  --skip-build  skip `pnpm i && pnpm build`
  --hold        start the agent but do not prompt it; run-wave.sh prompts it when a slot frees up
  --dry-run     print every herdr, git and file-writing command; run none (read-only git lookups run)
  -- <args>     extra arguments passed to claude, e.g. -- --permission-mode auto

Every step is idempotent: re-run the same command after a failure.
EOF
}

run_dir=""
branch=""
brief=""
issues=""
base="origin/dev"
label=""
agent=""
model=""
skip_build=0
hold=0
dry_run=0
claude_args=()

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --branch) branch="$2"; shift 2 ;;
    --brief) brief="$2"; shift 2 ;;
    --issues) issues="$2"; shift 2 ;;
    --base) base="$2"; shift 2 ;;
    --label) label="$2"; shift 2 ;;
    --agent) agent="$2"; shift 2 ;;
    --model) model="$2"; shift 2 ;;
    --skip-build) skip_build=1; shift ;;
    --hold) hold=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help) usage; exit 0 ;;
    --) shift; claude_args=("$@"); break ;;
    *) printf 'error: unknown argument %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

say() {
  printf '%s\n' "$*"
}

show() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
}

act() {
  if [ "$dry_run" = 1 ]; then
    show "$@"
  else
    "$@"
  fi
}

[ -n "$run_dir" ] || die "--run-dir is required"
[ -n "$branch" ] || die "--branch is required"
[ -n "$brief" ] || die "--brief is required"
[ -n "$issues" ] || die "--issues is required"
command -v jq >/dev/null || die "jq is required"
command -v herdr >/dev/null || die "herdr is required"
[ -f "$brief" ] || die "brief not found: $brief"
[ -f "$template_file" ] || die "fixer prompt template not found: $template_file"
[ -d "$run_dir" ] || die "run directory not found: $run_dir"

first_issue="${issues%%,*}"
[ -n "$label" ] || label="$branch"
[ -n "$agent" ] || agent="fix-$first_issue"
run_json="$run_dir/run.json"
status_file="$run_dir/status/$branch.md"
prompt_file="$run_dir/prompts/$branch.md"
built_marker="$run_dir/bootstrap/$branch.built"

herdr_worktree_create() {
  herdr worktree create --cwd "$main_checkout" --branch "$branch" --base "$base" --label "$label" --no-focus
}

herdr_worktree_list() {
  herdr worktree list --cwd "$main_checkout"
}

herdr_worktree_open() {
  herdr worktree open --cwd "$main_checkout" --path "$1" --label "$label" --no-focus
}

herdr_first_pane() {
  herdr pane list --workspace "$1" | jq -r '.result.panes[0].pane_id // empty'
}

herdr_pane_idle() {
  herdr pane process-info --pane "$1" |
    jq -e '.result.process_info | (.foreground_processes | length) == 1 and .foreground_processes[0].pid == .shell_pid' >/dev/null
}

herdr_pane_tail() {
  herdr pane read "$1" --source recent-unwrapped --lines "$2"
}

herdr_pane_split() {
  herdr pane split "$1" --direction right --cwd "$checkout_path" --no-focus | jq -r '.result.pane.pane_id'
}

herdr_agent_on_pane() {
  herdr agent list | jq -c --arg p "$1" '[.result.agents[] | select(.pane_id == $p)] | .[0] // empty'
}

herdr_agent_by_name() {
  herdr agent list | jq -c --arg n "$1" '[.result.agents[] | select(.name == $n)] | .[0] // empty'
}

herdr_agent_start() {
  local args=(--add-dir "$run_dir")
  if [ -n "$model" ]; then
    args+=(--model "$model")
  fi
  if [ "${#claude_args[@]}" -gt 0 ]; then
    args+=("${claude_args[@]}")
  fi
  if [ "$dry_run" = 1 ]; then
    show herdr agent start "$agent" --kind claude --pane "$1" -- "${args[@]}"
    return 0
  fi
  herdr agent start "$agent" --kind claude --pane "$1" -- "${args[@]}" 2>&1 >/dev/null
}

herdr_agent_prompt() {
  if [ "$dry_run" = 1 ]; then
    show herdr agent prompt "$agent" "\$(cat $prompt_file)"
    return 0
  fi
  herdr agent prompt "$agent" "$(cat "$prompt_file")" >/dev/null
}

find_main_checkout() {
  local common
  common="$(git rev-parse --path-format=absolute --git-common-dir)"
  dirname "$common"
}

existing_worktree_path() {
  git -C "$main_checkout" worktree list --porcelain |
    awk -v ref="refs/heads/$branch" '
      /^worktree / { path = substr($0, 10) }
      $0 == "branch " ref { print path; exit }
    '
}

fill_prompt() {
  local out="$1"
  local base_sha="$2"
  local in_block=0
  local line
  shopt -u patsub_replacement 2>/dev/null || true
  : > "$out"
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      '````'*)
        if [ "$in_block" = 0 ]; then
          in_block=1
          continue
        fi
        break
        ;;
    esac
    [ "$in_block" = 1 ] || continue
    if [ "$line" = "{{brief}}" ]; then
      cat "$brief" >> "$out"
      continue
    fi
    line="${line//"{{worktree}}"/$checkout_path}"
    line="${line//"{{branch}}"/$branch}"
    line="${line//"{{base_sha}}"/$base_sha}"
    line="${line//"{{status_file}}"/$status_file}"
    printf '%s\n' "$line" >> "$out"
  done < "$template_file"
}

build_succeeded() {
  awk '
    /Tasks:/ && /successful/ {
      ok = 0
      for (i = 1; i <= NF; i++) {
        if ($i ~ /^successful,?$/) s = $(i - 1)
        if ($i ~ /^total/) t = $(i - 1)
      }
      if (s != "" && s == t) ok = 1
      found = 1
    }
    /Failed:/ { failed = 1 }
    END { exit (found && ok && !failed) ? 0 : 1 }
  '
}

record_entry() {
  local prompted="$1"
  local entry
  entry="$(jq -n \
    --arg issues "$issues" \
    --arg branch "$branch" \
    --arg workspace_id "$workspace_id" \
    --arg pane_id "$pane_id" \
    --arg path "$checkout_path" \
    --arg agent "$agent" \
    --arg brief "$brief" \
    --arg status_file "$status_file" \
    --arg prompt_file "$prompt_file" \
    --arg base_sha "$base_sha" \
    --argjson prompted "$prompted" \
    --arg started_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{issues: ($issues | split(",") | map(tonumber)), branch: $branch, workspace_id: $workspace_id,
      pane_id: $pane_id, path: $path, agent: $agent, brief: $brief, status_file: $status_file,
      prompt_file: $prompt_file, base_sha: $base_sha, prompted: $prompted, started_at: $started_at}')"
  if [ "$dry_run" = 1 ]; then
    show jq --argjson entry "$entry" '[.[] | select(.branch != $entry.branch)] + [$entry]' "$run_json"
    return 0
  fi
  [ -f "$run_json" ] || printf '[]\n' > "$run_json"
  jq --argjson entry "$entry" '[.[] | select(.branch != $entry.branch)] + [$entry]' "$run_json" > "$run_json.tmp"
  mv "$run_json.tmp" "$run_json"
}

main_checkout="$(find_main_checkout)"
base_sha="$(git -C "$main_checkout" rev-parse "$base")"
say "main checkout: $main_checkout"
say "base: $base @ $base_sha"

workspace_id=""
pane_id=""
checkout_path="$(existing_worktree_path)"

if [ -n "$checkout_path" ]; then
  say "reusing worktree: $checkout_path"
  if [ "$dry_run" = 1 ]; then
    show herdr worktree list --cwd "$main_checkout"
    workspace_id="<workspace_id>"
  else
    workspace_id="$(herdr_worktree_list | jq -r --arg p "$checkout_path" '.result.worktrees[] | select(.path == $p) | .open_workspace_id // empty')"
    if [ -z "$workspace_id" ]; then
      workspace_id="$(herdr_worktree_open "$checkout_path" | jq -r '.result.workspace.workspace_id // .result.workspace_id // empty')"
    fi
  fi
  [ -n "$workspace_id" ] || die "no herdr workspace for $checkout_path"
  if [ "$dry_run" = 1 ]; then
    show herdr pane list --workspace "$workspace_id"
    pane_id="<pane_id>"
  else
    pane_id="$(herdr_first_pane "$workspace_id")"
  fi
else
  if [ "$dry_run" = 1 ]; then
    show herdr worktree create --cwd "$main_checkout" --branch "$branch" --base "$base" --label "$label" --no-focus
    workspace_id="<workspace_id>"
    pane_id="<pane_id>"
    checkout_path="<checkout_path>"
  else
    created="$(herdr_worktree_create)"
    workspace_id="$(printf '%s' "$created" | jq -r '.result.workspace.workspace_id // .result.workspace_id // empty')"
    pane_id="$(printf '%s' "$created" | jq -r '.result.root_pane.pane_id // empty')"
    checkout_path="$(printf '%s' "$created" | jq -r '.result.checkout_path // .result.worktree.path // empty')"
  fi
fi
[ -n "$workspace_id" ] || die "could not read workspace_id"
[ -n "$pane_id" ] || die "could not read pane_id"
[ -n "$checkout_path" ] || die "could not read checkout_path"
say "workspace: $workspace_id  pane: $pane_id  path: $checkout_path"

if [ "$skip_build" = 1 ]; then
  say "build: skipped"
elif [ -f "$built_marker" ]; then
  say "build: already done ($built_marker)"
elif [ "$dry_run" = 1 ]; then
  show herdr pane run "$pane_id" "pnpm i && pnpm build"
  show herdr pane process-info --pane "$pane_id"
  show herdr pane read "$pane_id" --source recent-unwrapped --lines 200
  show touch "$built_marker"
else
  herdr pane run "$pane_id" "pnpm i && pnpm build" >/dev/null
  say "build: started in $pane_id"
  waited=0
  idle_polls=0
  while [ "$idle_polls" -lt 2 ]; do
    sleep "$poll_seconds"
    waited=$((waited + poll_seconds))
    if herdr_pane_idle "$pane_id"; then
      idle_polls=$((idle_polls + 1))
    else
      idle_polls=0
    fi
    [ "$waited" -lt "$build_timeout_seconds" ] || die "build still running after ${build_timeout_seconds}s in $pane_id"
  done
  tail_text="$(herdr_pane_tail "$pane_id" 200)"
  if ! printf '%s\n' "$tail_text" | build_succeeded; then
    printf '%s\n' "$tail_text" | tail -n 30
    die "build failed in $pane_id"
  fi
  mkdir -p "$(dirname "$built_marker")"
  touch "$built_marker"
  say "build: ok after ${waited}s"
fi

for env_file in apps/extension/.env apps/mobile/.env; do
  if [ -f "$main_checkout/$env_file" ] && [ ! -f "$checkout_path/$env_file" ]; then
    act cp "$main_checkout/$env_file" "$checkout_path/$env_file"
  fi
done

if [ "$dry_run" = 1 ]; then
  show mkdir -p "$(dirname "$prompt_file")" "$(dirname "$status_file")"
  show fill-prompt "$template_file" "$brief" ">" "$prompt_file"
else
  mkdir -p "$(dirname "$prompt_file")" "$(dirname "$status_file")"
  fill_prompt "$prompt_file" "$base_sha"
  say "prompt: $prompt_file"
fi

already_started=0
if [ "$dry_run" = 1 ]; then
  show herdr agent list
else
  named="$(herdr_agent_by_name "$agent")"
  if [ -n "$named" ]; then
    named_pane="$(printf '%s' "$named" | jq -r '.pane_id')"
    case "$named_pane" in
      "$workspace_id":*) already_started=1; pane_id="$named_pane" ;;
      *) die "agent name $agent is live on $named_pane, outside $workspace_id; pass --agent" ;;
    esac
  else
    occupant="$(herdr_agent_on_pane "$pane_id")"
    if [ -n "$occupant" ]; then
      say "pane $pane_id already hosts $(printf '%s' "$occupant" | jq -r '.agent'); splitting"
      pane_id="$(herdr_pane_split "$pane_id")"
    fi
  fi
fi

if [ "$already_started" = 1 ]; then
  say "agent: $agent already running on $pane_id"
elif [ "$dry_run" = 1 ]; then
  herdr_agent_start "$pane_id"
else
  if ! start_error="$(herdr_agent_start "$pane_id")"; then
    code="$(printf '%s' "$start_error" | jq -r '.error.code // empty' 2>/dev/null || true)"
    case "$code" in
      agent_pane_busy|timeout)
        say "agent start: $code on $pane_id"
        herdr_pane_tail "$pane_id" 30 | tail -n 30
        pane_id="$(herdr_pane_split "$pane_id")"
        say "retrying in $pane_id"
        start_error="$(herdr_agent_start "$pane_id")" || die "agent start failed in $pane_id: $start_error"
        ;;
      *) die "agent start failed in $pane_id: $start_error" ;;
    esac
  fi
  say "agent: $agent started on $pane_id"
fi

prompted=false
if [ "$hold" = 1 ]; then
  say "prompt: held for run-wave.sh"
elif [ "$already_started" = 1 ] && [ -f "$run_json" ] &&
  jq -e --arg b "$branch" 'any(.[]; .branch == $b and .prompted == true)' "$run_json" >/dev/null; then
  prompted=true
  say "prompt: already sent"
else
  herdr_agent_prompt
  prompted=true
  say "prompt: sent to $agent"
fi

record_entry "$prompted"
say "recorded in $run_json"
