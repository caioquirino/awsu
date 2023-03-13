#!/bin/bash
set -e

versionBumpUp() {
npx nx run-many --parallel=1 --target=version --all -- --releaseAs=$1 --skipCommit=true
git commit -m 'Release: Version bump-up' packages/*/package.json packages/*/CHANGELOG.md
git push
}

publish() {
  local package=$1
  npx nx build "${package}"
  cd "packages/${package}"
  npm publish --access public
  cd -
}

# versionBumpUp "major"
versionBumpUp "minor"
# versionBumpUp "patch"
publish core
publish cli
