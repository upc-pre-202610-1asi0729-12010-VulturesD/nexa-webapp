# Quality and Security Guidelines

Nexa WebApp adheres to clean code standards to ensure high reliability and security:

---

## 1. Code Security Standards
- **No Hardcoded Credentials**: API endpoints and user profiles must never store private passwords, server secrets, or session keys in plain text. Always extract configurations to environment variables.
- **Git Hygiene**: Environment configuration files (`.env`) containing private data should remain git-ignored.
- **Vulnerability Checks**: Regularly run dependency audits before merging feature branches:
  ```bash
  npm audit
  ```

---

## 2. Layout & Interface Guidelines
- **Responsive Layouts**: All presentation templates must use flexible layouts (CSS Flexbox, grid columns using `auto-fit` or `auto-fill` metrics) to prevent horizontal viewport clipping on small monitors or tablets.
- **CSS Hygiene**: Common margins, border-radius constants, cards, and data table layouts should inherit global rules from `src/assets/styles/ops.css`. Avoid hardcoding inline widths or heights on layout structures.

---

## 3. DDD Presentation Layer Hygiene
- Keep UI components decoupled from specific infrastructure classes.
- Perform DTO mapping at the infrastructure boundary so that presentation views receive clean domain entities.

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
