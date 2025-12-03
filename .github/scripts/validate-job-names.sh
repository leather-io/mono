#!/bin/bash
set +e

echo "Validating job identifiers and display names..."

invalid_jobs=()
line_num=0

for file in .github/workflows/*.yml .github/workflows/*.yaml; do
  if [ -f "$file" ]; then
    echo "Checking $file..."

    in_jobs_section=false
    current_job=""
    line_num=0

    while IFS= read -r line; do
      ((line_num++))

      if [[ "$line" =~ ^jobs: ]]; then
        in_jobs_section=true
        continue
      fi

      if [[ $in_jobs_section == true ]]; then
        if [[ "$line" =~ ^[^\ ] && ! "$line" =~ ^jobs: ]]; then
          in_jobs_section=false
        fi

        # Check job identifier
        if [[ "$line" =~ ^\ \ ([a-zA-Z0-9_-]+): ]]; then
          job_name="${BASH_REMATCH[1]}"
          current_job="$job_name"

          if ! echo "$job_name" | grep -qE '^[a-z][a-z0-9-]*$'; then
            invalid_jobs+=("$file:$line_num:identifier:$job_name")
            echo "❌ Invalid job identifier in $file (line $line_num): '$job_name'"
            echo "   Expected format: kebab-case"
          fi
        fi

        # Check job display name
        if [[ -n "$current_job" ]] && [[ "$line" =~ ^\ \ \ \ name:[[:space:]]*(.+)$ ]]; then
          display_name="${BASH_REMATCH[1]}"

          # Remove quotes
          display_name=$(echo "$display_name" | sed 's/^["'"'"']//' | sed 's/["'"'"']$//')

          # Remove template variables before checking
          display_name_without_templates=$(echo "$display_name" | sed 's/\${{[^}]*}}//g')

          if [[ "$display_name_without_templates" =~ [A-Z] ]] || [[ "$display_name_without_templates" =~ [[:space:]] ]] || [[ "$display_name_without_templates" =~ _ ]]; then
            invalid_jobs+=("$file:$line_num:display:$display_name")
            echo "❌ Invalid job display name in $file (line $line_num): '$display_name'"
            echo "   Expected format: kebab-case"
          fi

          current_job=""
        fi
      fi
    done < "$file"
  fi
done

if [ ${#invalid_jobs[@]} -ne 0 ]; then
  echo ""
  echo "Error: Found ${#invalid_jobs[@]} job(s) with invalid names."
  echo "Job identifiers and display names must follow kebab-case:"
  echo "  - Start with a lowercase letter"
  echo "  - Contain only lowercase letters, numbers, and hyphens"
  echo "  - No underscores, uppercase letters, or spaces"
  echo "  - Examples: build, test-unit, deploy-production"
  exit 1
fi

echo ""
echo "All job names are valid!"
