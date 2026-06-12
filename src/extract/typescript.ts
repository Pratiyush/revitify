import ts from "typescript";
import type { SourceFile } from "../model/fragment.js";
import type { Extractor } from "./extractor.js";
import { addNode, createBuilder, fileNode } from "./fragment-builder.js";

const TS_EXT = /\.(ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const SKIP_TS = /\.d\.ts$/;

/** TS/JS via the compiler API: exported symbols, class members, imports, identifier references. */
export const typescriptExtractor: Extractor = {
  id: "typescript",
  languages: ["typescript", "javascript"],
  detect: (file) => TS_EXT.test(file.relPath) && !SKIP_TS.test(file.relPath),
  extract(file: SourceFile) {
    const b = createBuilder();
    const rel = file.relPath;
    const fileId = fileNode(b, rel);
    const sf = ts.createSourceFile(rel, file.content, ts.ScriptTarget.Latest, true);
    const line = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

    const symbol = (name: string, node: ts.Node, kind: string) => {
      const id = `sym:${rel}#${name}`;
      addNode(b, id, name, kind, rel, line(node));
      b.links.push({ source: fileId, target: id, relation: "contains" });
      return id;
    };

    const importedNames: string[] = [];
    for (const stmt of sf.statements) {
      if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.startsWith(".")) {
          const targetRel = normalizeImport(rel, spec);
          b.links.push({ source: fileId, target: `file:${targetRel}`, relation: "imports" });
        }
        const clause = stmt.importClause;
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const el of clause.namedBindings.elements) importedNames.push(el.name.text);
        }
        if (clause?.name) importedNames.push(clause.name.text);
        continue;
      }
      if (ts.isFunctionDeclaration(stmt) && stmt.name) symbol(stmt.name.text, stmt, "function");
      else if (ts.isClassDeclaration(stmt) && stmt.name) {
        const classId = symbol(stmt.name.text, stmt, "class");
        for (const member of stmt.members) {
          if (
            (ts.isMethodDeclaration(member) || ts.isGetAccessor(member)) &&
            member.name &&
            ts.isIdentifier(member.name)
          ) {
            const mId = `sym:${rel}#${stmt.name.text}.${member.name.text}`;
            addNode(b, mId, member.name.text, "method", rel, line(member));
            b.links.push({ source: classId, target: mId, relation: "contains" });
          }
        }
      } else if (ts.isInterfaceDeclaration(stmt)) symbol(stmt.name.text, stmt, "interface");
      else if (ts.isEnumDeclaration(stmt)) symbol(stmt.name.text, stmt, "enum");
      else if (ts.isTypeAliasDeclaration(stmt)) symbol(stmt.name.text, stmt, "type");
      else if (ts.isVariableStatement(stmt)) {
        const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (exported) {
          for (const decl of stmt.declarationList.declarations) {
            if (ts.isIdentifier(decl.name)) symbol(decl.name.text, decl, "const");
          }
        }
      }
    }
    // Reference edges: this file uses the names it imported (target symbol may live anywhere).
    for (const name of importedNames) {
      b.links.push({ source: fileId, target: `name:${name}`, relation: "references" });
    }
    return { nodes: b.nodes, links: b.links };
  },
};

/** "./crypto.js" from "src/auth.ts" → "src/crypto.ts" (strip runtime .js, best-effort). */
function normalizeImport(fromRel: string, spec: string): string {
  const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")) : "";
  const parts = (dir ? dir.split("/") : []).concat(spec.split("/"));
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "." || p === "") continue;
    if (p === "..") stack.pop();
    else stack.push(p);
  }
  return stack
    .join("/")
    .replace(/\.js$/, ".ts")
    .replace(/\.mjs$/, ".mts")
    .replace(/\.jsx$/, ".tsx");
}
