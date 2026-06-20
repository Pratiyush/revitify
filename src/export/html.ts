import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { RevitifyGraph } from "../model/graph.js";
import type { Exporter } from "./exporter.js";

/**
 * graph.html — the redesigned interactive viewer (docs/design/graph-viewer-handoff.md):
 * Cytoscape + fcose, legend-as-filter, four views, focus mode, movement physics, themes,
 * URL-hash state, PNG/JSON export. The committed template is byte-identical to the design
 * handoff; at render time its four CDN <script> tags are replaced with the same libraries
 * INLINED (offline invariant — dev-spec-kit embeds this file in an iframe with no network), and the
 * single DATA INJECTION line receives the graph.
 */

const require = createRequire(import.meta.url);

interface ViewerAssets {
  template: string;
  inlineLibs: string;
}

let assets: ViewerAssets | undefined;

function loadAssets(): ViewerAssets {
  if (assets) return assets;
  const template = readFileSync(
    fileURLToPath(new URL("./assets/graph-template.html", import.meta.url)),
    "utf8",
  );
  // UMD load order matters: cytoscape, then layout-base → cose-base → fcose (each consumes the
  // previous global). pnpm's strict layout means nested deps resolve hop by hop.
  const cytoscape = require.resolve("cytoscape/dist/cytoscape.min.js");
  const fcosePkg = require.resolve("cytoscape-fcose/package.json");
  const fromFcose = createRequire(fcosePkg);
  const coseBase = fromFcose.resolve("cose-base");
  const layoutBase = createRequire(coseBase).resolve("layout-base");
  const fcose = fromFcose.resolve("cytoscape-fcose");
  const libs: Array<[string, string]> = [
    ["cytoscape (MIT)", cytoscape],
    ["layout-base (MIT)", layoutBase],
    ["cose-base (MIT)", coseBase],
    ["cytoscape-fcose (MIT)", fcose],
  ];
  const inlineLibs = libs
    .map(
      ([name, path]) =>
        `<script>/* ${name} — inlined for offline */\n${readFileSync(path, "utf8")}\n</script>`,
    )
    .join("\n");
  assets = { template, inlineLibs };
  return assets;
}

export function renderHtml(graph: RevitifyGraph): string {
  const { template, inlineLibs } = loadAssets();
  const data = JSON.stringify({
    nodes: graph.nodes,
    links: graph.links,
    ...(graph.built_at_commit ? { built_at_commit: graph.built_at_commit } : {}),
  }).replace(/</g, "\\u003c");
  // Function-form replacements: the inlined libraries (and any data) may contain `$'`/`$&`
  // sequences, which string-form replacements interpret as substitution patterns.
  return template
    .replace(/<script src="https:\/\/unpkg\.com\/[^"]+"><\/script>\n?/g, "")
    .replace(
      "<!-- Cytoscape + fcose layout -->",
      () =>
        `<!-- Cytoscape + fcose layout — inlined for offline (see export/html.ts) -->\n${inlineLibs}`,
    )
    .replace(
      "window.__GRAPHIFY_DATA__ = window.__GRAPHIFY_DATA__ || null;",
      () => `window.__GRAPHIFY_DATA__ = ${data};`,
    );
}

export const htmlExporter: Exporter = {
  id: "html",
  filename: "graph.html",
  render: (graph) => renderHtml(graph),
};
