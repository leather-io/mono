#!/usr/bin/env bash
set -euo pipefail

skills_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$skills_dir"
rm -f new-issue.zip
zip -rq new-issue.zip new-issue -x '*.DS_Store'
echo "$skills_dir/new-issue.zip"
