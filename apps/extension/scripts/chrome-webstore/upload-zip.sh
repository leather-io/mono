#!/bin/sh
set -eu

ZIP="$1"

response=$(curl --silent --show-error --fail \
  -X POST "https://chromewebstore.googleapis.com/upload/v2/publishers/${PUBLISHER_ID}/items/${EXTENSION_ID}:upload" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "X-Goog-Upload-Protocol: raw" \
  -T "$ZIP")

state=$(printf '%s' "$response" | jq -r '.uploadState')

case "$state" in
  SUCCEEDED)
    echo "Chrome Web Store upload succeeded" >&2
    ;;
  IN_PROGRESS)
    echo "Chrome Web Store upload accepted but still processing — publish may fail if not ready" >&2
    ;;
  *)
    echo "Chrome Web Store upload failed:" >&2
    printf '%s\n' "$response" >&2
    exit 1
    ;;
esac
