#!/bin/bash

# Define the pattern for feature and bugfix branches
FEATURE_PATTERN="feature/[a-z/-]*"
BUGFIX_PATTERN="bugfix/[a-z/-]*"

# Get the input pattern
input_pattern=$1

# Check if the input pattern matches either feature or bugfix pattern
if [[ $input_pattern =~ ^($FEATURE_PATTERN|$BUGFIX_PATTERN)$ && ! $input_pattern =~ .*[[:space:]].* ]]; then
    echo "Pattern is valid: $input_pattern"
    exit 0
else
    echo "Invalid pattern: $input_pattern"
    exit 1
fi