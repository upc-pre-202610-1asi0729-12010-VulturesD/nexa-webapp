# Wiki Navigation

This local directory contains offline markdown copies of the official Nexa WebApp engineering wiki.

## How to use and maintain the Wiki

1. **Adding Pages**:
   - Save your markdown file inside the `wiki/` directory.
   - Reference the new document in the navigation table in `wiki/Home.md` and page footers.
2. **Online Synchronization**:
   - The contents of this directory can be pushed directly to the GitHub repository's wiki workspace by cloning the `.wiki.git` endpoint for your repository and copy-pasting the updated pages.
3. **Format**:
   - Use standard GitHub Flavored Markdown (GFM) formatting.
   - Avoid using absolute directory paths inside links; instead, reference page links relatively (e.g., `[Project Overview](Project-Overview.md)`).

---

[Home](Home.md) | [Project Overview](Project-Overview.md) | [Architecture](Frontend-Architecture.md) | [Development Workflow](Branching-and-Commits.md) | [Quality & Security](Quality-and-Security.md)
