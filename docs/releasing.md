# Releasing

[← back to README](../README.md)

**Rule #1: never run `npm publish` from your own machine.** Version 0.1.0 was published from a private working folder and shipped hardcoded `D:/` paths, personal files and a 170 MB dependency to everyone. Releases go through GitHub Actions so the published package is always exactly what's on `master`.

## One-time setup

On [npmjs.com](https://www.npmjs.com/package/schwiftyy-cc) → **Settings** → **Trusted Publisher**, add a GitHub Actions publisher:

| Field | Value |
|---|---|
| Organization or user | `OxMediaEcomm` |
| Repository | `SchwiftyyAi` |
| Workflow filename | `release.yml` |
| Environment | *(leave blank)* |

That lets the workflow publish without any token. Until it's set up, the workflow falls back to an `NPM_TOKEN` repo secret, if you add one.

## Cutting a release

1. Bump the version in **both** `package.json` and `.claude-plugin/plugin.json` (CI fails if they differ).
2. Move the `[Unreleased]` notes in `CHANGELOG.md` under the new version.
3. Merge to `master`.
4. Create a GitHub release with tag `vX.Y.Z` (must match the version), target `master`.

Publishing the release triggers `.github/workflows/release.yml`, which:

1. Checks the tag matches both version fields
2. Runs `npm run check`
3. Publishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements), so the npm page links back to the exact commit and workflow run

Plugin users get the update through `/plugin`. The `version` in `plugin.json` is what tells Claude Code there's something new.

## If something ships broken

```bash
npm deprecate schwiftyy-cc@X.Y.Z "Broken: <why>. Use X.Y.Z+1 or later."
```

Then fix it and release a new version. Don't unpublish: npm never lets you reuse a version number, which is why 0.1.1 is gone forever.
