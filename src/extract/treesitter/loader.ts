import { createRequire } from "node:module";
import { Language, Parser } from "web-tree-sitter";

/**
 * One-time WASM runtime init + memoized grammar loads. This module (and everything under
 * treesitter/) is reachable ONLY via dynamic import — dependency-cruiser enforces it — so
 * `import { revitify }` never pays for web-tree-sitter. Grammar .wasm files come from the
 * official tree-sitter-<lang> npm packages (prebuilt; their native build scripts never run).
 */
const require = createRequire(import.meta.url);

let initialized: Promise<void> | undefined;
const languages = new Map<string, Promise<Language>>();

export function loadLanguage(wasmSpecifier: string): Promise<Language> {
  let lang = languages.get(wasmSpecifier);
  if (!lang) {
    initialized ??= Parser.init();
    lang = initialized.then(() => Language.load(require.resolve(wasmSpecifier)));
    languages.set(wasmSpecifier, lang);
  }
  return lang;
}

export async function createParser(wasmSpecifier: string): Promise<Parser> {
  const language = await loadLanguage(wasmSpecifier);
  const parser = new Parser();
  parser.setLanguage(language);
  return parser;
}
