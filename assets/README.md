# assets/

Static files served by the backend. Two PDFs live here:

| File                  | Sent by                                             | Route                          |
| --------------------- | --------------------------------------------------- | ------------------------------ |
| `preview-chapter.pdf` | book-preview confirmation email (attached + button) | `GET /api/book-preview/download` |
| `veil-brochure.pdf`   | brochure confirmation email (attached + button)     | `GET /api/brochure/download`   |

To swap either PDF, just replace the file (keep the name), or set
`PREVIEW_CHAPTER_FILE` / `BROCHURE_FILE` to point at a different filename.

Both download routes serve inline (previews in the browser's PDF viewer); add
`?download=1` to force a save-as instead.

On Vercel this folder ships with the function via the `includeFiles: "assets/**"`
config in `vercel.json` — keep the PDFs committed to the repo.
