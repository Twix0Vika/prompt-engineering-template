---
name: verify-capsule-sealing
description: >-
  Use this skill to implement or verify the security logic (NFR-1) for time capsules,
  ensuring that locked capsules do not leak content or media URLs before their target date.
---

# Capsule Sealing Logic (NFR-1)

When working on the backend API or data access layer for Capsules, you must ensure that **NFR-1** is strictly followed. 

## Requirements
If a capsule's `Target_DateTime` is strictly greater than the `Current_Time` (i.e., it is locked):
1. The `content` field MUST be stripped (e.g., set to `null` or empty).
2. The `media` URLs MUST be stripped (e.g., set to `null` or empty list).
3. This must happen on the backend, ensuring the frontend never receives the locked data.

## Implementation Steps
1. **Check the Service/Router layer**: Locate the endpoint returning the capsule (e.g., `GET /api/capsules/{id}`).
2. **Apply the condition**: 
   ```python
   from datetime import datetime, timezone
   
   if capsule.target_datetime > datetime.now(timezone.utc):
       capsule.content = None
       capsule.media = []
   ```
3. **Run the security verification hook**: You can trigger a manual check by running the custom script `check-capsule-sealing.sh` to parse the Python files and ensure this logic exists.

