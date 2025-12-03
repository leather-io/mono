#!/bin/bash
set -e

echo "Validating workflow name properties..."

invalid_files=()

for file in .github/workflows/*.yml .github/workflows/*.yaml; do
  if [ -f "$file" ]; then
    workflow_name=$(grep -E '^name:' "$file" | head -n 1 | sed 's/^name:[[:space:]]*//' | tr -d '"' | tr -d "'")

    if [ -z "$workflow_name" ]; then
      invalid_files+=("$file:missing")
      echo "❌ Missing 'name' property in: $file"
      continue
    fi

    if ! echo "$workflow_name" | grep -qE '^(repo|web|mobile|extension|packages):[a-z][a-z0-9_-]*$'; then
      invalid_files+=("$file")
      echo "❌ Invalid workflow name in $file: '$workflow_name'"
      echo "   Expected format: (repo|web|mobile|extension|packages):[lowercase-kebab-case]"
    else
      echo "✅ Valid workflow name in $file: '$workflow_name'"
    fi
  fi
done

if [ ${#invalid_files[@]} -ne 0 ]; then
  echo ""
  echo "Error: Found ${#invalid_files[@]} workflow(s) with invalid 'name' properties."
  echo "Workflow 'name' must follow the naming convention:"
  echo "  - Start with one of: repo, web, mobile, extension, packages"
  echo "  - Followed by a colon (:)"
  echo "  - Then lowercase letters, numbers, hyphens, or underscores"
  echo "  - Examples: repo:workflow-checks, web:deploy, mobile:build-preview"
  exit 1
fi

echo ""
echo "All workflow names are valid!"
