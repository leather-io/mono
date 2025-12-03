#!/bin/bash
set +e

echo "Validating step name properties..."
echo ""

invalid_steps=()
error_messages=""

for file in .github/workflows/*.yml .github/workflows/*.yaml; do
  if [ -f "$file" ]; then
    line_num=0
    file_has_errors=false

    while IFS= read -r line; do
      ((line_num++))

      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]+name:[[:space:]]*(.+)$ ]]; then
        step_name="${BASH_REMATCH[1]}"
        step_name=$(echo "$step_name" | sed 's/^["'"'"']//' | sed 's/["'"'"']$//')

        # Check if step name violates kebab-case
        # Remove template variables before checking
        step_name_without_templates=$(echo "$step_name" | sed 's/${{[^}]*}}//g')

        # Check the remaining text (after removing templates) for violations
        if [[ "$step_name_without_templates" =~ [A-Z] ]] || [[ "$step_name_without_templates" =~ [[:space:]] ]] || [[ "$step_name_without_templates" =~ _ ]]; then
          invalid_steps+=("$file:$line_num:$step_name")

          if [ "$file_has_errors" = false ]; then
            error_messages="${error_messages}File: $file\n"
            file_has_errors=true
          fi

          error_messages="${error_messages}  ❌ Line $line_num: '$step_name'\n"
        fi
      fi
    done < "$file"

    if [ "$file_has_errors" = true ]; then
      error_messages="${error_messages}\n"
    fi
  fi
done

if [ ${#invalid_steps[@]} -ne 0 ]; then
  echo -e "$error_messages"
  echo "========================================="
  echo "Error: Found ${#invalid_steps[@]} step(s) with invalid names."
  echo ""
  echo "Step names must follow kebab-case convention:"
  echo "  - Start with a lowercase letter"
  echo "  - Contain only lowercase letters, numbers, and hyphens"
  echo "  - No underscores, uppercase letters, or spaces"
  echo "  - Examples: build, checkout-code, deploy-production"
  exit 1
fi

echo "✅ All step names are valid!"
