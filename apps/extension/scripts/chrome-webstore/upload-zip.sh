#!/bin/sh
set -eu

ZIP="$1"

response=$(curl --silent --show-error --fail \
  -X POST "https://chromewebstore.googleapis.com/upload/v2/publishers/${PUBLISHER_ID}/items/${EXTENSION_ID}:upload" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "X-Goog-Upload-Protocol: raw" \
  -T "$ZIP")

state=$(printf '%s' "$response" | jq -r '.uploadState')

if [ "$state" != "SUCCEEDED" ]; then
  echo "Chrome Web Store upload failed:" >&2
  printf '%s\n' "$response" >&2
  exit 1
fi

echo "Chrome Web Store upload succeeded" >&2
