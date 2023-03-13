#!/bin/bash
set -e

npx nx run-many --target=version --all -- --releaseAs=minor
git push

publish() {
  local package=$1
  npx nx build "${package}"
  cd "packages/${package}"
  npm publish --access public
  cd -
}

publish core
publish cli
