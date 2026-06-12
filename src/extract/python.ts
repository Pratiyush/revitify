import type { Extractor } from "./extractor.js";
import { extractByLine } from "./lines.js";

const PY_SYMBOL = /^(?:class|def)\s+([A-Za-z_]\w*)/;

/** Best-effort line grammar (top-level symbols) — tree-sitter replaces this in Phase 2. */
export const pythonExtractor: Extractor = {
  id: "ts-python",
  languages: ["python"],
  detect: (file) => file.relPath.endsWith(".py"),
  extract: (file) => extractByLine(file, PY_SYMBOL, "function"),
};
