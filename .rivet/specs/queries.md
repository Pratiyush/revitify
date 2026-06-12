# Feature: Query verbs + exporters (Phase 5)

> Upstream: querylog.py, affected.py, serve.py scoring, export.py/callflow_html.py/tree_html.py/
> wiki.py @ graphify 0.8.38. Zero new dependencies.

## Requirement REQUIREMENT_QUERY-01 — path, neighborhood, affected

WHEN two symbols connect THEN `shortestPath` SHALL return the BFS path; WHEN a symbol changes
THEN `affected` SHALL return its transitive reverse dependents (imports/calls/references,
hopping containers); IF endpoints are missing THEN path SHALL be undefined, never a throw.

@check kind=unit ref=test/query.test.ts::finds the shortest path between symbols across files
@check kind=unit ref=test/query.test.ts::walks reverse dependencies transitively

## Requirement REQUIREMENT_QUERY-02 — search, explain, communities, log

WHEN a question is asked THEN nodes SHALL rank by idf-weighted term match and `explain` SHALL
narrate seeds with neighbors; communities SHALL report cohesion in [0,1]; every query SHALL
append a JSONL log entry that never breaks the query on failure.

@check kind=unit ref=test/query.test.ts::idf-ranks matches and explains with neighbors
@check kind=unit ref=test/query.test.ts::lists communities with size and cohesion in [0,1]
@check kind=unit ref=test/query.test.ts::appends JSONL entries

## Requirement REQUIREMENT_EXPORT-01 — the graphify export family

WHEN extra exports run THEN callflow.html SHALL hold only `calls` edges, tree.html SHALL nest
directories/files/symbols, WIKI.md SHALL section per community, graph.mmd SHALL cap at the top
symbols; IF the graph is empty THEN every exporter SHALL render without throwing.

@check kind=unit ref=test/query.test.ts::callflow keeps only calls; tree nests files; wiki sections communities; mermaid caps
@check kind=unit ref=test/query.test.ts::exporters survive an empty graph
