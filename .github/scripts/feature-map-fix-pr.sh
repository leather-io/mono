#!/bin/bash
set -euo pipefail
shopt -s inherit_errexit

repo="$GITHUB_REPOSITORY"
base_sha="$GITHUB_SHA"
base_branch="dev"
branch="bot/feature-map-fix"
title="fix(tools): correct feature-map entries flagged by the weekly review"
report="tmp/feature-map-review.md"
body="tmp/feature-map-fix-body.md"

mapfile -t files < <(git diff --name-only)

function find_open_pr() {
  gh pr list --repo "$repo" --head "$branch" --base "$base_branch" --state open \
    --json number,isCrossRepository --jq 'map(select(.isCrossRepository | not)) | .[0].number // empty'
}

function find_branch_sha() {
  gh api "repos/$repo/git/matching-refs/heads/$branch" \
    --jq ".[] | select(.ref == \"refs/heads/$branch\") | .object.sha"
}

function create_blob() {
  local sha
  sha=$(jq -Rs '{content: ., encoding: "utf-8"}' "$1" | gh api "repos/$repo/git/blobs" --input - --jq '.sha')
  if [ "$sha" != "$(git hash-object "$1")" ]; then
    echo "Blob created for $1 does not match the local file" >&2
    return 1
  fi
  echo "$sha"
}

function create_commit() {
  local base_tree entries file blob tree
  base_tree=$(gh api "repos/$repo/git/commits/$base_sha" --jq '.tree.sha')
  entries='[]'
  for file in "${files[@]}"; do
    blob=$(create_blob "$file")
    entries=$(jq -c --arg path "$file" --arg sha "$blob" \
      '. + [{path: $path, mode: "100644", type: "blob", sha: $sha}]' <<< "$entries")
  done
  tree=$(jq -n --arg base "$base_tree" --argjson entries "$entries" '{base_tree: $base, tree: $entries}' |
    gh api "repos/$repo/git/trees" --input - --jq '.sha')
  jq -n --arg message "$title" --arg tree "$tree" --arg parent "$base_sha" \
    '{message: $message, tree: $tree, parents: [$parent]}' |
    gh api "repos/$repo/git/commits" --input - --jq '.sha'
}

pr=$(find_open_pr)
branch_sha=$(find_branch_sha)

if [ ${#files[@]} -eq 0 ]; then
  if [ -n "$pr" ]; then
    gh pr close "$pr" --repo "$repo" --delete-branch \
      --comment "Closing: the latest \`repo:feature-map-fix\` run on \`$base_branch\` found nothing to fix."
  elif [ -n "$branch_sha" ]; then
    gh api -X DELETE "repos/$repo/git/refs/heads/$branch" --silent
  fi
  exit 0
fi

{
  echo "## Weekly feature-map review"
  echo
  echo "Statements in \`apps/extension/tests/feature-map\` that the weekly review found false against \`$base_branch\` at $base_sha, with the fix applied. Every row cites the line the reviewer checked; re-read those lines before merging, and open an issue for anything under \"Needs a code change\"."
  echo
  cat "$report"
  echo
  echo "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
} > "$body"

commit_sha=$(create_commit)
if [ -z "$branch_sha" ]; then
  gh api "repos/$repo/git/refs" -f "ref=refs/heads/$branch" -f "sha=$commit_sha" --silent
else
  gh api -X PATCH "repos/$repo/git/refs/heads/$branch" -f "sha=$commit_sha" -F force=true --silent
fi

if [ -z "$pr" ]; then
  gh pr create --repo "$repo" --head "$branch" --base "$base_branch" --title "$title" --body-file "$body"
else
  gh pr edit "$pr" --repo "$repo" --title "$title" --body-file "$body"
fi
