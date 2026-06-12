import type { Extractor } from "./extractor.js";
import { extractByLine } from "./lines.js";

const JAVA_SYMBOL =
  /^\s*(?:public|protected|private|abstract|final|static|\s)*\s*(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/;

/** Best-effort line grammar (type declarations) — tree-sitter replaces this in Phase 2. */
export const javaExtractor: Extractor = {
  id: "ts-java",
  languages: ["java"],
  detect: (file) => file.relPath.endsWith(".java"),
  extract: (file) => extractByLine(file, JAVA_SYMBOL, "class"),
};
