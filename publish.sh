#!/bin/bash
set -e

publish() {
  local package=$1
  npx nx build "${package}"
  cd "packages/${package}"
  npm publish --access public
  cd -
}

publish core
publish cli
