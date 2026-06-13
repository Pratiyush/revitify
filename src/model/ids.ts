/**
 * The node-id scheme, in ONE place. An id encodes what a node is and where it lives:
 *
 *   file:<rel>            a source file
 *   sym:<rel>#<name>      a symbol (members nest the name: <Container>.<member>)
 *   name:<n>              a transient reference target, resolved away by passes/resolve
 *   why:<rel>#L<line>     a NOTE/WHY/HACK comment
 *   doc:<rel>#<heading>   a markdown heading
 *   docstring:<rel>#<sym> a docstring
 *   concept:<rel>#<x>     an LLM-extracted document concept
 *   jsonkey:<rel>#<key>   a top-level JSON key
 *   transcript:<rel>#<i>  an audio/video transcript segment
 *   scip:<rel>#<symbol>   a SCIP-indexed symbol
 *   dep:<rel>#<name>      a Cargo dependency
 *
 * Builders here are the ONLY place these strings are constructed; the predicates/parsers the
 * only place they're taken apart. Pure (model layer — no node:*, no other layers).
 */

export const fileId = (rel: string): string => `file:${rel}`;
export const symId = (rel: string, name: string): string => `sym:${rel}#${name}`;
export const nameRef = (n: string): string => `name:${n}`;
export const whyId = (rel: string, line: number): string => `why:${rel}#L${line}`;
export const docId = (rel: string, heading: string): string => `doc:${rel}#${heading}`;
export const docstringId = (rel: string, sym: string): string => `docstring:${rel}#${sym}`;
export const conceptId = (rel: string, concept: string): string => `concept:${rel}#${concept}`;
export const jsonKeyId = (rel: string, key: string): string => `jsonkey:${rel}#${key}`;
export const transcriptId = (rel: string, i: number): string => `transcript:${rel}#${i}`;
export const scipId = (rel: string, symbol: string): string => `scip:${rel}#${symbol}`;
export const depId = (rel: string, dep: string): string => `dep:${rel}#${dep}`;

export const isSym = (id: string): boolean => id.startsWith("sym:");
export const isFile = (id: string): boolean => id.startsWith("file:");
export const isNameRef = (id: string): boolean => id.startsWith("name:");

/** "name:foo" → "foo". */
export const nameRefTarget = (id: string): string => id.slice("name:".length);

/** The source-file rel-path encoded in a sym:/file: id (the id itself for anything else). */
export const relOf = (id: string): string => {
  if (isSym(id)) return id.slice("sym:".length, id.indexOf("#"));
  if (isFile(id)) return id.slice("file:".length);
  return id;
};

/** The directory of a rel-path ("" for a root-level file). */
export const dirOf = (rel: string): string =>
  rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
