#!/bin/bash
set -e

versionBumpUp() {
npx nx run-many --parallel=1 --target=version --all -- --releaseAs=$1 --skipCommit=true
git commit -m 'Release: Version bump-up' packages/*/package.json packages/*/CHANGELOG.md
git push
}

publish() {
  local package=$1
  local publishedPackageName=$2
  npx nx build "${package}"
  cd "dist/packages/${package}"
  npm pkg set "name"="${publishedPackageName}"
  npm publish --access public
  cd -
}

# versionBumpUp "major"
versionBumpUp "minor"
# versionBumpUp "patch"

publish core "@awsu/core"
cp -f README.md dist/packages/cli/README.md
publish cli "@awsu/cli"
publish cli "awsu-cli"
