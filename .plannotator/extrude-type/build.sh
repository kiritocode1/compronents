#!/bin/sh
# Lab-only: bundles the TypeScript sources for the static preview page.
set -e
cd "$(dirname "$0")"
bun build src/play-entry.ts --outfile dist/play.js --format iife --target browser --minify >/dev/null
