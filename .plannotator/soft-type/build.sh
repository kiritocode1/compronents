#!/bin/sh
# Lab-only: bundles the TypeScript sources for the static preview pages.
set -e
cd "$(dirname "$0")"
for entry in "$@"; do
  bun build "src/$entry-entry.ts" --outfile "dist/$entry.js" --format iife --target browser >/dev/null
done
