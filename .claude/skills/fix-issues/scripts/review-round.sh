#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$script_dir/lib/status-file.sh"

usage() {
  cat <<'EOF'
Usage: review-round.sh record --run-dir <dir> --branch <branch> --findings <file> [--dry-run]
       review-round.sh check  --run-dir <dir> --branch <branch>

The review gate. Every worktree gets exactly one review after its fixer reports done, and at most
one fix round that addresses only the review's critical findings. push-as-bot.sh and
status.sh --finish refuse to go on until the gate passes.

record  Records the one review of a done worktree. <file> holds one finding per line, each
        starting with CRITICAL: (a correctness bug or a regression this diff introduces) or
        OTHER: (everything else: simplification, style, naming, coverage, nits); other lines are
        ignored. The findings are kept in <run-dir>/reviews/<branch>.md and counted in run.json.
        With critical findings, the fixer is prompted once to fix only those. A second record for
        the same branch is refused: the review runs once.
check   Exits 0 when the gate passes: a review is recorded and, if it had critical findings, the
        fixer finished its fix round (STATE: done with a FIXED: list). Otherwise prints why and
        exits 1.

  --dry-run  print the herdr and file-writing commands record would run; run none
EOF
}

command_name="${1:-}"
case "$command_name" in
  record|check) shift ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

run_dir=""
branch=""
findings=""
dry_run=0

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --branch) branch="$2"; shift 2 ;;
    --findings) findings="$2"; shift 2 ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help) usage; exit 0 ;;
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

[ -n "$run_dir" ] || { usage >&2; exit 2; }
[ -n "$branch" ] || { usage >&2; exit 2; }
command -v jq >/dev/null || die "jq is required"
run_json="$run_dir/run.json"
[ -f "$run_json" ] || die "run.json not found in $run_dir"
entry="$(jq -c --arg b "$branch" '[.[] | select(.branch == $b)] | .[0] // empty' "$run_json")"
[ -n "$entry" ] || die "no entry for $branch in $run_json"

entry_field() {
  printf '%s' "$entry" | jq -r "$1 // empty"
}

status_file="$(entry_field .status_file)"
agent="$(entry_field .agent)"
reviewed_at="$(entry_field .review.reviewed_at)"
critical="$(entry_field .review.critical)"

if [ "$command_name" = check ]; then
  [ -n "$reviewed_at" ] || {
    say "no review recorded for $branch: run the review, then review-round.sh record"
    exit 1
  }
  if [ "${critical:-0}" -gt 0 ]; then
    state="$(status_state "$status_file")"
    fixed="$(status_value "$status_file" FIXED)"
    if [ "$state" != done ] || [ -z "$fixed" ]; then
      say "fix round for $branch not finished: $critical critical findings, status ${state:-missing}, no FIXED: list yet"
      exit 1
    fi
  fi
  say "review gate passed for $branch (${critical:-0} critical)"
  exit 0
fi

[ -n "$findings" ] || die "--findings is required"
[ -f "$findings" ] || die "findings file not found: $findings"
[ -z "$reviewed_at" ] || die "$branch was already reviewed at $reviewed_at; the review runs once"
state="$(status_state "$status_file")"
[ "$state" = done ] || die "status file says ${state:-nothing}; the review runs after STATE: done"

critical_lines="$(grep -E '^CRITICAL:' "$findings" || true)"
critical_count=0
if [ -n "$critical_lines" ]; then
  critical_count="$(printf '%s\n' "$critical_lines" | wc -l | tr -d '[:space:]')"
fi
other_count="$(grep -c -E '^OTHER:' "$findings" || true)"
review_file="$run_dir/reviews/$branch.md"
fix_prompt="$run_dir/prompts/$branch.review-fixes.md"
now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

write_fix_prompt() {
  mkdir -p "$(dirname "$fix_prompt")"
  {
    printf 'REVIEW FIXES. One review of your staged diff found the critical findings below: correctness bugs or regressions this change introduces. This is the only fix round; there is no second review.\n\n'
    printf '1. Write `STATE: working` to %s first.\n' "$status_file"
    printf '2. Fix only these findings. Make no other change: no refactors, no cleanups, no style or naming changes, nothing the list below does not name.\n'
    printf '3. Rerun every Verify line and the full verification list from CLAUDE.md. Fix what fails.\n'
    printf '4. Stage with `git add`. Never commit.\n'
    printf '5. Rewrite %s in the same shape as before with `STATE: done`, update HOW and TESTED if they changed, and add one FIXED: bullet per finding, either what you changed or `Not fixed: <why>`. Then stop.\n\n' "$status_file"
    printf 'Findings:\n\n'
    printf '%s\n' "$critical_lines" | sed 's/^/- /'
  } > "$fix_prompt"
}

record() {
  local fix_prompted="$1"
  jq --arg b "$branch" --arg at "$now" --arg file "$review_file" \
    --argjson critical "$critical_count" --argjson other "$other_count" --arg fix "$fix_prompted" \
    'map(if .branch == $b then . + {review: ({reviewed_at: $at, file: $file, critical: $critical, other: $other}
      + (if $fix == "" then {} else {fix_prompted_at: $fix} end))} else . end)' "$run_json" > "$run_json.tmp"
  mv "$run_json.tmp" "$run_json"
}

say "review of $branch: $critical_count critical, $other_count other"
if [ "$dry_run" = 1 ]; then
  show cp "$findings" "$review_file"
  if [ "$critical_count" -gt 0 ]; then
    show write-fix-prompt "$fix_prompt"
    show herdr agent prompt "$agent" "\$(cat $fix_prompt)"
  fi
  show record-review "$run_json" "$branch"
  exit 0
fi

mkdir -p "$(dirname "$review_file")"
cp "$findings" "$review_file"
if [ "$critical_count" -eq 0 ]; then
  record ""
  say "no critical findings: no fix round; the gate passes"
  exit 0
fi
command -v herdr >/dev/null || die "herdr is required to prompt $agent"
write_fix_prompt
herdr agent prompt "$agent" "$(cat "$fix_prompt")" >/dev/null || die "could not prompt $agent"
record "$now"
say "prompted $agent with $critical_count critical findings: $fix_prompt"
