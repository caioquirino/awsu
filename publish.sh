#!/bin/bash
set -e

versionBumpUp() {
npx nx run-many --parallel=1 --target=version --all -- --releaseAs=$1 --skipCommit=true
git commit -m 'Release: Version bump-up' packages/*/package.json packages/*/CHANGELOG.md
}

publish() {
  local package=$1
  local publishedPackageName=$2
  npx nx build "${package}"

  if [  "${package}" == "cli" ]; then
    cp -f README.md dist/packages/cli/README.md
  fi

  cd "dist/packages/${package}"
  npm pkg set "name"="${publishedPackageName}"
  npm publish --access public
  cd - > /dev/null
}


# versionBumpUp "major"
versionBumpUp "minor"
# versionBumpUp "patch"

./generateDocs.sh
git commit -m 'Release: Generate docs' README.md



cd "dist/packages/cli"
packageVersion=$(npm pkg get "version")
cd - > /dev/null
git tag -a "v${packageVersion}" -m "Release version ${packageVersion}"
git push

publish core "@awsu/core"
publish cli "@awsu/cli"
publish cli "awsu-cli"
