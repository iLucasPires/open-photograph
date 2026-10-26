---
name: flowwi-editorial-design
description: Apply FlowWi's editorial visual style to Vue and Nuxt UI screens, including galleries, admin pages, tables and dialogs. Use when creating or refining FlowWi interfaces or when the user requests this established style.
---

# FlowWi editorial design

Use the established photography gallery as the visual reference: quiet surfaces, generous whitespace,
large serif page titles, small spaced uppercase eyebrows, and restrained neutral controls.
Preserve the functional density of admin screens; photos and useful data remain the focal points.

## Locate the implementation

In the FlowWi repository, read `apps/app/AGENTS.md` (or `app/AGENTS.md` when working from `apps`).
Within the frontend, inspect these paths before extending their patterns:

- `src/app/features/gallery/layouts/gallery-layout.vue`: public header, main container and footer.
- `src/app/features/gallery/pages/slug.vue`: editorial collection introduction and photo grid.
- `src/app/features/admin/components/admin-page-frame.vue`: reusable admin page structure.
- `src/app/features/admin/layouts/admin-layout.vue`: sidebar, navigation and account controls.
- `src/app/features/gallery/components/photo-lightbox.vue`: neutral viewer and optional sidebar.

Treat current source as the reference for component APIs; these paths are not prerequisites when
applying the same aesthetic to another project. Do not copy product-specific logic into visual primitives.

## Visual decisions

- Use theme-aware `bg-default`, `bg-muted`, `text-highlighted`, `text-muted`, `text-dimmed` and
  `border-default`. Surfaces are neutral and subtle; keep success/error colors for actual status.
- Use `font-serif` for the main page title, typically `text-4xl sm:text-5xl`, with tight tracking.
  Keep controls, data, dialog titles and body text in the existing sans-serif font.
- Eyebrows use approximately `text-[10px] uppercase tracking-[0.2em]`, with real contextual text
  or counts. Do not invent dates, metrics, brands or decorative metadata.
- Use a centered container around 1440px, responsive horizontal padding of 20/40/56px and
  roughly 40–56px above page introductions. Separate the introduction from content with one quiet line.
- Group page actions beside the introduction on desktop and below it on narrow screens.
  Prefer neutral buttons with rounded-full corners. Keep table-row actions compact and ghost.
- Images have rounded-2xl corners, their natural proportions and about 20px between cards.
  Use restrained overlays, subtle translucent actions and minimal zoom. Provide touch and focus visibility.
- Tables use compact sans-serif text, muted headers, subtle hover surfaces and readable row spacing.
  Avoid putting a separate bordered card around every fragment of information.
- Cards and forms use light borders and little or no shadow. Do not force pill shapes onto inputs,
  textareas, table cells or every container. Use a consistent rounded-xl/2xl vocabulary for panels.
- Dialog backdrops are softly dimmed and blurred. Image viewers use a neutral stage, not a hardcoded
  black canvas. Put modal overlay/content above sticky headers, without globally raising the whole app.
- Hide sidebars and footers when they contain no useful content. Keep actions discoverable through
  keyboard focus and on touch screens; avoid essential controls available only on hover.

## Apply the style

Reuse Nuxt UI components and the project's existing layouts. Keep repeated page structure in
`CAdminPageFrame`; route pages supply title, eyebrow, description, actions and domain content.
Keep account, access-code and image-interaction behavior in their own components/composables.
Avoid broad global CSS overrides or changing the site's primary color to imitate a screenshot.

Preserve permissions, loading, error, empty, pagination and mutation states. Do not invent UI controls
that have no behavior. Adapt the existing screen rather than replacing its workflow with a marketing page.

Verify relevant TypeScript checks and production build. When browser access is available, inspect a
populated screen, an empty state, a narrow viewport and an open dialog. Report honestly which checks
were run; compilation alone is not visual verification.
