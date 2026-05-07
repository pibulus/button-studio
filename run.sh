#!/bin/bash
# ButtonSpa Helper Script
# Makes it easy to run the dev server from anywhere

echo "Starting ButtonSpa..."
cd "$(dirname "$0")"
~/.deno/bin/deno task start
