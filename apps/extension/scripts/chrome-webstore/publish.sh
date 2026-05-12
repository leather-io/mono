#!/bin/sh
set -eu

response=$(curl --silent --show-error \
  -X POST "https://chromewebstore.googleapis.com/v2/publishers/${PUBLISHER_ID}/items/${EXTENSION_ID}:publish" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}')

state=$(printf '%s' "$response" | jq -r '.state')

case "$state" in
  PUBLISHED|PENDING_REVIEW|STAGED)
    echo "Chrome Web Store publish request accepted (state: $state)" >&2
    ;;
  *)
    echo "Chrome Web Store publish failed:" >&2
    printf '%s\n' "$response" >&2
    exit 1
    ;;
esac
