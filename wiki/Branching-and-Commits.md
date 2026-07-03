# Branching and Commits

We follow standard development workflows to keep project branches and commits clean and clear.

---

## 1. Branch Strategy (GitFlow)

- **`main`**: The release branch. Represents live code in production.
- **`develop`**: The integration branch. Features are merged here first.
- **`feature/*`**: Feature branches. Created off `develop` and merged back via pull request.
- **`hotfix/*`**: Immediate patches targeting bugs on `main`.

---

## 2. Commit Style Guidelines

Every commit must follow this structured multiline format:

```txt
<type>(<scope>): <short action summary>

Context:
- What area, milestone or branch this commit belongs to.

Changes:
- What was changed.
- What was added, corrected or normalized.

Reason:
- Why the change was necessary.

Validation:
- What was reviewed or checked before committing.
```

### Commit Types

- **`feat`**: A new user-facing feature.
- **`fix`**: A bug fix.
- **`docs`**: Documentation edits.
- **`style`**: Formatting, layout padding tweaks, style corrections.
- **`refactor`**: Code restructuring without user-facing behavior changes.

### Example Commit

```txt
feat(sales): add commercial orders list component

Context:
- Sales Context, commercial verification milestone, branch feature/sales-orders.

Changes:
- Added OrdersDataTable component in sales presentation.
- Connected search filters to catalog items.

Reason:
- Needed to let operators verify incoming buyer orders on small monitors.

Validation:
- Tested responsive table width rendering down to 480px.
- Verified compilation via npm run build.
```

---

[Home](Home.md) | [Project Overview](Project-Overview.md) | [Architecture](Frontend-Architecture.md) | [Development Workflow](Branching-and-Commits.md) | [Quality & Security](Quality-and-Security.md)
