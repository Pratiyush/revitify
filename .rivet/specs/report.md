# Feature: Report intelligence (Phase 4)

> Upstream: report.py + analyze.py @ graphify 0.8.38 (pin in .track). God nodes exclude
> containers (file/doc/why); surprise = additive bonuses (+2 cross-file, +2 cross-community,
> +1 peripheral→hub, +1 cross-language, +1 inferred); questions seed from betweenness brokers.

## Requirement REQUIREMENT_REPORT-01 — why-nodes

WHEN a comment carries NOTE:/WHY:/HACK: THEN it SHALL become a why node linked (`explains`)
from the symbol declared just under it (file fallback), and WHEN a Python definition opens
with a docstring THEN a docstring node SHALL hang off that symbol (`documents`).

@check kind=unit ref=test/report.test.ts::typescript: NOTE/WHY/HACK comments become nodes explained by the next symbol
@check kind=unit ref=test/report.test.ts::python: docstrings and HACK comments via tree-sitter

## Requirement REQUIREMENT_REPORT-02 — god nodes are symbols, not containers

WHEN god nodes rank THEN file/doc/why/docstring nodes SHALL be excluded.

@check kind=unit ref=test/report.test.ts::ranks symbols only — file/doc/why nodes are excluded

## Requirement REQUIREMENT_REPORT-03 — the report carries its intelligence

WHEN GRAPH_REPORT.md renders THEN it SHALL include god nodes, surprising connections with
reasons, a confidence summary, why-nodes when present, and at least 4 suggested questions.

@check kind=unit ref=test/report.test.ts::carries god nodes, surprises, confidence, why-nodes, and ≥4 questions
@check kind=unit ref=test/report.test.ts::suggestedQuestions seeds from brokers and ambiguity
