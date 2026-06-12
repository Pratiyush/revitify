import { callflowExporter } from "./callflow-html.js";
import type { Exporter } from "./exporter.js";
import { htmlExporter } from "./html.js";
import { jsonExporter } from "./json.js";
import { mermaidExporter } from "./mermaid.js";
import { reportExporter } from "./report.js";
import { treeExporter } from "./tree-html.js";
import { wikiExporter } from "./wiki.js";

/** The contract artifacts, in write order — every revitify run emits these three. */
export const defaultExporters: readonly Exporter[] = [jsonExporter, htmlExporter, reportExporter];

/** Opt-in exporters (graphify's callflow-html / tree-html / wiki / mermaid verbs). */
export const extraExporters: readonly Exporter[] = [
  callflowExporter,
  treeExporter,
  wikiExporter,
  mermaidExporter,
];
