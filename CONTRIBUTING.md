# Contributing

Nexa WebApp uses a small GitFlow process for academic delivery.

## Branches

- `main`: released states and repository-quality maintenance.
- `develop`: integrated work before release.
- `feature/*`: scoped feature or documentation work.
- `hotfix/*`: small corrections after a release.

## Local Validation

```bash
npm ci
npm run build
```

Before opening a pull request:

- Keep changes scoped to one concern.
- Do not commit `dist/`, `node_modules/`, `.DS_Store`, logs, local env files, or IDE folders.
- Do not change SemVer tags from a feature branch.
- Keep Firebase deployment described as future work unless deployment is actually configured and tested.

## Commit Style

Use Conventional Commits where practical:

```txt
feat(sales): add order validation state
fix(fake-api): align endpoint route names
docs(readme): add validation evidence
```
