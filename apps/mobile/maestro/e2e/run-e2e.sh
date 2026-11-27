#!/usr/bin/env bash
set -u
set -o pipefail

usage() {
  cat <<'EOF'
Usage: run-e2e.sh --device <id> [options]

Runs every Maestro flow under apps/mobile/maestro/e2e (except shared/ subflows
and flows tagged blocked or blocked-<platform>), or only the flows with one of
the --tag tags, one maestro process per flow. A failed flow is run
once more. Exits 1 when a flow fails twice, 2 on a usage error or when the
options select no flow at all. A shard may be empty when the selection is not.

Options:
  --device <id>        Simulator UDID, emulator serial (for example emulator-5554)
                       or Android device serial.
  --platform <name>    ios or android. Default: android when the device id
                       starts with emulator- or is listed by adb devices,
                       ios otherwise. Required when --device is not given.
  --shard <i/n>        Run shard i of n: every n-th flow of the sorted list, from flow i.
  --area <name>        Only run flows of this area (accounts, home, send,
                       rpc-bitcoin, rpc-stacks, security). Repeat or
                       comma-separate. An unknown area is an error. Without
                       it, every area except security.
  --tag <name>         Only run flows that have this tag in their tags: list
                       (for example ios-ci). Repeat or comma-separate: a flow
                       with any of the tags is selected. Combines with --area,
                       --shard and the blocked rules.
  --output <dir>       Output directory. Default: ./maestro-e2e-output
  --include-blocked    Run only the flows tagged blocked or blocked-<platform>.
  --list               Print the selected flows and exit.
  -h, --help           Show this help.

Environment:
  METRO_URL            Default http://localhost:8081
  TEST_APP_URL         Default http://localhost:3100
  DEV_CLIENT_URL       Overrides the dev-client link built from METRO_URL.
  MAESTRO              maestro binary. Default: maestro

Android device recovery (off unless E2E_DEVICE_RECOVER_CMD is set):
  E2E_DEVICE_RECOVER_CMD      Command (run with bash -c) that restarts the
                              emulator, installs the app and sets adb reverse.
                              Before each flow attempt the runner checks that
                              the device is connected and booted; when it is
                              not, it saves evidence, runs this command and
                              continues. A flow whose attempt lost the device
                              gets its retry after the recovery.
  E2E_DEVICE_RECOVER_MAX      Recoveries allowed per run. Default: 2. Past it
                              the flows fail as without recovery.
  E2E_DEVICE_RECOVER_TIMEOUT  Seconds the command may take. Default: 900
  E2E_EMULATOR_LOG            Emulator log whose tail goes into the evidence.

Output:
  <dir>/summary.json   Per-flow status (pass, flaky, fail), attempts, seconds.
  <dir>/junit.xml      JUnit of the last attempt of every flow.
  <dir>/junit/         One JUnit file per flow.
  <dir>/artifacts/     Maestro logs and screenshots, only for flows that
                       failed at least once.
  <dir>/recovery-<n>/  Evidence and recover command log of each device
                       recovery. summary.json counts them in deviceRecoveries.
EOF
}

die() {
  printf 'run-e2e: %s\n' "$1" >&2
  exit 2
}

script_dir=$(cd "$(dirname "$0")" && pwd)
device=""
platform=""
shard=""
areas=""
select_tags=""
output_dir="$PWD/maestro-e2e-output"
include_blocked=0
list_only=0
maestro_bin="${MAESTRO:-maestro}"
metro_url="${METRO_URL:-http://localhost:8081}"
test_app_url="${TEST_APP_URL:-http://localhost:3100}"

while [ $# -gt 0 ]; do
  case "$1" in
    --device)
      [ $# -ge 2 ] || die "--device needs a value"
      device="$2"
      shift 2
      ;;
    --platform)
      [ $# -ge 2 ] || die "--platform needs a value"
      platform="$2"
      shift 2
      ;;
    --shard)
      [ $# -ge 2 ] || die "--shard needs a value"
      shard="$2"
      shift 2
      ;;
    --area)
      [ $# -ge 2 ] || die "--area needs a value"
      areas="${areas},$2"
      shift 2
      ;;
    --tag)
      [ $# -ge 2 ] || die "--tag needs a value"
      case "$2" in
        '' | *[!A-Za-z0-9_,-]*) die "--tag takes letters, digits, - and _ (comma-separated)" ;;
      esac
      select_tags="${select_tags},$2"
      shift 2
      ;;
    --output)
      [ $# -ge 2 ] || die "--output needs a value"
      output_dir="$2"
      shift 2
      ;;
    --include-blocked)
      include_blocked=1
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
    *)
      usage >&2
      die "unknown argument: $1"
      ;;
  esac
done

is_adb_device() {
  command -v adb >/dev/null 2>&1 || return 1
  adb devices 2>/dev/null | awk 'NR > 1 { print $1 }' | grep -Fxq "$1"
}

if [ -z "$platform" ]; then
  case "$device" in
    "") die "--platform or --device is required (see --help)" ;;
    emulator-*) platform="android" ;;
    *)
      if is_adb_device "$device"; then
        platform="android"
      else
        platform="ios"
      fi
      ;;
  esac
fi
case "$platform" in
  ios | android) ;;
  *) die "--platform must be ios or android" ;;
esac

shard_index=1
shard_total=1
if [ -n "$shard" ]; then
  case "$shard" in
    */*) ;;
    *) die "--shard must look like i/n" ;;
  esac
  shard_index="${shard%%/*}"
  shard_total="${shard##*/}"
  case "$shard_index$shard_total" in
    *[!0-9]*) die "--shard must look like i/n" ;;
  esac
  [ -n "$shard_index" ] && [ -n "$shard_total" ] || die "--shard must look like i/n"
  [ "$shard_total" -ge 1 ] && [ "$shard_index" -ge 1 ] && [ "$shard_index" -le "$shard_total" ] ||
    die "--shard needs 1 <= i <= n"
fi

has_tag() {
  awk '/^---[[:space:]]*$/ { exit } { print }' "$1" |
    grep -Eq "^[[:space:]]*-[[:space:]]*$2[[:space:]]*\$|^tags:.*[[:space:],[]$2([[:space:],]|\\])"
}

is_blocked() {
  has_tag "$1" blocked || has_tag "$1" "blocked-$platform"
}

in_areas() {
  if [ -z "$areas" ]; then
    [ "$1" != "security" ]
    return
  fi
  case "${areas}," in
    *",$1,"*) return 0 ;;
  esac
  return 1
}

has_any_tag() {
  [ -n "$select_tags" ] || return 0
  local tag
  for tag in $(printf '%s' "$select_tags" | tr ',' ' '); do
    has_tag "$1" "$tag" && return 0
  done
  return 1
}

all_flows=$(cd "$script_dir" && find . -name '*.yaml' -not -path '*/shared/*' | sed 's|^\./||' | LC_ALL=C sort)
[ -n "$all_flows" ] || die "no flows found under $script_dir"

known_areas=$(printf '%s\n' "$all_flows" | sed 's|/.*||' | LC_ALL=C sort -u)
for area in $(printf '%s' "$areas" | tr ',' ' '); do
  printf '%s\n' "$known_areas" | grep -Fxq "$area" ||
    die "unknown area: $area (known: $(printf '%s' "$known_areas" | tr '\n' ' '))"
done

selected=""
while IFS= read -r flow; do
  in_areas "${flow%%/*}" || continue
  has_any_tag "$script_dir/$flow" || continue
  if is_blocked "$script_dir/$flow"; then
    [ "$include_blocked" -eq 1 ] || continue
  else
    [ "$include_blocked" -eq 0 ] || continue
  fi
  selected="${selected}${flow}
"
done <<EOF
$all_flows
EOF

selected_count=$(printf '%s' "$selected" | grep -c . || true)
[ "$selected_count" -gt 0 ] || die "the selection is empty: no flow matches these options on $platform"
shard_flows=$(printf '%s' "$selected" | awk -v i="$shard_index" -v n="$shard_total" 'NF && (NR - 1) % n == i - 1')

if [ "$list_only" -eq 1 ]; then
  [ -n "$shard_flows" ] && printf '%s\n' "$shard_flows"
  exit 0
fi

[ -n "$device" ] || die "--device is required (see --help)"
command -v "$maestro_bin" >/dev/null 2>&1 || die "maestro not found: $maestro_bin"

recover_cmd="${E2E_DEVICE_RECOVER_CMD:-}"
recover_max="${E2E_DEVICE_RECOVER_MAX:-2}"
recover_timeout="${E2E_DEVICE_RECOVER_TIMEOUT:-900}"
case "$recover_max$recover_timeout" in
  '' | *[!0-9]*) die "E2E_DEVICE_RECOVER_MAX and E2E_DEVICE_RECOVER_TIMEOUT must be whole numbers" ;;
esac
recoveries=0
recover_cap_reported=0

encoded_metro_url=$(printf '%s' "$metro_url" | sed -e 's|:|%3A|g' -e 's|/|%2F|g')
if [ -z "${DEV_CLIENT_URL:-}" ]; then
  if [ "$platform" = "android" ]; then
    DEV_CLIENT_URL="exp+leather-wallet-mobile://expo-development-client/?url=${encoded_metro_url}&__expo_disable_fab=1&__expo_disable_onboarding=1&__expo_disable_auto_launch=1&disableOnboarding=1"
  else
    DEV_CLIENT_URL="exp+leather-wallet-mobile://?__expo_url=${encoded_metro_url}&__expo_disable_fab=1&__expo_disable_onboarding=1"
  fi
fi

mkdir -p "$output_dir" || die "cannot create $output_dir"
output_dir=$(cd "$output_dir" && pwd)
rm -rf "$output_dir/artifacts" "$output_dir/junit" "$output_dir/summary.json" "$output_dir/junit.xml" "$output_dir/results.tsv" "$output_dir"/recovery-*
mkdir -p "$output_dir/artifacts" "$output_dir/junit"
results="$output_dir/results.tsv"
: >"$results"

trap 'exit 130' INT TERM

xml_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

run_attempt() {
  local flow="$1"
  local dir="$2"
  mkdir -p "$dir/debug"
  "$maestro_bin" --device "$device" test \
    --format junit \
    --output "$dir/junit.xml" \
    --test-output-dir "$dir" \
    --debug-output "$dir/debug" \
    -e DEV_CLIENT_URL="$DEV_CLIENT_URL" \
    -e TEST_APP_URL="$test_app_url" \
    "$script_dir/$flow" </dev/null >"$dir/maestro.log" 2>&1
  local status=$?
  if [ ! -s "$dir/junit.xml" ]; then
    local name
    name=$(xml_escape "$flow")
    printf '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n<testsuite name="maestro" tests="1" failures="1">\n<testcase name="%s" classname="%s"><failure message="maestro exited %s without a report"/></testcase>\n</testsuite>\n</testsuites>\n' \
      "$name" "$name" "$status" >"$dir/junit.xml"
  fi
  return "$status"
}

with_timeout() {
  local seconds="$1"
  shift
  perl -e 'alarm shift; exec @ARGV' "$seconds" "$@"
}

device_ready() {
  local state booted
  state=$(with_timeout 10 adb -s "$device" get-state 2>/dev/null | tr -d '\r')
  [ "$state" = "device" ] || return 1
  booted=$(with_timeout 10 adb -s "$device" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
  [ "$booted" = "1" ]
}

wait_for_device() {
  local _
  for _ in $(seq 1 60); do
    device_ready && return 0
    sleep 2
  done
  return 1
}

save_recovery_evidence() {
  printf '== %s, before %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1"
  printf '\n== adb devices\n'
  adb devices
  if [ -n "${E2E_EMULATOR_LOG:-}" ] && [ -f "$E2E_EMULATOR_LOG" ]; then
    printf '\n== tail -50 %s\n' "$E2E_EMULATOR_LOG"
    tail -50 "$E2E_EMULATOR_LOG"
  fi
  if command -v free >/dev/null 2>&1; then
    printf '\n== free -m\n'
    free -m
  elif command -v vm_stat >/dev/null 2>&1; then
    printf '\n== vm_stat\n'
    vm_stat
  fi
  printf '\n== largest processes (pid, rss kB, command)\n'
  ps -A -o pid= -o rss= -o comm= | sort -k2 -nr | head -15
  if [ "$(uname -s)" = "Linux" ] && sudo -n true 2>/dev/null; then
    printf '\n== sudo dmesg | tail -50\n'
    sudo -n dmesg | tail -50
  fi
}

recover_device() {
  local flow="$1"
  if [ "$recoveries" -ge "$recover_max" ]; then
    if [ "$recover_cap_reported" -eq 0 ]; then
      printf '  device %s lost before %s: %s recoveries used, no more allowed\n' "$device" "$flow" "$recoveries"
      recover_cap_reported=1
    fi
    return 1
  fi
  recoveries=$((recoveries + 1))
  local dir="$output_dir/recovery-$recoveries"
  local started=$SECONDS
  mkdir -p "$dir"
  printf '  device %s lost before %s: recovery %s of %s, evidence in %s\n' "$device" "$flow" "$recoveries" "$recover_max" "$dir"
  save_recovery_evidence "$flow" >"$dir/evidence.txt" 2>&1
  if with_timeout "$recover_timeout" bash -c "$recover_cmd" </dev/null >"$dir/recover.log" 2>&1 && wait_for_device; then
    printf '  device %s recovered in %ss\n' "$device" "$((SECONDS - started))"
    return 0
  fi
  printf '  device %s recovery %s failed after %ss, see %s/recover.log\n' "$device" "$recoveries" "$((SECONDS - started))" "$dir"
  return 1
}

ensure_device() {
  [ "$platform" = "android" ] && [ -n "$recover_cmd" ] || return 0
  device_ready && return 0
  sleep 3
  device_ready && return 0
  recover_device "$1"
}

shard_count=$(printf '%s' "$shard_flows" | grep -c . || true)
printf 'run-e2e: %s flows on %s (%s), shard %s/%s of %s selected\n' \
  "$shard_count" "$device" "$platform" "$shard_index" "$shard_total" "$selected_count"

position=0
while IFS= read -r flow <&3; do
  [ -n "$flow" ] || continue
  position=$((position + 1))
  slug=$(printf '%s' "${flow%.yaml}" | sed 's|/|__|g')
  flow_dir="$output_dir/artifacts/$slug"
  started=$SECONDS
  attempts=1
  ensure_device "$flow"
  if run_attempt "$flow" "$flow_dir/attempt-1"; then
    status="pass"
  else
    attempts=2
    ensure_device "$flow"
    printf '  retry %s\n' "$flow"
    if run_attempt "$flow" "$flow_dir/attempt-2"; then
      status="flaky"
    else
      status="fail"
    fi
  fi
  cp "$flow_dir/attempt-$attempts/junit.xml" "$output_dir/junit/$slug.xml"
  [ "$status" = "pass" ] && rm -rf "$flow_dir"
  seconds=$((SECONDS - started))
  printf '%s\t%s\t%s\t%s\n' "$status" "$attempts" "$seconds" "$flow" >>"$results"
  printf '[%s/%s] %-5s %4ss  %s\n' "$position" "$shard_count" "$status" "$seconds" "$flow"
done 3<<EOF
$shard_flows
EOF

{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n'
  find "$output_dir/junit" -name '*.xml' | LC_ALL=C sort | while IFS= read -r file; do
    sed -e '/<?xml[^>]*?>/d' -e 's|<testsuites[^>]*>||g' -e 's|</testsuites>||g' "$file"
  done
  printf '</testsuites>\n'
} >"$output_dir/junit.xml"

count_status() {
  awk -F '\t' -v s="$1" '$1 == s { n++ } END { print n + 0 }' "$results"
}
passed=$(count_status pass)
flaky=$(count_status flaky)
failed=$(count_status fail)

{
  printf '{\n'
  printf '  "platform": "%s",\n' "$platform"
  printf '  "device": "%s",\n' "$(json_escape "$device")"
  printf '  "shard": "%s/%s",\n' "$shard_index" "$shard_total"
  printf '  "includeBlocked": %s,\n' "$([ "$include_blocked" -eq 1 ] && echo true || echo false)"
  printf '  "counts": { "pass": %s, "flaky": %s, "fail": %s },\n' "$passed" "$flaky" "$failed"
  printf '  "deviceRecoveries": %s,\n' "$recoveries"
  printf '  "flows": ['
  separator=""
  while IFS="$(printf '\t')" read -r status attempts seconds flow; do
    printf '%s\n    { "flow": "%s", "status": "%s", "attempts": %s, "seconds": %s }' \
      "$separator" "$(json_escape "$flow")" "$status" "$attempts" "$seconds"
    separator=","
  done <"$results"
  printf '\n  ]\n}\n'
} >"$output_dir/summary.json"

printf '\n%-6s %-9s %8s  %s\n' "STATUS" "ATTEMPTS" "SECONDS" "FLOW"
awk -F '\t' '{ printf "%-6s %-9s %8s  %s\n", $1, $2, $3, $4 }' "$results"
rm -f "$results"
printf '\npassed %s, flaky %s, failed %s (shard %s/%s)\n' "$passed" "$flaky" "$failed" "$shard_index" "$shard_total"
[ "$recoveries" -eq 0 ] || printf 'device recoveries: %s\n' "$recoveries"
printf 'summary: %s\n' "$output_dir/summary.json"

[ "$failed" -eq 0 ] || exit 1
exit 0
