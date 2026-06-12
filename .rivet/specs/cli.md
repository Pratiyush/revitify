# Feature: CLI, watch, global graph, PR impact (Phase 6)

> Upstream: graphify CLI verbs + watch.py + global_graph.py + prs.py @ 0.8.38. The dispatcher
> lazy-imports every verb (chokidar loads only for watch); bin = dist/cli/main.js.

## Requirement REQUIREMENT_CLI-01 — the verb surface

WHEN `revitify --help` runs THEN it SHALL list build/query/explain/path/affected/communities/
export/watch/global/prs/validate; IF an unknown verb is given THEN exit code SHALL be 1.

@check kind=unit ref=test/cli.test.ts::--help lists verbs; unknown verb exits 1

## Requirement REQUIREMENT_CLI-02 — verbs work end to end on a real project

WHEN build/query/path/affected/communities/export/validate run in sequence THEN each SHALL
exit 0 with its artifact/output, and the JSONL query log SHALL record the session.

@check kind=unit ref=test/cli.test.ts::build → query → path → affected → communities → export → validate, end to end

## Requirement REQUIREMENT_CLI-03 — watch, global, prs

WHEN watch runs THEN it SHALL rebuild incrementally on change (cache-backed); WHEN global runs
over N repos THEN ids SHALL prefix `repo:` (collision-proof); WHEN prs runs in a git repo THEN
changed files SHALL map to their transitive blast radius.

@check kind=unit ref=test/cli.test.ts::rebuilds on change (initial build, then incremental)
@check kind=unit ref=test/cli.test.ts::global merges repos with repo: prefixes
@check kind=unit ref=test/cli.test.ts::prs reports diff impact in a git repo
