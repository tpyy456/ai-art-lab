# About Redesign Handoff

Date: 2026-06-04

## 1. Current About Placeholder State

The current About first pass has been implemented and committed, but it is only a placeholder skeleton.

Implemented:

- `/about` route exists.
- The home page `ABOUT` card enters `/about` through the shared red scan transition.
- The About page contains left-side text placeholders.
- The About page contains a right-side dual-layer portrait placeholder.
- The About page contains an `ARCHIVE / WORK TRACE` placeholder grid.
- `BACK HOME` returns to `/` through the same scan transition.

Current placeholder commit:

- `2958dd3 feat(about): add interactive about page placeholder`

## 2. Current About Files

About-related files:

- `src/features/about/AboutPage.tsx`
- `src/features/about/components/InteractivePortrait.tsx`
- `src/features/about/components/AboutArchiveGrid.tsx`

Routing and entry changes:

- `src/App.tsx`
  - Adds lazy loading for `AboutPage`.
  - Adds the `/about` route.
  - Adds the home page `ABOUT` card navigation through `useScanTransition`.

## 3. Current Implementation Notes

The right portrait placeholder uses a two-layer visual structure:

- Lower layer: real-life photo placeholder.
- Upper layer: AI mask / armor placeholder.

The reveal interaction is implemented with CSS `mask-image: radial-gradient(...)`.

Current image paths are only reserved for future use:

- `public/about/profile-real.jpg`
- `public/about/profile-mask.jpg`

Important constraints of the current version:

- No real images are loaded.
- Missing images do not break the page because placeholders are rendered directly.
- The archive area is placeholder cards only.
- No Canvas is used.
- No RAF loop is used.
- No new dependency was added.

## 4. Current Design Assessment

This About first pass is only a placeholder skeleton. The current visual result is not satisfactory and should not be treated as the final visual reference.

Future redesign work may keep these parts:

- `/about` route.
- Shared red scan transition.
- General content direction.
- Dual-layer portrait interaction concept.

Future redesign work should not be constrained by the current layout, spacing, card treatment, or visual composition.

## 5. Future Redesign Direction

The About page should feel like:

- A real person under a digital shell.
- A living self-image rather than a resume page.
- A continuation of the black, cold, red-line, digital-art language of the main site.

Desired direction:

- Main visual area on the right uses a real life photo.
- Lower layer is the real life photo.
- Upper layer is an AI mask / armor / digital shell version.
- On mouse hover, the upper layer is locally erased to reveal the real photo beneath.
- Lower archive area should later contain life photos, sculpture work, process images, exhibition traces, and study/work fragments.
- Text can remain placeholder until real copy and real images are ready.

Avoid:

- Ordinary personal blog style.
- Ordinary photo wall.
- White background and large rounded cards.
- Social-media feed feeling.
- Generic resume layout.

Keep:

- Black background.
- Cold digital atmosphere.
- Red thin-line system.
- Restrained, high-art visual language.

## 6. Do Not Touch Without Explicit Request

When redesigning About later, do not modify these areas unless explicitly requested:

- `IntroOverlay`
- `DivineDavidCanvas`
- Home `Hero` main visual
- `TextCollapse`
- AI LAB panel
- `RedScanTransition`
- `AudioDock`
- `Navbar`
- `main.tsx`

The About redesign should remain isolated to the About route and only the minimum route/entry glue required.

## 7. Rollback Information

Current About placeholder commit:

- `2958dd3`

External stable backup:

- `C:\Users\acer\Desktop\个站备份\backup-after-about-placeholder-before-redesign-20260604`

If the next redesign attempt fails, the project can be restored from the commit above or from the external backup.
