#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

outputs="$(./tf.sh output -json)"
environment=$(echo "$outputs" | jq -r ".environment.value")
contact_endpoint=$(echo "$outputs" | jq -r ".contact_endpoint.value" | sed 's@\.com/.*@.com@')
data_uri=$(echo "$outputs" | jq -r ".scraper_endpoint.value")
app_bucket=$(echo "$outputs" | jq -r ".app_bucket.value")

if [[ -z $app_bucket || $app_bucket == null ]]; then
  echo "App bucket has not been deployed yet. Skipping building app."
  exit 0
fi

# Check app HEAD is at the correct version
(
  app_head_commit="$(cd ../app && git rev-parse HEAD)"
  app_tracked_commit="$(git rev-parse @:app)"
  if [[ "$app_head_commit" != "$app_tracked_commit" ]]; then
    1>&2 echo \
      "CrossAngles app HEAD is at $app_head_commit," \
      "but the submodule is tracking at $app_tracked_commit"
    1>&2 echo "Please update the submodule and commit the change before deploying"
    exit 1
  fi
)

# Check versions to see if we need to re-build and re-deploy
version=$(./version.sh app)
s3_version_file="s3://$app_bucket/versions/$version"
existing_files=$(aws s3 ls $s3_version_file || true)
if [[ -n $existing_files && -z ${FORCE_UPDATE:-} ]]; then
  echo "No changes to app, skipping build and deploy."
  echo "Set the FORCE_UPDATE env variable to force an update."
  echo "Already built version is: $version"
  exit 0
fi

environment_hyphens=$(echo $environment | sed 's/./-/g')
echo "Deploying app to $environment"
echo "-----------------$environment_hyphens"
export VITE_BASE_URL=crossangles.app
if [[ $environment != "production" ]]; then
  export VITE_BASE_URL=$environment.$VITE_BASE_URL
fi
export VITE_STAGE_NAME=$environment
export VITE_CONTACT_ENDPOINT=$contact_endpoint
export VITE_DATA_ROOT_URI=$data_uri

max_age=0
if [[ $environment == production ]]; then
  max_age=7200
fi

cd ../app
for campus in $@
do
  if [[ $campus != "unsw" ]]; then
    VITE_BASE_URL=$campus.$VITE_BASE_URL
  fi

  echo "Building app for $campus"
  VITE_CAMPUS=$campus yarn build

  campus_key_base="s3://$app_bucket/$campus"
  s3_app_params="--acl public-read --cache-control max-age=$max_age"

  echo "Copying to $campus_key_base/"
  aws s3 cp build/ "$campus_key_base/" --recursive $s3_app_params
  aws s3 cp build/index.html "$campus_key_base/timetable/" $s3_app_params

  echo "Creating version marker at s3://$app_bucket/versions/$version"
  touch version
  aws s3 cp version "s3://$app_bucket/versions/$version"
  rm version

  echo "Finished deployment for $campus"
  echo "Version is $version"
done
