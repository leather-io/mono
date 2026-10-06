#!/bin/bash
set -euo pipefail

repo="$GITHUB_REPOSITORY"
base_sha="$GITHUB_SHA"
base_branch="dev"
branch="bot/audit-fix"
report="tmp/audit-fix-report.md"
files=(package.json pnpm-lock.yaml)

function find_open_pr() {
  gh pr list --repo "$repo" --head "$branch" --base "$base_branch" --state open \
    --json number --jq '.[0].number // empty'
}

function find_branch_sha() {
  gh api "repos/$repo/git/matching-refs/heads/$branch" \
    --jq ".[] | select(.ref == \"refs/heads/$branch\") | .object.sha"
}

function local_blobs() {
  local file
  for file in "${files[@]}"; do
    echo "$file $(git hash-object "$file")"
  done | sort
}

function branch_blobs() {
  gh api "repos/$repo/git/trees/$1" \
    --jq '.tree[] | select(.path == "package.json" or .path == "pnpm-lock.yaml") | "\(.path) \(.sha)"' | sort
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
  local base_tree manifest_blob lockfile_blob tree
  base_tree=$(gh api "repos/$repo/git/commits/$base_sha" --jq '.tree.sha')
  manifest_blob=$(create_blob package.json)
  lockfile_blob=$(create_blob pnpm-lock.yaml)
  tree=$(jq -n --arg base "$base_tree" --arg manifest "$manifest_blob" --arg lockfile "$lockfile_blob" '{
    base_tree: $base,
    tree: [
      {path: "package.json", mode: "100644", type: "blob", sha: $manifest},
      {path: "pnpm-lock.yaml", mode: "100644", type: "blob", sha: $lockfile}
    ]
  }' | gh api "repos/$repo/git/trees" --input - --jq '.sha')
  jq -n --arg message "$TITLE" --arg tree "$tree" --arg parent "$base_sha" \
    '{message: $message, tree: $tree, parents: [$parent]}' |
    gh api "repos/$repo/git/commits" --input - --jq '.sha'
}

pr=$(find_open_pr)
branch_sha=$(find_branch_sha)

if [ "$CHANGED" != "true" ] && [ "$UNRESOLVED" = "0" ]; then
  if [ -n "$pr" ]; then
    gh pr close "$pr" --repo "$repo" --delete-branch \
      --comment "Closing: the latest \`repo:audit-fix\` run on \`$base_branch\` reports nothing to fix."
  elif [ -n "$branch_sha" ]; then
    gh api -X DELETE "repos/$repo/git/refs/heads/$branch" --silent
  fi
  exit 0
fi

if [ -n "$branch_sha" ] && [ "$(branch_blobs "$branch_sha")" = "$(local_blobs)" ]; then
  echo "Branch $branch already has this content."
else
  commit_sha=$(create_commit)
  if [ -z "$branch_sha" ]; then
    gh api "repos/$repo/git/refs" -f "ref=refs/heads/$branch" -f "sha=$commit_sha" --silent
  else
    gh api -X PATCH "repos/$repo/git/refs/heads/$branch" -f "sha=$commit_sha" -F force=true --silent
  fi
fi

if [ -z "$pr" ]; then
  gh pr create --repo "$repo" --head "$branch" --base "$base_branch" --title "$TITLE" --body-file "$report"
else
  gh pr edit "$pr" --repo "$repo" --title "$TITLE" --body-file "$report"
fi
