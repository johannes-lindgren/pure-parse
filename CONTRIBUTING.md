# Contributing

## Release workflow

Releases are automated via [Release Please](https://github.com/googleapis/release-please).

### How it works

1. Merge PRs to `main` using **conventional commit** titles (enforced by CI):
   - `fix: …` → patch bump (1.0.x)
   - `feat: …` → minor bump (1.x.0)
   - `feat!: …` or any type with `BREAKING CHANGE:` in the body → major bump (x.0.0)

2. After each merge, Release Please updates (or creates) a **"Release PR"** that:
   - Bumps the version in `packages/pure-parse/package.json`
   - Updates `CHANGELOG.md`

3. **Review and merge the Release PR** when you're ready to ship. Merging it:
   - Creates a GitHub Release and git tag
   - Triggers the [publish workflow](.github/workflows/publish.yml), which builds and publishes to npm

> Nothing is published until you merge the Release PR. You can let commits accumulate across multiple PRs before releasing.

### Forcing a release manually

If no releasable commits exist (e.g. only `chore:` commits), Release Please will skip creating a PR. To force one, trigger the workflow manually from the [Actions tab](https://github.com/johannes-lindgren/pure-parse/actions/workflows/release-please.yml) and pass a bump type in the **release_as** field: `patch`, `minor`, or `major`.

### npm token

The publish workflow requires an `NPM_TOKEN` secret set in the repository settings with publish access to the `pure-parse` package.
