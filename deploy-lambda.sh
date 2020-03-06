#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d $1 ]]; then
  2>&1 echo "Could not find directory \"$1\""
  exit 1
fi

cd $1
(
  # Test and build
  NO_WATCH=1 npm test
  npm run build
  ./node_modules/.bin/webpack

  # Apply infra changes
  (
    cd infra
    terraform apply -auto-approve
  )
)
