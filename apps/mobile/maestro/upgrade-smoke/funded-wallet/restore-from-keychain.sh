#!/bin/bash
set -u

DEVICE="${1:?usage: restore-from-keychain.sh <simulator udid> <keychain service name>}"
SERVICE="${2:?usage: restore-from-keychain.sh <simulator udid> <keychain service name>}"
DEV_CLIENT_URL="${DEV_CLIENT_URL:-exp+leather-wallet-mobile://?__expo_url=http%3A%2F%2Flocalhost%3A8081&__expo_disable_fab=1&__expo_disable_onboarding=1}"
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
MARK="$WORK/.mark"
touch "$MARK"
export MAESTRO_CLI_NO_ANALYTICS=1

cleanup() {
  unset MAESTRO_SECRET_KEY
  if [ -d "$HOME/.maestro/tests" ]; then
    find "$HOME/.maestro/tests" -mindepth 1 -maxdepth 1 -newer "$MARK" -exec rm -rf {} +
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

run_flow() {
  (cd "$WORK" && maestro --udid "$DEVICE" test --debug-output "$WORK/debug" --test-output-dir "$WORK/out" "$@" >/dev/null 2>&1)
}

if ! run_flow -e DEV_CLIENT_URL="$DEV_CLIENT_URL" "$HERE/to-restore-screen.yaml"; then
  echo "could not reach the restore screen"
  exit 1
fi

MAESTRO_SECRET_KEY="$(security find-generic-password -a "$USER" -s "$SERVICE" -w 2>/dev/null)"
if [ -z "$MAESTRO_SECRET_KEY" ]; then
  echo "keychain item '$SERVICE' not found or empty"
  exit 2
fi
WORDS="$(printf '%s' "$MAESTRO_SECRET_KEY" | wc -w | tr -d ' ')"
echo "secret key has $WORDS words"
export MAESTRO_SECRET_KEY

run_flow "$HERE/enter-secret-key.yaml"
STATUS=$?
unset MAESTRO_SECRET_KEY
rm -rf "$WORK/debug" "$WORK/out"
if [ "$STATUS" -ne 0 ]; then
  echo "restore failed; the key may still be on screen, do not take a screenshot"
  xcrun simctl terminate "$DEVICE" io.leather.mobilewallet >/dev/null 2>&1
  exit "$STATUS"
fi

if ! run_flow "$HERE/after-restore.yaml"; then
  echo "restored, but did not reach Home"
  exit 3
fi
echo "wallet restored"
