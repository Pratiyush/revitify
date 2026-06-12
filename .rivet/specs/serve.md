# Feature: HTTP + MCP servers, skill, install, diagnose (Phase 7)

> Upstream: serve.py (HTTP + stdio MCP + mtime reload + security.py traversal guard),
> install.py, diagnostics.py @ graphify 0.8.38. The MCP SDK loads ONLY via dynamic import
> (dependency-cruiser lazy-zone) — `import { revitify }` and non-MCP verbs never pay for it.

## Requirement REQUIREMENT_SERVE-01 — HTTP viewer + API, traversal-proof

WHEN the server runs THEN / SHALL serve graph.html and /api/{query,explain,node,neighbors,
path,communities,stats} SHALL answer from the live index; static files SHALL be allowlisted to
the three artifacts (traversal requests get 404 by construction); WHEN graph.json's mtime moves
THEN the index SHALL reload.

@check kind=unit ref=test/serve.test.ts::serves the viewer and the allowlisted artifacts; blocks traversal
@check kind=unit ref=test/serve.test.ts::answers the API routes
@check kind=unit ref=test/serve.test.ts::reloads when graph.json changes on disk (watch-next-door pattern)

## Requirement REQUIREMENT_SERVE-02 — the 7 MCP tools

WHEN an MCP client connects THEN tools/list SHALL expose query_graph, get_node, get_neighbors,
get_community, god_nodes, graph_stats, shortest_path — every call JSONL-logged; IF a node is
missing THEN tools SHALL answer with an error payload, never crash.

@check kind=unit ref=test/serve.test.ts::lists the 7 graphify tools and answers query_graph + shortest_path

## Requirement REQUIREMENT_SERVE-03 — skill + self-checks

WHEN `revitify install` runs THEN the /revitify skill SHALL land in .claude/skills/; WHEN
`revitify diagnose` runs THEN grammar loadability, cache, and graph presence SHALL report.

@check kind=unit ref=test/serve.test.ts::install drops the skill; diagnose reports grammars

## Requirement REQUIREMENT_VIEWER-01 — the redesigned graph.html stays offline

WHEN graph.html renders THEN the design-handoff template SHALL carry all four libraries
(cytoscape, layout-base, cose-base, fcose) INLINED with zero external sources, the graph
injected at the DATA INJECTION POINT (function-form replacement — minified libs contain $'
substitution hazards), and `</script>` escaped in data; the original canvas viewer SHALL stay
available as graph-lite.html; docstrings SHALL surface as the additive `summary` node field.

@check kind=unit ref=test/viewer.test.ts::is fully offline: four libraries inlined, zero external sources
@check kind=unit ref=test/viewer.test.ts::injects the graph at the DATA INJECTION POINT and keeps contract probes
@check kind=unit ref=test/viewer.test.ts::escapes </script> sequences in data
@check kind=unit ref=test/viewer.test.ts::still renders the zero-dependency canvas viewer via extraExporters
@check kind=unit ref=test/viewer.test.ts::docstrings surface as summary on their symbol (and stay as nodes)
