#!/usr/bin/env bash
set -euo pipefail

# Test and build scraper
npx jest
npm run build
./node_modules/.bin/webpack

# Apply infra changes
(
  cd infra
  terraform apply -auto-approve
)
