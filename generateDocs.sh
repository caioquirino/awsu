#!/bin/bash
set -e

npx nx build cli
cd "packages/cli"
ts-node-dev -r tsconfig-paths/register --project tsconfig.json src/lib/genDocs.ts
cd - > /dev/null
