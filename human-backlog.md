# Human backlog — revitify (your actions, stepwise)

Things only you can do. Agent/contributor work is in [backlog.md](backlog.md).

1. **Publish to npm** (name `revitify` confirmed free; `pnpm pack` dry-run already green):
   1. `npm login`
   2. `npm publish --access public`

   This also unblocks dev-spec-kit swapping its local `link:` to the published package.

2. **Review + merge open Dependabot PRs.** Each runs CI; merge the green ones. For the TypeScript major
   bump, confirm `pnpm check` passes on its PR before merging.

3. **Merge release PRs.** When release-please opens a "chore: release vX.Y.Z" PR (after a `feat:`/`fix:`),
   merge it to cut the version bump + tag + GitHub Release.
