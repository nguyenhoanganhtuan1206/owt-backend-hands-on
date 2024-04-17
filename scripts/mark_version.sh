#!/usr/bin/env bash

# Exit script if command fails or uninitialized variables used
set -euo pipefail

# == Check current branch to create release version tag
BRANCH_TO_MARK_TAG="main"
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH_TO_MARK_TAG" ]; then
  echo "Current branch not match with branch required";
  exit 1;
fi

# ==================================
# Create git tag for new version
# ==================================
GIT_TAG_RELEASE="v1.1.3"
# == Define tag release
if [ -z "$GIT_TAG_RELEASE" ]; then
  echo "GIT_TAG_RELEASE is empty"
  exit 1
else
  echo "GIT_TAG_RELEASE you defined $GIT_TAG_RELEASE"
fi

# ==================================
# Create changelogs
# ==================================
DESCRIPTION="Just version used to testing version"
if [ -z "$DESCRIPTION" ]; then
  echo "Error: Must be provide content description."
  exit 1
fi

CURRENT_DATE=$(date +%Y-%m-%d)
TAG_MESSAGE="Release: $GIT_TAG_RELEASE
Date: $CURRENT_DATE
Description:
$DESCRIPTION"

echo "DESCRIPTION: $DESCRIPTION"

# == Create branch release
RELEASE_BRANCH_NAME="release/$GIT_TAG_RELEASE"_"$CURRENT_DATE"
echo "RELEASE_BRANCH_NAME=$RELEASE_BRANCH_NAME"

if git checkout -b $RELEASE_BRANCH_NAME; then
  echo "Created branch release $RELEASE_BRANCH_NAME successful"
else
  echo "Failed to create branch release $RELEASE_BRANCH_NAME. Exiting script."
  exit 1
fi

# == Mark tag from the main branch
git tag -a "$GIT_TAG_RELEASE" -m "$TAG_MESSAGE"
git push origin $GIT_TAG_RELEASE

# == Checkout to the main branch
git checkout main

# == Remove tag defined
git tag --delete $GIT_TAG_RELEASE

# == Remove release branch
if git show-ref --verify --quiet "refs/heads/$RELEASE_BRANCH_NAME"; then
  git branch -D $RELEASE_BRANCH_NAME
else
  echo "Branch $RELEASE_BRANCH_NAME doesn't exist. Nothing to delete."
fi
