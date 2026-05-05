#!/bin/sh
set -eu

KEY_FILE=$(mktemp)
trap 'rm -f "$KEY_FILE"' EXIT
printf '%s' "$SERVICE_ACCOUNT_KEY" | jq -r '.private_key' > "$KEY_FILE"

b64url() { openssl base64 -A | tr -- '+/' '-_' | tr -d '='; }

HEADER=$(printf '%s' '{"alg":"RS256","typ":"JWT"}' | b64url)
CLAIMS=$(printf '%s' "$SERVICE_ACCOUNT_KEY" | jq -c \
  '{iss: .client_email,
    scope: "https://www.googleapis.com/auth/chromewebstore",
    aud: "https://oauth2.googleapis.com/token",
    iat: (now|floor),
    exp: ((now|floor) + 3600)}' | b64url)
UNSIGNED="${HEADER}.${CLAIMS}"
SIGNATURE=$(printf '%s' "$UNSIGNED" | openssl dgst -sha256 -sign "$KEY_FILE" -binary | b64url)

response=$(curl --silent --show-error --fail \
  -X POST "https://oauth2.googleapis.com/token" \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  --data-urlencode "assertion=${UNSIGNED}.${SIGNATURE}")
token=$(printf '%s' "$response" | jq -r '.access_token')

if [ -z "$token" ] || [ "$token" = "null" ]; then
  echo "Failed to obtain Chrome Web Store access token" >&2
  exit 1
fi

printf '%s' "$token"
