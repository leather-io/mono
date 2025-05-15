#!/bin/bash

# Change to the directory of this script
cd "$(dirname "$0")"

# Run the fetch posts script
echo "Fetching posts from CMS..."
pnpm fetch-posts

echo "Done!" 