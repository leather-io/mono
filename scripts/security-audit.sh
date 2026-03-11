#!/usr/bin/env bash
set -euo pipefail

# ── Environment setup for cron (fnm + pnpm) ──
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.local/bin"
eval "$(fnm env --shell bash)"
fnm use default --silent-if-unchanged

REPO_DIR="$HOME/dev/mono"
LOG_DIR="$HOME/.local/share/leather"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/security-audit.log"
BRANCH_PREFIX="fix/security-audit"
DATE_SUFFIX="$(date +%Y%m%d-%H%M)"
BRANCH_NAME="${BRANCH_PREFIX}-${DATE_SUFFIX}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

cd "$REPO_DIR"

log "Starting security audit"

# Ensure we're on dev with latest
git fetch origin dev
git checkout dev
git pull origin dev

# Run audit and capture output
AUDIT_OUTPUT=$(pnpm audit --audit-level=moderate 2>&1) || true

# pnpm audit exits 0 when clean
if echo "$AUDIT_OUTPUT" | grep -q "No known vulnerabilities found"; then
    log "No vulnerabilities found. Nothing to do."
    exit 0
fi

log "Vulnerabilities detected. Attempting fix..."
log "$AUDIT_OUTPUT"

# Create fix branch
git checkout -b "$BRANCH_NAME" dev

# Attempt to fix
pnpm audit --fix >> "$LOG_FILE" 2>&1 || true

# Remove overrides for dev/build-tool packages that can break the build
# These are devDependencies whose vulnerabilities don't affect end users
log "Removing dev-tool overrides that may break the build..."
node "$REPO_DIR/scripts/remove-devtool-overrides.cjs" 2>&1 | tee -a "$LOG_FILE"

pnpm install >> "$LOG_FILE" 2>&1

# Remove stale overrides that are no longer needed
log "Checking for stale pnpm overrides..."
node "$REPO_DIR/scripts/cleanup-stale-overrides.cjs" 2>&1 | tee -a "$LOG_FILE"
pnpm install >> "$LOG_FILE" 2>&1

# Check if dependency files actually changed
if git diff --quiet -- '*.json' 'pnpm-lock.yaml'; then
    log "pnpm audit --fix made no dependency changes. Manual intervention may be needed."
    git checkout dev
    exit 0
fi

# Stage only dependency-related files
git add ':(glob)**/package.json' pnpm-lock.yaml

git commit -m "fix(deps): upgrade packages to resolve security vulnerabilities"
git push -u origin "$BRANCH_NAME"

# Create PR
gh pr create \
    --base dev \
    --title "fix(deps): resolve security audit vulnerabilities" \
    --body "$(cat <<EOF
## Summary
- Automated security audit detected vulnerabilities in dependencies
- Ran \`pnpm audit --fix\` to upgrade affected packages

## Audit output
\`\`\`
${AUDIT_OUTPUT}
\`\`\`

## Test plan
- [ ] CI passes
- [ ] Verify no breaking changes from dependency upgrades
- [ ] Run \`pnpm audit\` to confirm vulnerabilities are resolved

Generated automatically by security-audit.sh cron job
EOF
)"

PR_URL=$(gh pr view "$BRANCH_NAME" --json url -q .url 2>/dev/null || echo "unknown")
log "PR created: $PR_URL"

# Return to dev — discard any untracked/unstaged changes (e.g. node_modules churn)
git checkout dev

log "Done."
