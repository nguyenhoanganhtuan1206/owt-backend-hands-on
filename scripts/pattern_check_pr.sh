#!/bin/bash

# Define the pattern for feature and bugfix branches
FEATURE_PATTERN="feature/[a-z/-]*"
BUGFIX_PATTERN="bugfix/[a-z/-]*"

# Get the input pattern
INPUT_BRANCH_NAME=$1

# Check if the input pattern matches either feature or bugfix pattern
if [[ $INPUT_BRANCH_NAME =~ ^($FEATURE_PATTERN|$BUGFIX_PATTERN)$ && ! $INPUT_BRANCH_NAME =~ .*[[:space:]].* ]]; then
    echo "Pattern is valid: $INPUT_BRANCH_NAME"
    exit 0
else
    echo -e "Invalid pattern branch name: $input_pattern\nYou must follow the convention name feature/* or bugfix/*"
    exit 1
fi