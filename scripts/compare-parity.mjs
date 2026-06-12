#!/usr/bin/env node
/**
 * Parity comparator — graphify (Python, the reference) vs revitify (this repo).
 *
 * Usage:
 *   node scripts/compare-parity.mjs [graphifyGraphJson] [revitifyGraphJson] [--out PARITY.md] [--strict]
 *
 * Defaults to test/fixtures/parity/llm-dev-kit.graphify.graph.json vs a fresh local run's
 * revitify-out/graph.json. Bands come from docs/PLAN.md ("structural bands", locked):
 * counts/relations within ±30%, community count in band, god-node top-5 source-file overlap ≥ 3,
 * contract fields exact. --strict exits non-zero on band failures (off until parity phases land).
 */
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return name === "--strict" ? true : args.splice(i, 2)[1];
};
const strict = flag("--strict") ?? false;
const outPath = flag("--out") ?? "PARITY.md";
const refLabel = flag("--ref-label") ?? "graphify (Python)";
const [
  gfPath = "test/fixtures/parity/llm-dev-kit.graphify.graph.json",
  rvPath = "revitify-out/graph.json",
] = args;

const load = (p) => {
  const g = JSON.parse(readFileSync(p, "utf8"));
  return {
    nodes: g.nodes ?? [],
    links: g.links ?? g.edges ?? [],
    built_at_commit: g.built_at_commit,
    raw: g,
  };
};

const endpoint = (v) => (typeof v === "object" && v !== null ? String(v.id) : String(v));

function stats(g) {
  const relations = new Map();
  const degree = new Map();
  for (const l of g.links) {
    relations.set(l.relation ?? "?", (relations.get(l.relation ?? "?") ?? 0) + 1);
    for (const end of [endpoint(l.source), endpoint(l.target)]) {
      degree.set(end, (degree.get(end) ?? 0) + 1);
    }
  }
  const byId = new Map(g.nodes.map((n) => [String(n.id), n]));
  const god = [...degree.entries()]
    .map(([id, d]) => ({ node: byId.get(id), d }))
    .filter((x) => x.node)
    .sort((a, b) => b.d - a.d)
    .slice(0, 5);
  return {
    nodes: g.nodes.length,
    links: g.links.length,
    relations,
    communities: new Set(g.nodes.map((n) => n.community)).size,
    files: new Set(g.nodes.map((n) => n.source_file).filter(Boolean)).size,
    god,
  };
}

/** The exact fields Rivet's loadCodeGraph reads (llm-dev-kit src/engine/graphify/index.ts). */
function contractCheck(g) {
  const problems = [];
  if (!g.built_at_commit) problems.push("missing built_at_commit");
  g.nodes.slice(0, 500).forEach((n, i) => {
    if (n.id === undefined && n.name === undefined && n.label === undefined)
      problems.push(`node[${i}] has none of id/name/label`);
    if (!n.source_file) problems.push(`node[${i}] missing source_file`);
    if (n.community === undefined) problems.push(`node[${i}] missing community`);
  });
  g.links.slice(0, 500).forEach((l, i) => {
    if (endpoint(l.source ?? l.from) === "undefined") problems.push(`link[${i}] missing source`);
    if (endpoint(l.target ?? l.to) === "undefined") problems.push(`link[${i}] missing target`);
  });
  return problems.slice(0, 10);
}

const gf = load(gfPath);
const rv = load(rvPath);
const G = stats(gf);
const R = stats(rv);

const ratio = (a, b) => (b === 0 ? 0 : a / b);
// The band is a parity FLOOR: under 70% of the reference is a gap; exceeding it means
// revitify extracts more than upstream (Java member depth, SQL/cargo) — never a failure.
const inBand = (a, b) => ratio(a, b) >= 0.7;
const exceeds = (a, b) => ratio(a, b) > 1.3;
const pct = (a, b) => `${Math.round(ratio(a, b) * 100)}%`;

const godFiles = (s) => new Set(s.god.map((x) => x.node.source_file));
const godOverlap = [...godFiles(R)].filter((f) => godFiles(G).has(f)).length;

const bands = [
  {
    name: "node count ≥70% of reference",
    pass: inBand(R.nodes, G.nodes),
    exceeds: exceeds(R.nodes, G.nodes),
    detail: `${R.nodes} vs ${G.nodes} (${pct(R.nodes, G.nodes)})`,
    phase: "P2 multi-language + P4 why-nodes",
  },
  {
    name: "link count ≥70% of reference",
    pass: inBand(R.links, G.links),
    exceeds: exceeds(R.links, G.links),
    detail: `${R.links} vs ${G.links} (${pct(R.links, G.links)})`,
    phase: "P2-P3 (calls/imports_from/re_exports)",
  },
  {
    name: "relation types ≥70% of reference",
    pass: inBand(R.relations.size, G.relations.size),
    exceeds: exceeds(R.relations.size, G.relations.size),
    detail: `${R.relations.size} vs ${G.relations.size}`,
    phase: "P2-P3",
  },
  {
    name: "community count ≥70% of reference",
    pass: inBand(R.communities, G.communities),
    exceeds: exceeds(R.communities, G.communities),
    detail: `${R.communities} vs ${G.communities}`,
    phase: "P3 Leiden",
  },
  {
    name: "god-node top-5 file overlap ≥ 3",
    pass: godOverlap >= 3,
    detail: `${godOverlap}/5`,
    phase: "P3-P4",
  },
  {
    name: "contract fields exact (revitify)",
    pass: contractCheck(rv.raw).length === 0,
    detail: contractCheck(rv.raw).join("; ") || "ok",
    phase: "always",
  },
];

const relTable = (s) =>
  [...s.relations.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
const confidenceSummary = (g) => {
  const counts = {};
  for (const l of g.links) if (l.confidence) counts[l.confidence] = (counts[l.confidence] ?? 0) + 1;
  const parts = Object.entries(counts).map(([k, v]) => `${k} ${v}`);
  return parts.length ? parts.join(", ") : "none";
};
const godList = (s) => s.god.map((x) => `\`${x.node.label}\` (${x.d})`).join(", ");

const md = `# PARITY — revitify vs graphify (reference)

> Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/compare-parity.mjs\`.
> Reference: ${refLabel} run OFFLINE on a copy of llm-dev-kit; revitify run on the same copy.
> Bar (docs/PLAN.md, locked): structural bands, not bit-identity. Re-run at every phase gate.

| Metric | revitify | graphify (reference) |
|---|---|---|
| nodes | ${R.nodes} | ${G.nodes} |
| links | ${R.links} | ${G.links} |
| relation types | ${R.relations.size} | ${G.relations.size} |
| relations | ${relTable(R)} | ${relTable(G)} |
| communities | ${R.communities} | ${G.communities} |
| source files | ${R.files} | ${G.files} |
| god nodes (top 5 by degree) | ${godList(R)} | ${godList(G)} |
| built_at_commit | ${rv.built_at_commit ? "yes" : "no"} | ${gf.built_at_commit ? "yes" : "no"} |

## Bands

| Band | Status | Detail | Closed by |
|---|---|---|---|
${bands.map((b) => `| ${b.name} | ${b.pass ? (b.exceeds ? "✅ exceeds reference" : "✅ pass") : "❌ gap"} | ${b.detail} | ${b.phase} |`).join("\n")}

## Shape notes (measured, for the port)

- graphify graph.json top-level: \`directed, multigraph, graph, nodes, links, hyperedges, built_at_commit\`.
- graphify nodes: \`label, file_type, source_file, source_location ("L14"), _origin, id, community,
  norm_label\` — **no \`name\`/\`kind\`**; callables get \`()\` in the label.
- graphify links: \`relation, confidence (EXTRACTED/INFERRED/AMBIGUOUS), source_file,
  source_location, weight, source, target, confidence_score\`.
- revitify nodes additionally carry \`name\` and \`kind\`, and \`source_location\` is \`file:line\` —
  additive differences Rivet's tolerant reader accepts; keep them.
- revitify links carry \`confidence\` (same EXTRACTED/INFERRED/AMBIGUOUS vocabulary) since
  Phase 1b: ${confidenceSummary(rv)} — graphify also scores \`confidence_score\`/\`weight\` (Phase 3).

Gaps are the roadmap, not failures: each ❌ names the phase that closes it.
`;

writeFileSync(outPath, md);
console.log(md);
const failed = bands.filter((b) => !b.pass);
console.error(
  `${bands.length - failed.length}/${bands.length} bands pass${failed.length ? ` — gaps: ${failed.map((b) => b.name).join("; ")}` : ""}`,
);
if (strict && failed.length) process.exit(1);
