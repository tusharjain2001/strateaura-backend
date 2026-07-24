# assets/

Static files served by the backend.

## Preview chapter PDF

Just drop the book's preview chapter PDF in this folder — any filename works.
The download route serves it automatically (it picks an explicit
`PREVIEW_CHAPTER_FILE`, else `preview-chapter.pdf`, else the first `.pdf` here).

Served by `GET /api/book-preview/download`:

- inline (previews in the browser's PDF viewer): `/api/book-preview/download`
- forced download: `/api/book-preview/download?download=1`

The "Download Preview Chapter" button in the book-preview confirmation email
links here (via `PREVIEW_CHAPTER_URL`, which already defaults to this route).

On Vercel this folder ships with the function via the `includeFiles: "assets/**"`
config in `vercel.json` — keep the PDF committed to the repo.
