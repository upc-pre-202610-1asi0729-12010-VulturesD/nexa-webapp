# Security Policy

## Supported Version

| Version | Supported |
|---|---|
| `v1.2.0` | Yes |

Earlier tags are preserved for academic history and are not maintained as production releases.

## Reporting

Open a private report with the repository maintainers when possible. If private reporting is unavailable, create a GitHub issue with minimal reproduction details and avoid posting secrets.

## Scope

Current security expectations cover:

- Avoiding committed secrets.
- Avoiding generated dependency folders.
- Keeping Fake API data clearly marked as simulation.
- Running `npm ci` and `npm run build` before merging.

This WebApp does not claim production authentication, production telemetry, or production backend security.
