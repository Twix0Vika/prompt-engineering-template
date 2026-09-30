---
name: capsule-ui-designer
description: >-
  Use when designing or changing TimeCapsule frontend layouts, capsule cards,
  memory galleries, dashboard grids, typography, and responsive visual styling.
---

# Capsule UI Designer

Use this skill for capsule dashboard and gallery UI changes. Preserve the project
stack and existing feature boundaries: React 19, TypeScript, Vite, Tailwind CSS,
Redux Toolkit / RTK Query, and the co-located `features/capsules/frontend/`
feature.

## Editorial visual language

- Use `Playfair Display` (or a compatible high-contrast serif fallback) for
  page titles, section headings, capsule names, and editorial callouts.
- Use `Plus Jakarta Sans` or another clean sans-serif for body copy, dates,
  metadata, controls, and other small system labels. Keep decorative script
  fonts to short accent copy only.
- Use the warm rose-gold / nude-sand palette:
  - Background: `#FAF0EB`
  - Card surface: `#FFFDF9`
  - Fine border: `#E8D5CE`
  - Text: warm cocoa; accents may use dusty rose, muted coral, or warm peach.
- Prefer `rounded-3xl` surfaces, thin borders, soft ambient shadows, and
  restrained glassmorphism. Keep contrast sufficient for readable text and
  clear interactive states.

## Bento dashboard composition

- Arrange dashboard stats, actions, capsules, and gallery content in a
  responsive multi-column grid. Bento cards may span columns or rows to create
  visual rhythm; avoid empty center columns and oversized forced gaps.
- On small screens, allow a one-column card flow where necessary for legibility,
  but keep gallery thumbnails in a horizontal scroller or compact thumbnail
  grid; never render a long single-column stack of large photos.
- Avoid fixed heights that crop card content. If using auto rows for bento
  shapes, ensure text and controls fit at mobile and desktop breakpoints.
- Use decorative stars, handwritten stickers, gradients, or quote cards
  sparingly so they support rather than obscure capsule content.

## Compact memory gallery and capsule cards

- Render photo galleries as a full-width responsive grid or horizontal row:
  ```tsx
  <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
    {/* compact thumbnails */}
  </div>
  ```
  A horizontal scroller is also appropriate:
  ```tsx
  <div className="flex flex-row gap-4 overflow-x-auto pb-4">
    {/* thumbnails use shrink-0 */}
  </div>
  ```
- Constrain individual capsule image frames and gallery thumbnails to compact
  dimensions, normally `h-24 w-24` through `h-40 w-40` and never larger than
  `max-h-40 max-w-40` in dashboard previews.
- Apply `object-cover`, `overflow-hidden`, rounded inner frames, and a subtle
  rose border. Use `shrink-0` for thumbnails in horizontal scrollers.
- Keep title, unlock date, status, and actions aligned beside or directly below
  the compact preview. Avoid full-width image headers in collection cards.
- Locked-capsule previews must respect the sealing contract: do not render
  unreleased media URLs or content that the backend should withhold. Blur is a
  visual treatment, not an access-control boundary.
- Reserve larger images for an intentional viewer/lightbox, and constrain them
  to the viewport with responsive sizing.

## Implementation and quality checklist

1. Inspect existing capsule types, query hooks, and dashboard components before
   adding new UI state or duplicate data handling.
2. Keep data operations in existing RTK Query hooks and presentation in the
   capsule frontend feature. Do not weaken backend authorization or capsule
   sealing for design convenience.
3. Use explicit TypeScript types, remove unused imports, and keep mapped JSX
   readable with correctly matched opening/closing tags.
4. Provide semantic controls, accessible labels/alt text, keyboard focus
   styles, and responsive layouts.
5. Run the frontend lint and TypeScript check, then inspect the rendered page at
   narrow and wide viewport widths when browser tooling is available.
