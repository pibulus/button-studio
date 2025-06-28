#!/bin/bash
# ButtonStudio Helper Script
# Makes it easy to run the dev server from anywhere

echo "🎨 Starting ButtonStudio..."
cd "$(dirname "$0")"
~/.deno/bin/deno task start