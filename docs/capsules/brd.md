# TimeCapsule — Capsules Module BRD

## 1. Executive Summary & Business Goals
TimeCapsule is an interactive service allowing users to encapsulate thoughts, letters, photographs, and memories into digital capsules scheduled for a predetermined unlock date and time.
- **Primary Goal**: Deliver an emotionally engaging, dependable, and secure memory repository for personal milestones, goal tracking, and anniversaries.
- **Success Metrics (KPIs)**:
  - ≥ 1 capsule created per user during the initial session.
  - ≥ 98% timely delivery of notifications upon capsule unlock.
  - Average capsule authoring duration ≤ 3 minutes.

## 2. Target Audience & Roles
- **Target Audience**: Individuals setting future goals, couples commemorating anniversaries, friends sharing memories.
- **Roles**:
  - **Capsule Owner (Authenticated User)**: Creates, edits, reviews, and deletes personal capsules.
  - **System Scheduler**: Automated background daemon monitoring unlock timestamps and dispatching unlock alerts.

## 3. Scope of Work & Pages

### 3.1 User Dashboard (`/dashboard`)
- **Purpose**: Primary hub displaying all user-created capsules.
- **Status Categories**:
  - 🔒 **Locked**: Unlock date is in the future. Displays real-time countdown timer.
  - 🔓 **Ready**: Unlock date has passed, but user has not yet viewed the capsule.
  - 📖 **Opened**: Capsule has been accessed and viewed by the user.
- **Contextual Actions**:
  - Locked: *Edit*, *Delete*.
  - Ready / Opened: *View*, *Delete*.
  - Primary Action: *+ Створити капсулу* (Create Capsule).
- **Layout Requirements**: Responsive multi-column bento grid. Compact preview cards with warm rose-gold palette (`#FAF0EB` background, rounded-3xl cards, Playfair Display headers).

### 3.2 Capsule Creator & Editor (`/create` and `/edit/:id`)
- **Fields**:
  - Title (`title`, text, required).
  - Target Unlock Timestamp (`target_datetime`, datetime-local picker, required, must be in the future).
  - Letter / Note Content (`text`, rich/multiline text area).
  - Media Uploads (`media_files`, multi-file upload up to 15 MB aggregate size, supporting images, video, PDFs).
  - Notification Email (`notify_email`, email, pre-filled with user email).
- **Actions**: *Зберегти капсулу / Зберегти зміни* (Save), *Скасувати* (Cancel).
- **Edit Locking**: Modifications are strictly disallowed once `Current_Time >= Target_DateTime` (read-only mode).

### 3.3 Interactive Unlocking (`/capsule/:id`)
- **Access Rule (NFR-1 Enforcement)**:
  - `Current_Time < Target_DateTime`: Renders a full-screen sealed view with a ticking live countdown timer and "Capsule is sealed" indicator. No letter content or media files are rendered or accessible via network.
  - `Current_Time >= Target_DateTime`: Triggers unlock transition animation (🔓), reveals letter text, and displays an image/media gallery with full-screen lightbox preview.

## 4. Functional Requirements
- **FR-2.1 (Creation)**: Save title, future unlock timestamp, text, notification email, and uploaded media.
- **FR-2.2 (Editing)**: Full editing permitted while status is `locked`.
- **FR-2.3 (Deletion)**: Deletion permitted at any time. When deleted, associated local/cloud media files are purged.
- **FR-2.4 (Content Freeze)**: Automatically transition to Read-Only once target timestamp is reached.
- **FR-3.1 (Notifications)**: Automated email notification dispatched when `Current_Time >= Target_DateTime`.
- **FR-3.2 (Direct Link)**: Email contains direct navigation URL to `/capsule/:id`.
- **FR-4.1 (Media Management)**: Support up to 15 MB file attachments with safe disk/cloud storage.
- **FR-4.2 (Cleanup)**: Remove orphaned media upon capsule deletion or file replacement.

## 5. Non-Functional Requirements (NFRs)
- **NFR-1 (Security — Sealing)**:
  - The API MUST NEVER transmit `text` or `media_files` in the HTTP response if `Current_Time < Target_DateTime`.
  - Sealing must be enforced server-side in `CapsuleService` (`text=None`, `media_files=[]`).
- **NFR-2 (Performance)**: Page render and API response latency < 1.5s under standard network conditions.
- **NFR-3 (Responsiveness & Design)**: Mobile-first responsive layouts, dense bento grid presentation, high-contrast Playfair Display typography, warm rose-gold/nude-sand aesthetic.

## 6. Technical Implementation Details
- **Backend**:
  - Router: `features/capsules/backend/routers.py` (`/api/capsules/`)
  - Service: `features/capsules/backend/services.py`
  - Repository: `features/capsules/backend/repository.py` (`backend/data/capsules.json`)
  - Scheduler: `features/capsules/backend/tasks/scheduler.py` (Asyncio task in FastAPI lifespan)
- **Frontend**:
  - API: `features/capsules/frontend/api/capsulesApi.ts` (RTK Query)
  - Pages: `DashboardPage.tsx`, `CapsuleEditorPage.tsx`, `CapsuleViewPage.tsx`
  - Components: `CapsuleCard.tsx`, `useCountdown.ts`

