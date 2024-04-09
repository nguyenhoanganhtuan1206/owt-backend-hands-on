#!/usr/bin/env bash
 
# Exit script if command fails or uninitialized variables used
set -euo pipefail

# ==================================
# Create git tag for new version
# ==================================
 
GIT_TAG_RELEASE=v1.1.1
# == Define tag release
if [ -z "$GIT_TAG_RELEASE" ]; then
    echo "GIT_TAG_RELEASE is empty"
    exit 1
else
    echo "GIT_TAG_RELEASE you defined $GIT_TAG_RELEASE"
fi

# == Create an changelogs tag
DESCRIPTION="
Update code BE to fix the email address for outgoing emails. It will include BE code for Task Management feature which has not been released.
"
if [ -z "$DESCRIPTION" ]; then
    echo "Error: Must be provide content description."
    exit 1
fi

CURRENT_DATE=$(date +%Y-%m-%d)
TAG_MESSAGE="Release: $GIT_TAG_RELEASE
Date: $CURRENT_DATE
Description:
$DESCRIPTION"

# == Pull latest code for current branch
git pull origin

# == Create branch release
RELEASE_BRANCH_NAME="release/$GIT_TAG_RELEASE"_"$CURRENT_DATE"
echo "RELEASE_BRANCH_NAME=$RELEASE_BRANCH_NAME"

if git checkout -b $RELEASE_BRANCH_NAME; then
    echo "Created branch release $RELEASE_BRANCH_NAME successful"
else 
    echo "Failed to create branch release $RELEASE_BRANCH_NAME. Exiting script."
    exit 1
fi

# == Push release branch to remote
if git push origin "$RELEASE_BRANCH_NAME"; then
    echo "Pushed branch release $RELEASE_BRANCH_NAME to remote successfully"
else 
    echo "Failed to push branch release $RELEASE_BRANCH_NAME to remote. Exiting script."
    exit 1
fi

# == Merge main from release branch
git checkout main
if git pull origin $RELEASE_BRANCH_NAME; then
    echo "Pull latest code from branch release successfully";
else
    echo "Can't pull code from branch release"
    exit 1;
fi

git push origin
echo "Completed process to push and pull latest to the main branch";

# == Mark tag from the main branch
git tag -a "$GIT_TAG_RELEASE" -m "$TAG_MESSAGE"
git push origin $GIT_TAG_RELEASE

# == Remove tag defined
git tag --delete $GIT_TAG_RELEASE

# == Remove release branch
if git show-ref --verify --quiet "refs/heads/$RELEASE_BRANCH_NAME"; then
    git branch -d $RELEASE_BRANCH_NAME
else
    echo "Branch $RELEASE_BRANCH_NAME doesn't exist. Nothing to delete."
fi