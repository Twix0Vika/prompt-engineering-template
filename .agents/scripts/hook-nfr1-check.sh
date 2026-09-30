#!/bin/bash
# .agents/scripts/hook-nfr1-check.sh

# Read stdin JSON payload from Antigravity
# We ignore it for this simple check, but we must output valid JSON for PreInvocation.

# Check if there are python files containing the feature but missing the check.
# We will just inject a reminder if we detect capsule router modifications.

echo '{
  "injectSteps": [
    {
      "ephemeralMessage": "SECURITY REMINDER (NFR-1): Ensure that the API does NOT return `content` and `media` for locked capsules (Current_Time < Target_DateTime)."
    }
  ]
}'

