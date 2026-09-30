---
name: feature-first-workflow
description: >-
  Use this skill when creating or modifying features in the project. It enforces
  the feature-first architecture where frontend and backend code reside in the
  same feature directory.
---

# Feature-First Workflow

When adding a new feature or modifying an existing one, you must follow the feature-first architecture. 

## Rules

1. **Directory Structure**: 
   All code related to a specific feature must be located in `src/features/<feature_name>/` (or similar project root structure). 
   Inside this feature folder, you must maintain separate directories for backend and frontend if applicable, or group them logically:
   - `features/<feature_name>/frontend/` (React components, API slices)
   - `features/<feature_name>/backend/` (FastAPI routers, services, models)
   - `features/<feature_name>/docs/` (Feature documentation)

2. **Cross-Imports**:
   Do NOT import backend code into frontend code and vice-versa. They share the same feature folder but run in different environments.

3. **Step-by-step Execution**:
   - Step 1: Create the feature directory.
   - Step 2: Implement the backend API and domain models.
   - Step 3: Implement the frontend UI and RTK Query endpoints.
   - Step 4: Ensure all docs (BRD, test cases, architecture) are inside the feature folder.

