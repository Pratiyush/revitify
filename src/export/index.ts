import type { Exporter } from "./exporter.js";
import { htmlExporter } from "./html.js";
import { jsonExporter } from "./json.js";
import { reportExporter } from "./report.js";

/** The contract artifacts, in write order. Phase 5 exporters register here too. */
export const defaultExporters: readonly Exporter[] = [jsonExporter, htmlExporter, reportExporter];
