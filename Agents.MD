# Project agents guide

This repository is a full-stack project: **FastAPI** backend and **React 19 (TypeScript)** frontend for **TimeCapsule** — an interactive service for time-locked memories, letters, and anniversaries.

## Layout

- `features/` — Feature-first modular code:
  - `features/capsules/` — Time capsule creation, editing, time-lock sealing logic (NFR-1), media attachments, interactive unlocking, and live countdowns.
  - `features/auth/` — User registration, login, JWT token issuance, safe password truncation (72-byte bcrypt limit), and dev auth bypass (`VITE_DEV_AUTH_BYPASS`).
  - Each feature co-locates `backend/` and `frontend/` subdirectories.
- `backend/` — API entry points (`app/main.py`), shared utilities (`utils/json_store.py`, `utils/paths.py`), and data persistence (`data/*.json`, `data/media/`). Powered by **FastAPI**, **Pydantic v2**, and **uv**.
- `frontend/` — **React 19 + TypeScript**, **Vite**, **shadcn/ui**, **Tailwind CSS v4**, **Redux Toolkit** (RTK Query for API, slices for UI/auth state).
- `docs/` — Feature documentation and modular BRDs (`docs/<module>/brd.md`, architecture, test cases).
- `.cursor/rules/` — Modular Cursor rules (`shared.mdc`, `frontend.mdc`, `backend.mdc`).

## Current scope

Core domain entities:
- **Capsule**: Scheduled time capsules with statuses (`locked`, `ready`, `opened`), multi-file attachments (up to 15 MB), notification email, and interactive unlocking animation.
  - **NFR-1 Sealing**: Unopened capsules prior to `target_datetime` never expose text or media URLs in API responses.
- **User / Auth**: Authentication with JWT, private capsule access, and development auth bypass.

## Working conventions

- Add new features following the feature-first layout under `features/<feature_name>/backend/` and `features/<feature_name>/frontend/`.
- Document each feature under `docs/<feature>/brd.md`.
- Enforce strict typing in TypeScript and Pydantic validation on the backend.
- Keep AI assistant entry points minimal: this file is the source of truth; `Claude.md` points here.

## Local development

1. Backend: from `backend/`, run `uv sync` then `uv run dev` (runs on `http://localhost:8001`, interactive docs at `/docs`).
2. Frontend: from `frontend/`, run `npm install` then `npm run dev` (dev server port **5174**; default API base: `http://localhost:8001/api`).
3. Dev Auth Bypass: Set `VITE_DEV_AUTH_BYPASS=true` (or run in standard dev mode) to directly access the dashboard without registering/logging in.

VS Code: `.vscode/launch.json` starts the backend; `.vscode/tasks.json` installs dependencies and runs the frontend dev server.
