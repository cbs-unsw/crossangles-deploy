# CrossAngles

Welcome to CrossAngles! This is the deployment repository for CrossAngles.

## Setting up the repository and submodules

```bash
git submodule update --init --recursive

./ci.sh install
```

## Running the scraper locally

The scraper usually runs on AWS Lambda, but for dev you can run it locally.

```bash
cd scraper/scraper/unsw
npx tsx launchTimetable.ts
```

## Running tests

To run the unit tests:

```bash
# Unit tests for web app
./ci.sh test app

# Unit tests for scraper
./ci.sh test scraper

# All tests
./ci.sh test
```

NB: `ci.sh` is a legacy shell script, it will be replaced some day
