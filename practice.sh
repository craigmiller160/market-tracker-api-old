#!/bin/sh

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

old_tracked=$(git status --porcelain | grep -E '^(A|M).*$' | sed -E 's/(A|M) *//g')

yarn lint

new_untracked=$(git status --porcelain | grep -E '^\SM.*$' | sed 's/\SM //g')

for newFile in $new_untracked; do
  match=false
  for oldFile in $old_tracked; do
    if [ $oldFile = $newFile ]; then
      match=true
      break
    fi
  done

  if [ $match = true ] ; then
    printf "${GREEN}Adding lint formatting changes: $newFile\n${NC}"
    git add $newFile
  fi
done