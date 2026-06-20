import ts from "typescript";
import { Confidence } from "../model/confidence.js";
import type { SourceFile } from "../model/fragment.js";
import { fileId, nameRef, symId } from "../model/ids.js";
import type { ExtractContext, Extractor } from "./extractor.js";
import { addNode, addWhyNode, createBuilder, fileNode } from "./fragment-builder.js";

const TS_EXT = /\.(ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const SKIP_TS = /\.d\.ts$/;

/** TS/JS via the compiler API: exported symbols, class members, imports, identifier references. */
export const typescriptExtractor: Extractor = {
  id: "typescript",
  languages: ["typescript", "javascript"],
  detect: (file) => TS_EXT.test(file.relPath) && !SKIP_TS.test(file.relPath),
  extract(file: SourceFile, ctx: ExtractContext) {
    const b = createBuilder();
    const rel = file.relPath;
    const selfId = fileNode(b, rel);
    const sf = ts.createSourceFile(rel, file.content, ts.ScriptTarget.Latest, true);
    const line = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

    const symbol = (name: string, node: ts.Node, kind: string) => {
      const id = symId(rel, name);
      addNode(b, id, name, kind, rel, line(node));
      b.links.push({
        source: selfId,
        target: id,
        relation: "contains",
        confidence: Confidence.EXTRACTED,
      });
      return id;
    };

    // Call references from inside a symbol's body — resolved (and confidence-tagged) by
    // passes/resolve; unresolvable callees (built-ins, externals) drop out there.
    const collectCalls = (root: ts.Node, fromId: string) => {
      const callees = new Set<string>();
      const calleeName = (expr: ts.Expression): string | undefined => {
        if (ts.isIdentifier(expr)) return expr.text;
        if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
        // obj["method"]() — element access keyed by a string literal
        if (ts.isElementAccessExpression(expr) && ts.isStringLiteral(expr.argumentExpression))
          return expr.argumentExpression.text;
        return undefined;
      };
      const walk = (node: ts.Node): void => {
        // A call/new is `expr(...)`; a tagged template `tag`...`` counts as a call on its tag.
        let calleeExpr: ts.Expression | undefined;
        if (ts.isCallExpression(node) || ts.isNewExpression(node)) calleeExpr = node.expression;
        else if (ts.isTaggedTemplateExpression(node)) calleeExpr = node.tag;
        if (calleeExpr) {
          const callee = calleeName(calleeExpr);
          if (callee) callees.add(callee);
        }
        ts.forEachChild(node, walk);
      };
      ts.forEachChild(root, walk);
      for (const callee of callees) {
        b.links.push({ source: fromId, target: nameRef(callee), relation: "calls" });
      }
    };

    const importedNames: string[] = [];
    for (const stmt of sf.statements) {
      if (
        ts.isExportDeclaration(stmt) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.startsWith(".")) {
          const targetRel = resolveImport(rel, spec, ctx.knownFiles);
          if (targetRel !== undefined) {
            b.links.push({
              source: selfId,
              target: fileId(targetRel),
              relation: "re_exports",
              confidence: Confidence.EXTRACTED,
            });
          }
        }
        continue;
      }
      if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.startsWith(".")) {
          // Resolve against the walked-file set — a dangling spec produces NO edge (1b fix;
          // the old code emitted guessed `file:` targets unchecked).
          const targetRel = resolveImport(rel, spec, ctx.knownFiles);
          if (targetRel !== undefined) {
            b.links.push({
              source: selfId,
              target: fileId(targetRel),
              relation: "imports",
              confidence: Confidence.EXTRACTED,
            });
          }
        }
        const clause = stmt.importClause;
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const el of clause.namedBindings.elements) importedNames.push(el.name.text);
        }
        if (clause?.name) importedNames.push(clause.name.text);
        continue;
      }
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        const id = symbol(stmt.name.text, stmt, "function");
        if (stmt.body) collectCalls(stmt.body, id);
      } else if (ts.isClassDeclaration(stmt) && stmt.name) {
        const classId = symbol(stmt.name.text, stmt, "class");
        for (const member of stmt.members) {
          if (
            (ts.isMethodDeclaration(member) || ts.isGetAccessor(member)) &&
            member.name &&
            ts.isIdentifier(member.name)
          ) {
            const mId = symId(rel, `${stmt.name.text}.${member.name.text}`);
            addNode(b, mId, member.name.text, "method", rel, line(member));
            b.links.push({
              source: classId,
              target: mId,
              relation: "method",
              confidence: Confidence.EXTRACTED,
            });
            if (member.body) collectCalls(member.body, mId);
          }
        }
      } else if (ts.isInterfaceDeclaration(stmt)) symbol(stmt.name.text, stmt, "interface");
      else if (ts.isEnumDeclaration(stmt)) symbol(stmt.name.text, stmt, "enum");
      else if (ts.isTypeAliasDeclaration(stmt)) symbol(stmt.name.text, stmt, "type");
      else if (ts.isVariableStatement(stmt)) {
        const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (exported) {
          for (const decl of stmt.declarationList.declarations) {
            if (ts.isIdentifier(decl.name)) {
              const id = symbol(decl.name.text, decl, "const");
              if (
                decl.initializer &&
                (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
              ) {
                collectCalls(decl.initializer, id);
              }
            }
          }
        }
      }
    }
    // Reference edges: this file uses the names it imported (target symbol may live anywhere).
    // Untagged here — passes/resolve assigns INFERRED or AMBIGUOUS when it resolves `name:`.
    for (const name of importedNames) {
      b.links.push({ source: selfId, target: nameRef(name), relation: "imports_from" });
    }
    // Why-nodes: NOTE:/WHY:/HACK: comments, attached to the symbol declared on the next line
    // (falling back to the file). One scan over comment ranges via the scanner-less regex walk.
    const lineStarts = sf.getLineStarts();
    const commentRe = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
    const symbolByLine = new Map<number, string>();
    for (const n of b.nodes) {
      if (n.source_location) {
        symbolByLine.set(Number(n.source_location.slice(rel.length + 1)), n.id);
      }
    }
    for (const m of file.content.matchAll(commentRe)) {
      const start = m.index as number; // matchAll always sets a numeric .index
      let line = lineStarts.findIndex((s) => s > start);
      line = line === -1 ? lineStarts.length : line; // 1-based line of the comment start
      const commentLines = (m[0].match(/\n/g)?.length ?? 0) + 1;
      const anchor = symbolByLine.get(line + commentLines) ?? symbolByLine.get(line) ?? selfId;
      addWhyNode(b, rel, m[0], line, anchor);
    }
    return { nodes: b.nodes, links: b.links };
  },
};

/**
 * "./crypto.js" from "src/auth.ts" → "src/crypto.ts" — but only if it exists in the walked set.
 * Order (docs/PLAN.md): as-written, runtime-extension swaps, extensionless completion, /index.*.
 */
function resolveImport(
  fromRel: string,
  spec: string,
  knownFiles: ReadonlySet<string>,
): string | undefined {
  const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")) : "";
  const parts = (dir ? dir.split("/") : []).concat(spec.split("/"));
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "." || p === "") continue;
    if (p === "..") stack.pop();
    else stack.push(p);
  }
  const joined = stack.join("/");
  const candidates = [
    joined,
    joined.replace(/\.js$/, ".ts"),
    joined.replace(/\.js$/, ".tsx"),
    joined.replace(/\.mjs$/, ".mts"),
    joined.replace(/\.cjs$/, ".cts"),
    joined.replace(/\.jsx$/, ".tsx"),
    `${joined}.ts`,
    `${joined}.tsx`,
    `${joined}.js`,
    `${joined}.jsx`,
    `${joined}.mts`,
    `${joined}.mjs`,
    `${joined}/index.ts`,
    `${joined}/index.tsx`,
    `${joined}/index.js`,
  ];
  return candidates.find((c) => knownFiles.has(c));
}
