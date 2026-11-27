#!/usr/bin/env bash
set -u
set -o pipefail

usage() {
  cat <<'EOF'
Usage: run-security.sh --device <udid> [options] [flow.yaml | folder ...]

Runs the device security flows (default: every flow under this folder except
shared/ subflows and flows tagged blocked or blocked-ios) on an iOS simulator, one maestro
process per flow, and answers the Face ID prompts they raise.

Flow tags read:
  faceid-match         Enrol Face ID before the flow and answer every Face ID
                       scan with a match.
  faceid-nomatch       Enrol Face ID before the flow, answer the first scan
                       with a failed match and every later scan with a match.
  faceid-prompts-<n>   Fail the flow unless exactly n Face ID scans started.
  blocked, blocked-ios Skipped unless --include-blocked is given.

Around every flow the script streams the simulator log for coreauthd "will
start matching" lines, so faceid-prompts-<n> works in every mode. Around a flow
with faceid-match or faceid-nomatch it also enrols Face ID, answers each scan
once after --answer-delay seconds, and resets the enrolment to 0 afterwards.

Options:
  --device <udid>        Simulator UDID (required).
  --output <dir>         Output directory. Default: ./maestro-security-output
  --answer-delay <s>     Seconds to leave a scan on screen before answering.
                         Default: 3
  --include-blocked      Run only the flows tagged blocked or blocked-ios.
  --quiet                Discard Maestro screenshots, view hierarchies and debug
                         output (for flows that show a secret key). Of a failed
                         flow it keeps only the Maestro console output (the
                         steps it ran and the failure message, no screen
                         content) and the Face ID logs.
  --list                 Print the selected flows with their Face ID plan.
  -h, --help             Show this help.

Environment:
  METRO_URL            Default http://localhost:8081
  TEST_APP_URL         Default http://localhost:3100
  DEV_CLIENT_URL       Overrides the dev-client link built from METRO_URL.
  MAESTRO              maestro binary. Default: maestro

Exit status: 0 when every flow passed, 1 when one failed, 2 on bad usage.
EOF
}

die() {
  printf 'run-security: %s\n' "$1" >&2
  exit 2
}

script_dir=$(cd "$(dirname "$0")" && pwd)
device=""
output_dir="$PWD/maestro-security-output"
answer_delay=3
include_blocked=0
quiet=0
list_only=0
targets=""
maestro_bin="${MAESTRO:-maestro}"
metro_url="${METRO_URL:-http://localhost:8081}"
test_app_url="${TEST_APP_URL:-http://localhost:3100}"
match_marker='Mechanism.*will start matching user'

while [ $# -gt 0 ]; do
  case "$1" in
    --device)
      [ $# -ge 2 ] || die "--device needs a value"
      device="$2"
      shift 2
      ;;
    --output)
      [ $# -ge 2 ] || die "--output needs a value"
      output_dir="$2"
      shift 2
      ;;
    --answer-delay)
      [ $# -ge 2 ] || die "--answer-delay needs a value"
      answer_delay="$2"
      shift 2
      ;;
    --include-blocked)
      include_blocked=1
      shift
      ;;
    --quiet)
      quiet=1
      shift
      ;;
    --list)
      list_only=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      usage >&2
      die "unknown argument: $1"
      ;;
    *)
      targets="${targets}$1
"
      shift
      ;;
  esac
done

case "$answer_delay" in
  '' | *[!0-9.]*) die "--answer-delay must be a number of seconds" ;;
esac

has_tag() {
  awk '/^---[[:space:]]*$/ { exit } { print }' "$1" |
    grep -Eq "^[[:space:]]*-[[:space:]]*$2[[:space:]]*\$|^tags:.*[[:space:],[]$2([[:space:],]|\\])"
}

faceid_mode() {
  if has_tag "$1" faceid-nomatch; then
    printf 'nomatch'
  elif has_tag "$1" faceid-match; then
    printf 'match'
  else
    printf 'none'
  fi
}

expected_prompts() {
  awk '/^---[[:space:]]*$/ { exit } { print }' "$1" |
    grep -Eo 'faceid-prompts-[0-9]+' | head -n 1 | sed 's/^faceid-prompts-//'
}

find_flows() {
  find "$1" -name '*.yaml' -not -path '*/shared/*' | LC_ALL=C sort
}

[ -n "$targets" ] || targets="$script_dir
"

all_flows=""
while IFS= read -r target; do
  [ -n "$target" ] || continue
  if [ -d "$target" ]; then
    all_flows="${all_flows}$(find_flows "$target")
"
  elif [ -f "$target" ]; then
    all_flows="${all_flows}${target}
"
  else
    die "no such flow or folder: $target"
  fi
done <<EOF
$targets
EOF

selected=""
while IFS= read -r flow; do
  [ -n "$flow" ] || continue
  flow=$(cd "$(dirname "$flow")" && printf '%s/%s' "$(pwd)" "$(basename "$flow")")
  if has_tag "$flow" blocked || has_tag "$flow" blocked-ios; then
    [ "$include_blocked" -eq 1 ] || continue
  else
    [ "$include_blocked" -eq 0 ] || continue
  fi
  selected="${selected}${flow}
"
done <<EOF
$all_flows
EOF

[ -n "$selected" ] || die "no flows selected"

if [ "$list_only" -eq 1 ]; then
  while IFS= read -r flow; do
    [ -n "$flow" ] || continue
    printf '%-8s %-3s %s\n' "$(faceid_mode "$flow")" "$(expected_prompts "$flow")" "$flow"
  done <<EOF
$selected
EOF
  exit 0
fi

[ -n "$device" ] || die "--device is required (see --help)"
command -v "$maestro_bin" >/dev/null 2>&1 || die "maestro not found: $maestro_bin"
command -v xcrun >/dev/null 2>&1 || die "xcrun not found: Face ID needs an iOS simulator"

if [ -z "${DEV_CLIENT_URL:-}" ]; then
  encoded_metro_url=$(printf '%s' "$metro_url" | sed -e 's|:|%3A|g' -e 's|/|%2F|g')
  DEV_CLIENT_URL="exp+leather-wallet-mobile://?__expo_url=${encoded_metro_url}&__expo_disable_fab=1&__expo_disable_onboarding=1"
fi

mkdir -p "$output_dir" || die "cannot create $output_dir"
output_dir=$(cd "$output_dir" && pwd)

stream_pid=""
answer_pid=""

set_enrolment() {
  xcrun simctl spawn "$device" notifyutil -s com.apple.BiometricKit.enrollmentChanged "$1" &&
    xcrun simctl spawn "$device" notifyutil -p com.apple.BiometricKit.enrollmentChanged
}

post_answer() {
  xcrun simctl spawn "$device" notifyutil -p "com.apple.BiometricKit_Sim.pearl.$1"
}

count_scans() {
  grep -c "$match_marker" "$1" 2>/dev/null || true
}

answer_scans() {
  local mode="$1"
  local log_file="$2"
  local answers_file="$3"
  local answered=0
  local seen
  local answer
  while :; do
    seen=$(count_scans "$log_file")
    while [ "$answered" -lt "$seen" ]; do
      answered=$((answered + 1))
      answer="match"
      if [ "$mode" = "nomatch" ] && [ "$answered" -eq 1 ]; then
        answer="nomatch"
      fi
      sleep "$answer_delay"
      post_answer "$answer"
      printf '%s %s\n' "$answered" "$answer" >>"$answers_file"
    done
    sleep 0.5
  done
}

stop_sidecar() {
  if [ -n "$answer_pid" ]; then
    kill "$answer_pid" 2>/dev/null
    wait "$answer_pid" 2>/dev/null
  fi
  if [ -n "$stream_pid" ]; then
    kill "$stream_pid" 2>/dev/null
    wait "$stream_pid" 2>/dev/null
  fi
  answer_pid=""
  stream_pid=""
}

start_sidecar() {
  local mode="$1"
  local dir="$2"
  local waited=0
  : >"$dir/faceid-answers.txt"
  xcrun simctl spawn "$device" log stream --style compact \
    --predicate 'process == "coreauthd" AND eventMessage CONTAINS "will start matching"' \
    >"$dir/faceid-stream.log" 2>&1 &
  stream_pid=$!
  until grep -q '^Filtering the log data' "$dir/faceid-stream.log" 2>/dev/null; do
    waited=$((waited + 1))
    [ "$waited" -le 60 ] || return 1
    sleep 0.5
  done
  [ "$mode" != "none" ] || return 0
  answer_scans "$mode" "$dir/faceid-stream.log" "$dir/faceid-answers.txt" &
  answer_pid=$!
}

cleanup() {
  stop_sidecar
  set_enrolment 0 >/dev/null 2>&1
}

trap 'cleanup' EXIT
trap 'exit 130' INT TERM

run_maestro() {
  local flow="$1"
  local dir="$2"
  if [ "$quiet" -eq 1 ]; then
    local scratch
    scratch=$(mktemp -d)
    "$maestro_bin" --device "$device" test \
      --test-output-dir "$scratch" \
      --debug-output "$scratch" \
      -e DEV_CLIENT_URL="$DEV_CLIENT_URL" \
      -e TEST_APP_URL="$test_app_url" \
      "$flow" </dev/null >"$dir/maestro.log" 2>&1
    local status=$?
    rm -rf "$scratch"
    return "$status"
  fi
  mkdir -p "$dir/debug"
  "$maestro_bin" --device "$device" test \
    --format junit \
    --output "$dir/junit.xml" \
    --test-output-dir "$dir" \
    --debug-output "$dir/debug" \
    -e DEV_CLIENT_URL="$DEV_CLIENT_URL" \
    -e TEST_APP_URL="$test_app_url" \
    "$flow" </dev/null >"$dir/maestro.log" 2>&1
}

run_flow() {
  local flow="$1"
  local dir="$2"
  local mode
  local expected
  local status=0
  local scans
  mode=$(faceid_mode "$flow")
  expected=$(expected_prompts "$flow")
  rm -rf "$dir"
  mkdir -p "$dir"
  if [ "$mode" = "none" ]; then
    set_enrolment 0 || return 1
  else
    set_enrolment 1 || return 1
  fi
  if ! start_sidecar "$mode" "$dir"; then
    printf '  sidecar did not start\n'
    stop_sidecar
    set_enrolment 0
    return 1
  fi
  run_maestro "$flow" "$dir" || status=$?
  stop_sidecar
  if [ "$mode" != "none" ]; then
    set_enrolment 0 || status=1
  fi
  scans=$(count_scans "$dir/faceid-stream.log")
  [ -n "$scans" ] || scans=0
  if [ "$status" -eq 0 ] && [ -n "$expected" ] && [ "$scans" != "$expected" ]; then
    printf '  expected %s Face ID prompts, saw %s\n' "$expected" "$scans"
    status=1
  fi
  printf '%s\n' "$scans" >"$dir/faceid-scans.txt"
  return "$status"
}

failed=0
total=0
while IFS= read -r flow <&3; do
  [ -n "$flow" ] || continue
  total=$((total + 1))
  slug=$(printf '%s' "${flow#"$script_dir"/}" | sed -e 's|\.yaml$||' -e 's|/|__|g')
  flow_dir="$output_dir/$slug"
  started=$SECONDS
  if run_flow "$flow" "$flow_dir"; then
    status="pass"
  else
    status="fail"
    failed=$((failed + 1))
  fi
  printf '%-4s %4ss  scans %s  %s\n' "$status" "$((SECONDS - started))" \
    "$(cat "$flow_dir/faceid-scans.txt" 2>/dev/null || printf '%s' '-')" "${flow#"$script_dir"/}"
  if [ "$quiet" -eq 1 ] && [ "$status" = "pass" ]; then
    rm -rf "$flow_dir"
  fi
  if [ "$status" != "pass" ]; then
    grep -E '\[Failed\]' "$flow_dir/maestro.log" 2>/dev/null | sed 's/^/     /'
    printf '     output: %s\n' "$flow_dir"
  fi
done 3<<EOF
$selected
EOF

printf '\npassed %s, failed %s\n' "$((total - failed))" "$failed"
[ "$failed" -eq 0 ] || exit 1
exit 0
