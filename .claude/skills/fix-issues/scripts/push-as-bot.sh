#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$script_dir/lib/status-file.sh"

usage() {
  cat <<'EOF'
Usage: push-as-bot.sh --run-dir <dir> --branch <branch> [--commit-only] [--dry-run]

Commits a fixer worktree's staged diff as the bot account, pushes the branch to the bot's fork and
opens the pull request on the upstream repository from the fork, then records pr_url, pr_number,
pushed_at and commit_sha in <run-dir>/run.json. The person's signing key is never used.

Config: ${XDG_CONFIG_HOME:-$HOME/.config}/fix-issues/bot.env with BOT_USER, BOT_EMAIL,
BOT_FORK (default $BOT_USER/mono), BOT_TOKEN_CMD (a command that prints the token), UPSTREAM (default
leather-io/mono) and BASE_BRANCH (default dev). Without it the script exits 3: use
status.sh --finish and let the person commit and push.

  --run-dir      run directory of the fix-issues run
  --branch       the worktree's branch, as recorded in run.json
  --commit-only  commit the staged set and stop (grouped briefs, STATE: staged or done)
  --dry-run      print every git and gh command with the token as ***; run none, not even BOT_TOKEN_CMD

Exit codes: 0 done, 1 a precondition or command failed, 2 bad arguments, 3 no bot configured.
EOF
}

run_dir=""
branch=""
commit_only=0
dry_run=0

while [ $# -gt 0 ]; do
  case "$1" in
    --run-dir) run_dir="$2"; shift 2 ;;
    --branch) branch="$2"; shift 2 ;;
    --commit-only) commit_only=1; shift ;;
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

config_file="${XDG_CONFIG_HOME:-$HOME/.config}/fix-issues/bot.env"
if [ ! -f "$config_file" ]; then
  printf 'no bot configured: %s is missing; use status.sh --finish instead\n' "$config_file" >&2
  exit 3
fi
. "$config_file"
BOT_USER="${BOT_USER:-}"
BOT_EMAIL="${BOT_EMAIL:-}"
BOT_TOKEN_CMD="${BOT_TOKEN_CMD:-}"
BOT_FORK="${BOT_FORK:-$BOT_USER/mono}"
UPSTREAM="${UPSTREAM:-leather-io/mono}"
BASE_BRANCH="${BASE_BRANCH:-dev}"
[ -n "$BOT_USER" ] || die "BOT_USER is not set in $config_file"
[ -n "$BOT_EMAIL" ] || die "BOT_EMAIL is not set in $config_file"
[ -n "$BOT_TOKEN_CMD" ] || die "BOT_TOKEN_CMD is not set in $config_file"

command -v jq >/dev/null || die "jq is required"
command -v gh >/dev/null || die "gh is not on the path"

run_json="$run_dir/run.json"
[ -f "$run_json" ] || die "run.json not found in $run_dir"
entry="$(jq -c --arg b "$branch" '[.[] | select(.branch == $b)] | .[0] // empty' "$run_json")"
[ -n "$entry" ] || die "no entry for $branch in $run_json"

entry_field() {
  printf '%s' "$entry" | jq -r --arg f "$1" '.[$f] // empty | if type == "array" then map(tostring) | join(",") else tostring end'
}

path="$(entry_field path)"
status_file="$(entry_field status_file)"
issues="$(entry_field issues)"
previous_sha="$(entry_field commit_sha)"
previous_push="$(entry_field pushed_at)"
[ -d "$path" ] || [ "$dry_run" = 1 ] || die "worktree not found: $path"
[ -f "$status_file" ] || die "status file not found: $status_file"

state="$(status_state "$status_file")"
subject="$(status_subject "$status_file")"
if [ "$commit_only" = 1 ]; then
  case "$state" in
    staged|done) ;;
    *) die "status file says ${state:-nothing}; --commit-only needs STATE: staged or done" ;;
  esac
else
  [ "$state" = done ] || die "status file says ${state:-nothing}; pushing needs STATE: done"
  if ! gate="$("$script_dir/review-round.sh" check --run-dir "$run_dir" --branch "$branch")"; then
    if [ "$dry_run" = 1 ]; then
      say "dry-run: the review gate would stop here: $gate"
    else
      die "$gate"
    fi
  fi
fi
[ -n "$subject" ] || die "status file has no COMMIT: subject"

case "$BOT_FORK" in
  *://*) fork_url="$BOT_FORK" ;;
  *) fork_url="https://github.com/$BOT_FORK.git" ;;
esac

if [ "$dry_run" = 1 ]; then
  show git -C "$path" diff --cached --name-only
  show git -C "$path" log "origin/$BASE_BRANCH..HEAD" --format=%ae
  staged=1
  ahead=0
else
  staged="$(git -C "$path" diff --cached --name-only | wc -l | tr -d '[:space:]')"
  authors="$(git -C "$path" log "origin/$BASE_BRANCH..HEAD" --format=%ae)"
  ahead=0
  if [ -n "$authors" ]; then
    ahead="$(printf '%s\n' "$authors" | wc -l | tr -d '[:space:]')"
    foreign="$(printf '%s\n' "$authors" | grep -v -x -F "$BOT_EMAIL" || true)"
    [ -z "$foreign" ] || die "origin/$BASE_BRANCH..HEAD has commits not by $BOT_EMAIL: $(printf '%s' "$foreign" | sort -u | tr '\n' ' ')"
  fi
fi

if [ "$staged" -eq 0 ]; then
  if [ "$commit_only" = 1 ] || [ "$ahead" -eq 0 ]; then
    die "nothing staged in $path"
  fi
  say "nothing staged; pushing the $ahead bot commits already on $branch"
else
  message_file="$run_dir/commits/$branch.txt"
  if [ "$dry_run" = 1 ]; then
    show write-commit-message "$message_file"
  else
    mkdir -p "$(dirname "$message_file")"
    printf '%s\n' "$subject" > "$message_file"
  fi
  if [ "$dry_run" = 1 ]; then
    show git -C "$path" -c commit.gpgsign=false -c "user.name=$BOT_USER" -c "user.email=$BOT_EMAIL" commit -F "$message_file"
  else
    git -C "$path" -c commit.gpgsign=false -c "user.name=$BOT_USER" -c "user.email=$BOT_EMAIL" commit -q -F "$message_file"
    say "committed $(git -C "$path" rev-parse --short HEAD) as $BOT_USER: $subject"
  fi
fi

if [ "$commit_only" = 1 ]; then
  exit 0
fi

askpass="$run_dir/askpass-$$.sh"
cleanup() {
  rm -f "$askpass"
}
trap cleanup EXIT

token=""
if [ "$dry_run" = 1 ]; then
  show sh -c "$BOT_TOKEN_CMD"
  show write-askpass "$askpass"
else
  token="$(sh -c "$BOT_TOKEN_CMD")" || die "BOT_TOKEN_CMD failed: $BOT_TOKEN_CMD"
  [ -n "$token" ] || die "BOT_TOKEN_CMD printed nothing: $BOT_TOKEN_CMD"
  (
    umask 077
    cat > "$askpass" <<'EOF'
#!/bin/sh
case "$1" in
  Username*) printf '%s\n' "$FIX_ISSUES_BOT_USER" ;;
  *) printf '%s\n' "$FIX_ISSUES_BOT_TOKEN" ;;
esac
EOF
  )
  chmod 0700 "$askpass"
fi

bot_gh() {
  if [ "$dry_run" = 1 ]; then
    printf '+ GH_TOKEN=***'
    printf ' %q' gh "$@"
    printf '\n'
    return 0
  fi
  GH_TOKEN="$token" gh "$@"
}

case "$BOT_FORK" in
  *://*) say "fork check skipped: BOT_FORK is a URL" ;;
  *)
    if [ "$dry_run" = 1 ]; then
      bot_gh repo view "$BOT_FORK" --json isFork,parent
    else
      fork_info="$(bot_gh repo view "$BOT_FORK" --json isFork,parent 2>/dev/null || true)"
      parent="$(printf '%s' "$fork_info" | jq -r 'select(.isFork) | "\(.parent.owner.login)/\(.parent.name)"' 2>/dev/null || true)"
      if [ "$parent" != "$UPSTREAM" ]; then
        printf 'error: %s is not a fork of %s. One-time setup: sign in to GitHub as %s, open https://github.com/%s/fork and create the fork as %s.\n' \
          "$BOT_FORK" "$UPSTREAM" "$BOT_USER" "$UPSTREAM" "$BOT_FORK" >&2
        exit 1
      fi
    fi
    ;;
esac

push_args=(push)
if [ -n "$previous_push" ] && [ -n "$previous_sha" ]; then
  push_args+=("--force-with-lease=refs/heads/$branch:$previous_sha")
fi
push_args+=("$fork_url" "HEAD:refs/heads/$branch")

if [ "$dry_run" = 1 ]; then
  printf '+ GIT_ASKPASS=%q GIT_TERMINAL_PROMPT=0 FIX_ISSUES_BOT_USER=%q FIX_ISSUES_BOT_TOKEN=***' "$askpass" "$BOT_USER"
  printf ' %q' git -C "$path" -c credential.helper= "${push_args[@]}"
  printf '\n'
else
  GIT_ASKPASS="$askpass" GIT_TERMINAL_PROMPT=0 FIX_ISSUES_BOT_USER="$BOT_USER" FIX_ISSUES_BOT_TOKEN="$token" \
    git -C "$path" -c credential.helper= "${push_args[@]}"
fi
commit_sha="<commit_sha>"
if [ "$dry_run" = 0 ]; then
  commit_sha="$(git -C "$path" rev-parse HEAD)"
  say "pushed $commit_sha to $fork_url $branch"
fi

body_file="$run_dir/pr/$branch.md"
pr_url=""
if [ "$dry_run" = 1 ]; then
  bot_gh pr list --repo "$UPSTREAM" --head "$branch" --state open --json url,number,headRepositoryOwner
  show write-pr-body "$status_file" ">" "$body_file"
  bot_gh pr create --repo "$UPSTREAM" --base "$BASE_BRANCH" --head "$BOT_USER:$branch" --title "$subject" --body-file "$body_file"
  pr_url="<pr_url>"
else
  pr_url="$(bot_gh pr list --repo "$UPSTREAM" --head "$branch" --state open --json url,number,headRepositoryOwner |
    jq -r --arg u "$BOT_USER" '[.[] | select(.headRepositoryOwner.login == $u)] | .[0].url // empty')"
  if [ -n "$pr_url" ]; then
    say "pull request already open, updated by the push: $pr_url"
  else
    write_pr_body "$body_file" "$status_file" "$issues"
    pr_url="$(bot_gh pr create --repo "$UPSTREAM" --base "$BASE_BRANCH" --head "$BOT_USER:$branch" --title "$subject" --body-file "$body_file" | tail -n 1)"
    say "opened $pr_url"
  fi
fi

pr_number="${pr_url##*/}"
pushed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
filter='map(if .branch == $b then . + {pr_url: $url, pr_number: ($num | tonumber? // $num), pushed_at: $at, commit_sha: $sha} else . end)'
if [ "$dry_run" = 1 ]; then
  show jq --arg b "$branch" --arg url "$pr_url" --arg num "$pr_number" --arg at "$pushed_at" --arg sha "$commit_sha" "$filter" "$run_json"
else
  jq --arg b "$branch" --arg url "$pr_url" --arg num "$pr_number" --arg at "$pushed_at" --arg sha "$commit_sha" "$filter" "$run_json" > "$run_json.tmp"
  mv "$run_json.tmp" "$run_json"
  say "recorded in $run_json"
fi
