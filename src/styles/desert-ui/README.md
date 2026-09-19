# Desert UI layout conventions

- Use `CatalogPage` with `AdaptiveCardList` for searchable collections of full rows. The shell, scroll lane and number of fully visible rows are shared by All Users, All Drivers, Desert Live and Photo Reports. Future event and festival directories use the same components.
- Keep catalog spacing, viewport sizing and row layout in `layout.css`, `details-card.css`, `lists.css` and `scroll.css`. Do not copy those rules into entity styles.
- `users.css` holds user-specific presentation such as profile sections, avatars, photos and driver badges; `desert-live.css` holds publication-specific presentation. A future `events.css` may hold presentation specific to races and festivals, while their catalog geometry remains shared.
- The compact Dashboard Activity widget deliberately uses its separate four-pixel scrollbar. Do not apply catalog-specific scroll behavior to the dashboard widget.
- On narrow or short viewports, the entire catalog card scrolls so rows stay intact; on larger viewports the catalog list shows as many whole rows as fit.
- Use `MediaFormPage` for create/edit forms with the shared image-framing picker. Its viewport-sized panel and inner large scrollbar leave the image editor and its card/avatar previews inside the form; the preview layout stacks on narrow screens. Keep the independent Desert Live publication editor layout unchanged.
- `du-collection-scroll` owns the neutral gallery rail for races and cars; changing its lane must preserve the grid width and leave the rail between the grid and the viewport edge.
- `GalleryPhotoViewer` is the only collection-photo viewer. Driver, user, car, race, festival and marketplace galleries must reuse it instead of creating page-specific lightboxes or viewer CSS.
- Every rectangular gallery photo uses its saved card `focusX`, `focusY` and `cropPercent` in both the overview card and the large viewer. The display size may change; the visible framing must not.
- Viewer arrows appear only when a previous or next photo exists. Mouse, keyboard arrows and `Escape` behavior stay shared across every gallery. Viewer presentation belongs in `focal-image.css`, never in an entity page stylesheet.
- A standard page heading is always vertical: the orange eyebrow sits directly above the title on the left. Use `du-page-header-split` only when a real second control group, such as search, must occupy the opposite side. Never introduce a generic local `page-header` class.
- `du-page-scroll` is the only full-page rail and lives below the application navbar. Collection rails extend to the viewport wall; card, form and editor rails extend to their own right border. Do not place a rail halfway through padding or copy scrollbar pseudo-element rules into page CSS.
- Use `du-soft-scroll` for a compact inner list and the shared large-scroll classes for page, collection, card, form and editor scrolling. All scrollbar colors, thumbs and arrow buttons belong in `scroll.css`.
- Scrollbar gutters are compensated in shared scroll layouts, so a rail never narrows the visible content or breaks equal left/right inset. Do not add page-specific right padding to work around a rail.
- A scrollable collection reserves hover clearance above and beside its direct card grid. Cards may lift and glow, but their border, scale and shadow must not be clipped by the scroll viewport.
