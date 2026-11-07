#!/usr/bin/env bash

status_value() {
  local file="$1"
  local key="$2"
  if [ -f "$file" ]; then
    awk -v key="$key" '
      /^(STATE|COMMIT|WHY|HOW|TESTED):/ {
        inside = (index($0, key ":") == 1)
        if (inside) {
          rest = substr($0, length(key) + 2)
          sub(/^[[:space:]]+/, "", rest)
          if (rest != "") print rest
        }
        next
      }
      inside && NF { print }
    ' "$file"
  fi
}

status_state() {
  status_value "$1" STATE | head -n 1 | tr -d '[:space:]'
}

status_subject() {
  status_value "$1" COMMIT | head -n 1
}

status_bullets() {
  status_value "$1" "$2" | sed -e 's/^[[:space:]]*[-*][[:space:]]*//' -e 's/^/- /'
}

write_pr_body() {
  local out="$1"
  local status_file="$2"
  local issues="$3"
  local issue
  mkdir -p "$(dirname "$out")"
  {
    for issue in $(printf '%s' "$issues" | tr ',' ' '); do
      printf 'Closes #%s\n' "$issue"
    done
    printf '\n## Why\n\n'
    status_bullets "$status_file" WHY | head -n 3
    printf '\n## How\n\n'
    status_bullets "$status_file" HOW | head -n 3
    printf '\n## Tested\n\n'
    status_bullets "$status_file" TESTED
  } > "$out"
}
