import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { defaultExtractors } from "../src/extract/index.js";
import { buildGraph } from "../src/index.js";
import { createCodeIngestor } from "../src/ingest/code.js";
import { gatedIngestorLoaders } from "../src/ingest/index.js";
import { detectBackend } from "../src/ingest/llm/backends.js";
import { llmDocsIngestor } from "../src/ingest/llm/docs.js";
import { scipFragment, scipIngestor } from "../src/ingest/tools/local.js";
import { sqlIngestor } from "../src/ingest/tools/sql.js";
import { walkFileRefs } from "../src/ingest/walk.js";

/** Edge-case coverage for the ingest layer — the sync regex fallback, the async-only gated
 *  loaders, the offline tool parsers, and the LLM-backend selection, all offline/deterministic. */

const tmp = (prefix: string): string => mkdtempSync(join(tmpdir(), `revitify-${prefix}-`));
const ctx = { rootDir: "/x", knownFiles: new Set<string>() };

describe("ingest/fallback (sync regex path via buildGraph)", () => {
  it("extracts a python-shebang script, bare-nodes an unknown interpreter and a newline-less file", () => {
    const dir = tmp("shebang");
    writeFileSync(join(dir, "tool"), "#!/usr/bin/env python3\ndef main():\n    pass\n");
    writeFileSync(join(dir, "script"), "#!/usr/bin/perl\nprint 1;\n");
    writeFileSync(join(dir, "oneliner"), "#!/usr/bin/env python3"); // no trailing newline
    const ids = new Set(buildGraph(dir).nodes.map((n) => n.id));
    expect(ids.has("sym:tool#main")).toBe(true); // shebang → python regex extractor → re-keyed
    expect(ids.has("file:script")).toBe(true); // perl unrecognized → bare file node
    expect(ids.has("file:oneliner")).toBe(true);
  });
});

describe("ingest/code", () => {
  it("bare-nodes a file no extractor recognizes", async () => {
    const ing = createCodeIngestor(defaultExtractors);
    const frag = await ing.ingest(
      { path: "/x/a.txt", relPath: "a.txt", size: 2, content: "hi" },
      ctx,
    );
    expect(frag.nodes.some((n) => n.id === "file:a.txt")).toBe(true);
    expect(frag.nodes.every((n) => !n.id.startsWith("sym:"))).toBe(true);
  });
});

describe("ingest/index gated loaders", () => {
  it("the scip loader matches index.scip and loads the scip ingestor", async () => {
    const scip = gatedIngestorLoaders.find((g) => g.id === "scip");
    expect(scip?.matches("foo/index.scip")).toBe(true);
    expect(scip?.matches("foo.ts")).toBe(false);
    expect((await scip?.load())?.id).toBe("scip");
  });
});

describe("ingest tools via the sync pipeline (available() === true)", () => {
  it("runs the cargo and sql ingestors on a real fixture", () => {
    const dir = tmp("tools");
    writeFileSync(join(dir, "Cargo.toml"), '[package]\nname = "x"\n[dependencies]\nserde = "1"\n');
    writeFileSync(join(dir, "schema.sql"), "CREATE TABLE t (id int);");
    const kinds = new Set(buildGraph(dir).nodes.map((n) => n.kind));
    expect(kinds.has("crate")).toBe(true);
    expect(kinds.has("dependency")).toBe(true);
    expect(kinds.has("table")).toBe(true);
  });

  it("sql ingestion skips constraint lines", () => {
    const frag = sqlIngestor.ingestSync?.(
      {
        path: "/x/s.sql",
        relPath: "s.sql",
        size: 1,
        content: "CREATE TABLE t (\n  id integer,\n  PRIMARY KEY (id)\n);",
      },
      ctx,
    );
    expect(frag?.nodes.some((n) => n.label === "id")).toBe(true);
    expect(frag?.nodes.some((n) => n.label === "PRIMARY")).toBe(false);
  });
});

describe("ingest/tools/local (scip parsing + availability)", () => {
  it("scip available() is a boolean (which-lookup)", () => {
    expect(typeof scipIngestor.available({})).toBe("boolean");
  });

  it("scipFragment tolerates missing documents / symbols / symbol / relative_path", () => {
    expect(scipFragment("index.scip", "{}").nodes).toHaveLength(1); // documents ?? []
    expect(
      scipFragment("index.scip", JSON.stringify({ documents: [{ relative_path: "a.ts" }] })).nodes,
    ).toHaveLength(1); // symbols ?? []
    const frag = scipFragment(
      "index.scip",
      JSON.stringify({ documents: [{ symbols: [{}, { symbol: "nopath" }] }] }),
    );
    expect(frag.nodes.some((n) => n.id === "scip:index.scip#nopath")).toBe(true); // {} skipped; relative_path ?? rel
  });

  it.skipIf(process.platform === "win32")(
    "returns an empty fragment when the scip binary exits non-zero",
    async () => {
      const dir = tmp("scip-fail");
      const bin = join(dir, "scip");
      writeFileSync(bin, "#!/bin/sh\nexit 3\n");
      chmodSync(bin, 0o755);
      const scipFile = join(dir, "index.scip");
      writeFileSync(scipFile, "");
      const orig = process.env.PATH;
      process.env.PATH = `${dir}${delimiter}${orig ?? ""}`;
      try {
        const frag = await scipIngestor.ingest(
          { path: scipFile, relPath: "index.scip", size: 0, content: "" },
          { rootDir: dir, knownFiles: new Set() },
        );
        expect(frag).toEqual({ nodes: [], links: [] });
      } finally {
        process.env.PATH = orig;
      }
    },
  );
});

describe("ingest/walk", () => {
  it("drops files at or above the 2MB cap", () => {
    const dir = tmp("walk");
    writeFileSync(join(dir, "small.ts"), "export const a = 1;");
    writeFileSync(join(dir, "big.bin"), Buffer.alloc(2_000_001));
    const rels = new Set(walkFileRefs(dir).map((r) => r.relPath));
    expect(rels.has("small.ts")).toBe(true);
    expect(rels.has("big.bin")).toBe(false);
  });
});

describe("ingest/llm backends + docs", () => {
  it("detectBackend selects ollama via REVITIFY_OLLAMA with the default host", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ response: "ok" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const backend = detectBackend({ REVITIFY_OLLAMA: "1" } as NodeJS.ProcessEnv);
      expect(backend?.id).toBe("ollama");
      expect(await backend?.complete("p")).toBe("ok");
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain("127.0.0.1:11434");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("llmDocsIngestor returns empty when no backend is available", async () => {
    for (const k of [
      "ANTHROPIC_API_KEY",
      "GEMINI_API_KEY",
      "GOOGLE_API_KEY",
      "OPENAI_API_KEY",
      "OLLAMA_HOST",
      "REVITIFY_OLLAMA",
    ])
      vi.stubEnv(k, "");
    try {
      const frag = await llmDocsIngestor.ingest(
        { path: "/x/a.pdf", relPath: "a.pdf", size: 4, content: "%PDF" },
        ctx,
      );
      expect(frag).toEqual({ nodes: [], links: [] });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("llmDocsIngestor builds concept nodes from long printable content", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ content: [{ text: '["billing","ledger"]' }] }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const content =
        "This document describes the billing ledger and the payment reconciliation flow in detail.";
      const frag = await llmDocsIngestor.ingest(
        { path: "/x/notes.pdf", relPath: "notes.pdf", size: content.length, content },
        ctx,
      );
      expect(frag.nodes.some((n) => n.label === "billing")).toBe(true);
      const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
      expect(body.messages[0].content).toContain("in this document");
    } finally {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });
});
