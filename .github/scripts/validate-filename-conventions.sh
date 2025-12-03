#!/bin/bash
set -e

echo "Validating workflow filenames match their name property..."

invalid_files=()

for file in .github/workflows/*.yml .github/workflows/*.yaml; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .yml)
    filename=$(basename "$filename" .yaml)

    workflow_name=$(grep -E '^name:' "$file" | head -n 1 | sed 's/^name:[[:space:]]*//' | tr -d '"' | tr -d "'")

    if [ -z "$workflow_name" ]; then
      echo "⚠️  Skipping $file: no name property found"
      continue
    fi

    expected_filename="${workflow_name}.yml"

    if [ "$filename.yml" != "$expected_filename" ] && [ "$filename.yaml" != "$expected_filename" ]; then
      invalid_files+=("$file")
      echo "❌ Filename mismatch in $file"
      echo "   Filename: '$filename.yml'"
      echo "   Workflow name: '$workflow_name'"
      echo "   Expected filename: '$expected_filename'"
      echo ""
    else
      echo "✅ Valid filename for $file: matches '$workflow_name'"
    fi
  fi
done

if [ ${#invalid_files[@]} -ne 0 ]; then
  echo ""
  echo "Error: Found ${#invalid_files[@]} workflow file(s) with mismatched names."
  echo "Workflow filenames must match their 'name:' property exactly."
  echo "Example: If name is 'repo:workflow-checks', filename must be 'repo:workflow-checks.yml'"
  exit 1
fi

echo ""
echo "All workflow filenames are valid!"
