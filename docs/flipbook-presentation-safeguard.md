# Flipbook presentation safeguard

The Years in Photos presentation is intentionally implemented in the Git-tracked renderers under `app/members/archive/years-in-photos/`.

Keep these presentation rules when changing the photo-book admin/editor:

- 2025 remains on its established renderer and should not be restyled.
- 2026 uses the rich editable renderer.
- Other shelf books use the editable rich renderer through `ShelfAlbumBook`.
- Album pages are white.
- The front cover has a coloured band on the left edge using the book spine colour.
- The book has a visible shaded centre gutter/spine.
- Cover title and spine colour are dynamic per book.
- Photo layout, positioning and caption controls must remain compatible with the admin editor.

Do not replace these renderers with an older local copy when deploying. Production should be built from the current `main` branch so the archive presentation and admin/editor changes remain in sync.
