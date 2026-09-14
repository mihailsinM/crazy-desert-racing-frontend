# Desert UI layout conventions

- Use `CatalogPage` with `AdaptiveCardList` for searchable collections of full rows. The shell, scroll lane and number of fully visible rows are shared by All Users, All Drivers, Desert Live and Photo Reports. Future event and festival directories use the same components.
- Keep catalog spacing, viewport sizing and row layout in `layout.css`, `details-card.css`, `lists.css` and `scroll.css`. Do not copy those rules into entity styles.
- `users.css` holds user-specific presentation such as profile sections, avatars, photos and driver badges; `desert-live.css` holds publication-specific presentation. A future `events.css` may hold presentation specific to races and festivals, while their catalog geometry remains shared.
- The compact Dashboard Activity widget deliberately uses its separate four-pixel scrollbar. Do not apply catalog-specific scroll behavior to the dashboard widget.
- On narrow or short viewports, the entire catalog card scrolls so rows stay intact; on larger viewports the catalog list shows as many whole rows as fit.
- Use `MediaFormPage` for create/edit forms with the shared image-framing picker. Its viewport-sized panel and inner large scrollbar leave the image editor and its card/avatar previews inside the form; the preview layout stacks on narrow screens. Keep the independent Desert Live publication editor layout unchanged.
- `du-collection-scroll` owns the neutral gallery rail for races and cars; changing its lane must preserve the grid width and leave the rail between the grid and the viewport edge.
