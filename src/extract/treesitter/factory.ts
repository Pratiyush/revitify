import type { Node, Parser } from "web-tree-sitter";
import { Confidence } from "../../model/confidence.js";
import type { SourceFile } from "../../model/fragment.js";
import type { ExtractContext, Extractor } from "../extractor.js";
import {
  addNode,
  addWhyNode,
  createBuilder,
  type FragmentBuilder,
  fileNode,
} from "../fragment-builder.js";
import { createParser } from "./loader.js";

/**
 * Data-driven tree-sitter extraction (port of graphify extract.py's per-language configs).
 * One generic walker; adding a language = one LanguageConfig. Definition rules mirror each
 * grammar's node types — Java deliberately covers constructors, methods, and fields, not just
 * type declarations. Member symbols nest as `sym:<rel>#<Container>.<name>`, matching the
 * TypeScript extractor's scheme.
 */

export interface DefinitionRule {
  /** AST node type, e.g. "class_declaration". */
  readonly type: string;
  /** Emitted node kind, e.g. "class" | "method" | "constructor" | "field". */
  readonly kind: string;
  /** Field holding the name node (default "name"). */
  readonly nameField?: string;
  /** When the name hides in a child (e.g. java field_declaration → variable_declarator). */
  readonly nameChildType?: string;
  /** C-family: the name lives inside a declarator ("int main(void)" → "main"). */
  readonly nameStrategy?: "declarator";
  /** Definitions found inside become `Container.member` symbols. */
  readonly container?: boolean;
}

export interface ImportRule {
  /** AST node type of the import statement. */
  readonly type: string;
  /** Field/child capture for a file-resolvable module path (dots → slashes). */
  readonly moduleField?: string;
  /** Candidate rel-path patterns; `$1` is the module path. Checked against knownFiles. */
  readonly filePatterns?: readonly string[];
  /** Capture imported identifiers as `name:` references (resolved by passes/resolve). */
  readonly nameTypes?: readonly string[];
}

export interface CallRule {
  /** AST node type of a call site, e.g. "call_expression" | "method_invocation". */
  readonly type: string;
  /** Field holding the callee (default "function"); rightmost path segment is the name. */
  readonly calleeField?: string;
}

export interface CommentConfig {
  /** AST node types carrying comments, e.g. ["comment"] | ["line_comment", "block_comment"]. */
  readonly types: readonly string[];
}

export interface LanguageConfig {
  readonly id: string;
  readonly language: string;
  readonly wasm: string;
  readonly extensions: readonly string[];
  readonly definitions: readonly DefinitionRule[];
  readonly imports?: readonly ImportRule[];
  readonly calls?: readonly CallRule[];
  readonly comments?: CommentConfig;
  /** Python-style: first string statement in a definition body becomes a docstring node. */
  readonly docstrings?: boolean;
}

export async function createTreeSitterExtractor(config: LanguageConfig): Promise<Extractor> {
  const parser: Parser = await createParser(config.wasm);
  const rules = new Map(config.definitions.map((d) => [d.type, d]));
  const importRules = new Map((config.imports ?? []).map((r) => [r.type, r]));
  const callRules = new Map((config.calls ?? []).map((r) => [r.type, r]));
  const commentTypes = new Set(config.comments?.types ?? []);

  return {
    id: config.id,
    languages: [config.language],
    detect: (file) => config.extensions.some((ext) => file.relPath.endsWith(ext)),
    extract(file: SourceFile, ctx: ExtractContext) {
      const b = createBuilder();
      const rel = file.relPath;
      const fileId = fileNode(b, rel);
      const tree = parser.parse(file.content);
      if (!tree) return { nodes: b.nodes, links: b.links };
      const referenced: string[] = [];

      // containerId/Name: parent for contains edges + member qualification (container rules).
      // enclosingId: nearest definition symbol — the source of call edges found in its body.
      const calls = new Map<string, Set<string>>();
      const visit = (
        node: Node,
        containerId: string,
        containerName: string | undefined,
        enclosingId: string,
      ): void => {
        for (const child of node.namedChildren) {
          if (child === null) continue;
          if (commentTypes.has(child.type)) {
            addWhyNode(b, rel, child.text, child.startPosition.row + 1, enclosingId);
            continue;
          }
          const importRule = importRules.get(child.type);
          if (importRule) {
            collectImport(b, child, importRule, fileId, rel, ctx, referenced);
            continue;
          }
          const callRule = callRules.get(child.type);
          if (callRule) {
            const callee = child.childForFieldName(callRule.calleeField ?? "function");
            const name = callee?.text.split(".").pop()?.split("::").pop();
            if (name && /^[A-Za-z_]\w*$/.test(name)) {
              let set = calls.get(enclosingId);
              if (!set) {
                set = new Set();
                calls.set(enclosingId, set);
              }
              set.add(name);
            }
            visit(child, containerId, containerName, enclosingId); // nested calls in args
            continue;
          }
          const rule = rules.get(child.type);
          const name = rule ? definitionName(child, rule) : undefined;
          if (!rule || !name) {
            visit(child, containerId, containerName, enclosingId);
            continue;
          }
          const symbolName = containerName ? `${containerName}.${name}` : name;
          const id = `sym:${rel}#${symbolName}`;
          addNode(b, id, name, rule.kind, rel, child.startPosition.row + 1);
          b.links.push({
            source: containerId,
            target: id,
            relation:
              containerId !== fileId && ["method", "constructor", "function"].includes(rule.kind)
                ? "method"
                : "contains",
            confidence: Confidence.EXTRACTED,
          });
          if (config.docstrings) {
            const doc = pythonDocstring(child);
            if (doc) {
              const docId = `docstring:${rel}#${symbolName}`;
              addNode(b, docId, doc, "docstring", rel, child.startPosition.row + 1);
              b.links.push({
                source: id,
                target: docId,
                relation: "documents",
                confidence: Confidence.EXTRACTED,
              });
            }
          }
          // Recurse into every definition: nested defs (container rules qualify them) and
          // call sites inside the body, attributed to this symbol.
          // Containers pass their QUALIFIED name down — deep nesting keeps the full path
          // (Billing.Invoice.audit, not Invoice.audit).
          visit(
            child,
            rule.container ? id : containerId,
            rule.container ? symbolName : containerName,
            id,
          );
        }
      };
      visit(tree.rootNode, fileId, undefined, fileId);
      for (const [from, callees] of calls) {
        for (const callee of callees) {
          b.links.push({ source: from, target: `name:${callee}`, relation: "calls" });
        }
      }

      for (const name of referenced) {
        b.links.push({ source: fileId, target: `name:${name}`, relation: "imports_from" });
      }
      return { nodes: b.nodes, links: b.links };
    },
  };
}

/** First string statement in a definition body — Python's docstring convention. */
function pythonDocstring(def: Node): string | undefined {
  const body = def.childForFieldName("body");
  const first = body?.namedChildren[0];
  if (first?.type !== "expression_statement") return undefined;
  const str = first.namedChildren[0];
  if (str?.type !== "string") return undefined;
  const text = str.text.replace(/^[rbu]*['"]{1,3}/i, "").replace(/['"]{1,3}$/, "");
  const firstLine = text.trim().split("\n")[0]?.trim();
  return firstLine ? firstLine.slice(0, 160) : undefined;
}

function definitionName(node: Node, rule: DefinitionRule): string | undefined {
  const direct = node.childForFieldName(rule.nameField ?? "name");
  if (direct) {
    if (rule.nameStrategy !== "declarator") return direct.text;
    // "int main(void)" / "*Engine::start(...)" → the identifier before the parameter list.
    const head = direct.text.split("(")[0] ?? "";
    const name = head
      .trim()
      .split(/[\s*&:]+/)
      .filter(Boolean)
      .pop();
    return name && /^[A-Za-z_]\w*$/.test(name) ? name : undefined;
  }
  if (rule.nameChildType) {
    // BFS — the carrier may nest (c# field_declaration → variable_declaration → declarator).
    const queue: Node[] = [...node.namedChildren].filter((c): c is Node => c !== null);
    while (queue.length) {
      const child = queue.shift() as Node;
      if (child.type === rule.nameChildType) {
        return child.childForFieldName("name")?.text ?? child.text;
      }
      for (const next of child.namedChildren) if (next) queue.push(next);
    }
  }
  return undefined;
}

function collectImport(
  b: FragmentBuilder,
  node: Node,
  rule: ImportRule,
  fileId: string,
  _rel: string,
  ctx: ExtractContext,
  referenced: string[],
): void {
  const moduleNode = rule.moduleField
    ? (node.childForFieldName(rule.moduleField) ?? node.namedChildren[0])
    : undefined;
  if (moduleNode && rule.filePatterns) {
    const modulePath = moduleNode.text.replace(/\./g, "/");
    const target = rule.filePatterns
      .map((p) => p.replace("$1", modulePath))
      .find((candidate) => ctx.knownFiles.has(candidate));
    if (target) {
      b.links.push({
        source: fileId,
        target: `file:${target}`,
        relation: "imports",
        confidence: Confidence.EXTRACTED,
      });
    }
  }
  if (rule.nameTypes) {
    const stack: Node[] = [node];
    while (stack.length) {
      const current = stack.pop();
      // Compare by node identity, not wrapper-object reference: web-tree-sitter returns a fresh
      // wrapper for the same node via childForFieldName vs namedChildren, so `===` never matches
      // and the module path's tail segment would leak as a phantom reference.
      if (!current || (moduleNode !== undefined && current.id === moduleNode.id)) continue;
      if (rule.nameTypes.includes(current.type) && current !== node) {
        // Prefer the name field (aliased_import "y as z" → "y"); last path segment otherwise.
        const text = current.childForFieldName("name")?.text ?? current.text;
        referenced.push(text.split(".").pop() ?? text);
        continue;
      }
      for (const child of current.namedChildren) if (child) stack.push(child);
    }
  }
}
