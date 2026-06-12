/**
 * Language detection (port of graphify detect.py at the breadth revitify ships).
 * Extension-based today; shebang sniffing for extensionless scripts arrives with the
 * content-aware detect pass. One map — registrations and reports both read it.
 */
export const EXTENSION_LANGUAGES: Readonly<Record<string, string>> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mts": "typescript",
  ".cts": "typescript",
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".pyi": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".md": "markdown",
};

export function detectLanguage(relPath: string): string | undefined {
  const dot = relPath.lastIndexOf(".");
  if (dot === -1) return undefined;
  return EXTENSION_LANGUAGES[relPath.slice(dot)];
}
