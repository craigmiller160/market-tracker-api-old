#!/bin/sh

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

old_tracked=$(git status --porcelain | grep -E '^(A|M).*$' | sed -E 's/(A|M) *//g')

echo $old_tracked