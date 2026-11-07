#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$script_dir/lib/agent.sh"

usage() {
  cat <<'EOF'
Usage: prompt-agent.sh --run-dir <dir> --branch <branch> (--text <text> | --file <file>) [--dry-run]

Sends one prompt to the fixer of <branch>, whatever runs it: `herdr agent prompt` for a herdr
agent, or a background `claude -p --resume <session>` in the worktree for a headless fixer (refused
while that fixer's process is still running). The text is written to
<run-dir>/prompts/<branch>.next.md first, so the shell never expands it.

  --text     the prompt text
  --file     a file holding the prompt text
  --dry-run  print the command; run none
EOF
}

run_dir=""
branch=""
text=""
file=""
dry_run=0

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --branch) branch="$2"; shift 2 ;;
    --text) text="$2"; shift 2 ;;
    --file) file="$2"; shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'error: unknown argument %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

[ -n "$run_dir" ] || { usage >&2; exit 2; }
[ -n "$branch" ] || { usage >&2; exit 2; }
[ -n "$text" ] || [ -n "$file" ] || die "--text or --file is required"
command -v jq >/dev/null || die "jq is required"
run_json="$run_dir/run.json"
[ -f "$run_json" ] || die "run.json not found in $run_dir"
entry="$(jq -c --arg b "$branch" '[.[] | select(.branch == $b)] | .[0] // empty' "$run_json")"
[ -n "$entry" ] || die "no entry for $branch in $run_json"

prompt_file="$run_dir/prompts/$branch.next.md"
if [ -n "$file" ]; then
  [ -f "$file" ] || die "file not found: $file"
  prompt_file="$file"
elif [ "$dry_run" = 0 ]; then
  mkdir -p "$(dirname "$prompt_file")"
  printf '%s\n' "$text" > "$prompt_file"
fi

if [ "$dry_run" = 1 ]; then
  agent_prompt_command "$entry" "$prompt_file"
  exit 0
fi
agent_prompt "$run_dir" "$entry" "$prompt_file" || die "could not prompt the fixer of $branch"
printf 'prompted the fixer of %s\n' "$branch"
