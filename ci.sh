#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

COMMAND_LIST="install|build|lint|test|run|scrape"
COMMAND=$1

if [[ ! $COMMAND =~ ^$COMMAND_LIST$ ]]; then
  echo "Usage: $0 $COMMAND_LIST [...args]"
  exit 1
fi

run_for_each () {
  for module in app scraper contact
  do
    (
      cd $module
      $1 ${@:2}
    )
  done
}

if [[ $COMMAND == install ]]; then
  run_for_each yarn install
fi

if [[ $COMMAND == build ]]; then
  if [[ ${2:-} == app ]]; then
    ./build-app.sh
  elif [[ -n "${2:-}" ]]; then
    (cd $2; yarn build -- ${@:3})
  else
    run_for_each yarn build
  fi
fi

if [[ $COMMAND == lint ]]; then
  echo "Running lint command for app"
  (
    cd app
    pwd
    ls
    yarn lint
  )
  echo "Running lint command for scraper"
  (
    cd scraper
    pwd
    ls
    yarn lint
  )
fi

if [[ $COMMAND == test ]]; then
  if [[ -n "${2:-}" ]]; then
    (cd $2; yarn test)
  else
    (
      export CI=${CI:-1}
      run_for_each yarn test
    )
  fi
fi

if [[ $COMMAND == run ]]; then
  if [[ ${2:-} == --prod ]]; then
    cd app
    npx serve build
  else
    cd app
    yarn start
  fi
fi

if [[ $COMMAND == scrape ]]; then
  mkdir -p app/public/unsw
  (cd scraper; yarn start ${@:2})
fi
