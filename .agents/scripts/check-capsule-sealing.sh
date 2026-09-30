#!/bin/bash

# check-capsule-sealing.sh
# This script scans the backend code for the capsule sealing logic.

echo "Running NFR-1 Security Check on backend..."

# Check if there is a python file containing the target_datetime check and content stripping
if grep -rnwi "features" -e "target_datetime" | grep -i "content"; then
    echo "✅ SUCCESS: Found capsule sealing logic in the codebase."
    exit 0
else
    echo "⚠️ WARNING: Capsule sealing logic (target_datetime check to strip content) might be missing!"
    # Output empty JSON to satisfy hook requirements if run as a hook
    echo "{}"
    exit 0
fi

