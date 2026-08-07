# Publishing Guide — BC1

## Pre-publish checklist

```bash
npm test
npm run bundle
git diff --exit-code releases/   # bundle must be committed
```

## Create git tag

```bash
git tag -a v0.1.0-beta.1 -m "Beta Candidate 1: human-first CLI, template generate, BC1 validation"
git push origin v0.1.0-beta.1
```

## npm publish

```bash
npm login
npm publish --access public
# or for scoped: npm publish --access public --tag beta
```

Verify:

```bash
npm install -g ctxstack@0.1.0-beta.1
ctxstack --version
```

## GitHub Release

```bash
gh release create v0.1.0-beta.1 \
  releases/ctxstack.js \
  --title "v0.1.0-beta.1 — Beta Candidate 1" \
  --notes-file CHANGELOG.md
```

## Post-publish

1. Update README install badge when live on npm
2. Invite 5–20 closed-beta testers
3. Collect feedback via GitHub Discussions or form
4. Re-run `bash scripts/validate-real-repos.sh` with network for full OSS matrix
