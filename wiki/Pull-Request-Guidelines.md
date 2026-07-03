# Pull Request Guidelines

Before opening a pull request to merge a feature branch into `develop` or `main`, please complete these steps:

1. **Verify Local Build**:

   Confirm the project builds without errors:

   ```bash
   npm run build
   ```

2. **Review Code Hygiene**:

   - Ensure there are no active console logging commands (`console.log`) or debug breakpoints left in presentation components.
   - Verify that credentials, passwords, or session tokens are not checked into the repository.
   - Confirm that no files referencing temporary placeholder APIs are included.
3. **No Garbage Files**:

   Ensure git-ignored directories (`node_modules/`, `dist/`, `.idea/`, `.DS_Store`) are not committed.

---

[Home](Home.md) | [Project Overview](Project-Overview.md) | [Architecture](Frontend-Architecture.md) | [Development Workflow](Branching-and-Commits.md) | [Quality & Security](Quality-and-Security.md)
