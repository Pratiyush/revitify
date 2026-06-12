import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGraphAsync } from "../src/index.js";
import { detectBackend } from "../src/ingest/llm/backends.js";
import { parseConcepts } from "../src/ingest/llm/docs.js";
import { cargoIngestor } from "../src/ingest/tools/cargo.js";
import { scipFragment, transcriptFragment } from "../src/ingest/tools/local.js";
import { sqlIngestor } from "../src/ingest/tools/sql.js";
import type { SourceFile } from "../src/model/fragment.js";

/** Phase 8 — multimodal, opt-in and key-gated (upstream: llm.py, transcribe.py, scip_ingest.py,
 *  SQL/cargo introspection). No SDKs; no network in tests — fetch is stubbed or must not fire. */

const src = (relPath: string, content: string): SourceFile => ({
  path: `/x/${relPath}`,
  relPath,
  size: content.length,
  content,
});

function project(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-mm-"));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(dir, rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "."), {
      recursive: true,
    });
    writeFileSync(join(dir, rel), content);
  }
  return dir;
}

describe("backend autodetection (llm.py order)", () => {
  it("anthropic → gemini → openai → ollama → none", () => {
    expect(detectBackend({ ANTHROPIC_API_KEY: "k", OPENAI_API_KEY: "k" })?.id).toBe("anthropic");
    expect(detectBackend({ GEMINI_API_KEY: "k", OPENAI_API_KEY: "k" })?.id).toBe("gemini");
    expect(detectBackend({ GOOGLE_API_KEY: "k" })?.id).toBe("gemini");
    expect(detectBackend({ OPENAI_API_KEY: "k" })?.id).toBe("openai");
    expect(detectBackend({ OLLAMA_HOST: "http://x" })?.id).toBe("ollama");
    expect(detectBackend({})).toBeUndefined();
  });
});

describe("concept parsing", () => {
  it("tolerates fences, prose, junk; rejects non-arrays", () => {
    expect(parseConcepts('Here you go:\n```json\n["auth", "billing"]\n```')).toEqual([
      "auth",
      "billing",
    ]);
    expect(parseConcepts("no json at all")).toEqual([]);
    expect(parseConcepts('{"not": "array"}')).toEqual([]);
    expect(parseConcepts('[1, "ok", null, "  trim  "]')).toEqual(["ok", "trim"]);
  });
});

describe("key-gated doc ingestion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("with a key + mocked backend, PDFs contribute concept nodes", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ content: [{ text: '["payments", "ledger"]' }] }), {
            status: 200,
          }),
      ),
    );
    const dir = project({
      "src/a.ts": "export const a = 1;",
      "docs/spec.pdf": "%PDF-1.4 fake",
    });
    const graph = await buildGraphAsync(dir, { cache: false });
    const concepts = graph.nodes.filter((n) => n.kind === "concept").map((n) => n.label);
    expect(concepts.sort()).toEqual(["ledger", "payments"]);
    expect(graph.nodes.some((n) => n.id === "file:docs/spec.pdf")).toBe(true);
  });

  it("GATE: without keys the run never touches the network and equals the code-only graph", async () => {
    const fetchSpy = vi.fn(async () => {
      throw new Error("network use in offline mode");
    });
    vi.stubGlobal("fetch", fetchSpy);
    const files = { "src/a.ts": "export const a = 1;", "README.md": "# Doc\n" };
    const withExtras = await buildGraphAsync(
      project({ ...files, "docs/spec.pdf": "%PDF", "talk.mp3": "ID3 fake" }),
      { cache: false },
    );
    const codeOnly = await buildGraphAsync(project(files), { cache: false });
    expect(fetchSpy).not.toHaveBeenCalled();
    // Strip built_at_commit (tmpdirs differ) and compare the rest exactly.
    expect({ nodes: withExtras.nodes, links: withExtras.links }).toEqual({
      nodes: codeOnly.nodes,
      links: codeOnly.links,
    });
  });
});

describe("sql ingestor (offline)", () => {
  it("tables, columns, and REFERENCES edges from DDL", () => {
    const fragment = sqlIngestor.ingestSync?.(
      src(
        "db/schema.sql",
        [
          "CREATE TABLE users (",
          "  id serial PRIMARY KEY,",
          "  email text NOT NULL",
          ");",
          "CREATE TABLE orders (",
          "  id serial,",
          "  user_id integer REFERENCES users(id)",
          ");",
        ].join("\n"),
      ),
      { rootDir: "/x", knownFiles: new Set() },
    );
    const kinds = new Map(fragment?.nodes.map((n) => [n.label, n.kind]));
    expect(kinds.get("users")).toBe("table");
    expect(kinds.get("email")).toBe("column");
    expect(kinds.get("orders")).toBe("table");
    expect(
      fragment?.links.some(
        (l) => l.relation === "references" && String(l.source).includes("orders"),
      ),
    ).toBe(true);
  });
});

describe("cargo ingestor (offline)", () => {
  it("crate + dependency edges from Cargo.toml", () => {
    const fragment = cargoIngestor.ingestSync?.(
      src(
        "Cargo.toml",
        [
          "[package]",
          'name = "rocket-engine"',
          "",
          "[dependencies]",
          'serde = "1"',
          'tokio = { version = "1" }',
        ].join("\n"),
      ),
      { rootDir: "/x", knownFiles: new Set() },
    );
    const kinds = new Map(fragment?.nodes.map((n) => [n.label, n.kind]));
    expect(kinds.get("rocket-engine")).toBe("crate");
    expect(kinds.get("serde")).toBe("dependency");
    expect(kinds.get("tokio")).toBe("dependency");
    expect(fragment?.links.filter((l) => l.relation === "depends_on")).toHaveLength(2);
  });
});

describe("local-tool fragments (the testable halves)", () => {
  it("transcripts become segment nodes; scip JSON becomes symbol nodes; junk never throws", () => {
    const t = transcriptFragment(
      "talk.mp3",
      "Welcome to the architecture talk.\n\nshort\nThe cache survives corruption by content keys.",
    );
    expect(t.nodes.filter((n) => n.kind === "transcript")).toHaveLength(2); // 'short' filtered
    const s = scipFragment(
      "index.scip",
      JSON.stringify({
        documents: [
          {
            relative_path: "a.ts",
            symbols: [{ symbol: "scip-typescript npm pkg 1.0 a.ts/engine()." }],
          },
        ],
      }),
    );
    expect(s.nodes.some((n) => n.kind === "scip-symbol")).toBe(true);
    expect(scipFragment("index.scip", "{garbage").nodes).toHaveLength(1); // just the file node
  });
});

describe("backend response shapes (stubbed fetch)", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stub = (payload: unknown, status = 200) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(payload), { status })),
    );

  it("gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok", async () => {
    stub({ candidates: [{ content: { parts: [{ text: "g" }] } }] });
    expect(await detectBackend({ GEMINI_API_KEY: "k" })?.complete("p")).toBe("g");

    stub({ choices: [{ message: { content: "o" } }] });
    expect(await detectBackend({ OPENAI_API_KEY: "k" })?.complete("p")).toBe("o");

    stub({ response: "l" });
    expect(await detectBackend({ OLLAMA_HOST: "http://x" })?.complete("p")).toBe("l");

    stub({ error: "nope" }, 401);
    await expect(detectBackend({ ANTHROPIC_API_KEY: "k" })?.complete("p")).rejects.toThrow(/401/);

    stub({});
    await expect(detectBackend({ OPENAI_API_KEY: "k" })?.complete("p")).rejects.toThrow(/no text/);
  });
});

describe("gated ingestor surfaces", () => {
  it("detect + available are honest", async () => {
    const { whisperIngestor, scipIngestor } = await import("../src/ingest/tools/local.js");
    const ref = (relPath: string) => ({ path: `/x/${relPath}`, relPath, size: 1 });
    expect(whisperIngestor.detect(ref("talk.mp3"))).toBe(true);
    expect(whisperIngestor.detect(ref("talk.txt"))).toBe(false);
    expect(scipIngestor.detect(ref("index.scip"))).toBe(true);
    expect(typeof whisperIngestor.available({})).toBe("boolean");
    expect(whisperIngestor.available({ WHISPER_CPP: "/bin/whisper" })).toBe(true);
    const { llmDocsIngestor } = await import("../src/ingest/llm/docs.js");
    expect(llmDocsIngestor.available({})).toBe(false);
    expect(llmDocsIngestor.available({ ANTHROPIC_API_KEY: "k" })).toBe(true);
  });
});

describe("local tools end to end (fake binaries on PATH)", () => {
  it("whisper + scip spawn, parse, and survive failures", async () => {
    const { whisperIngestor, scipIngestor } = await import("../src/ingest/tools/local.js");
    const bin = mkdtempSync(join(tmpdir(), "revitify-bin-"));
    writeFileSync(
      join(bin, "whisper-cli"),
      "#!/bin/sh\necho 'Welcome to the deep dive on caching.'\necho 'Content keys rebuild a corrupt index.'\n",
      { mode: 0o755 },
    );
    writeFileSync(
      join(bin, "scip"),
      `#!/bin/sh\necho '{"documents":[{"relative_path":"a.ts","symbols":[{"symbol":"pkg a.ts/engine()."}]}]}'`,
      { mode: 0o755 },
    );
    const oldPath = process.env.PATH;
    process.env.PATH = `${bin}:${oldPath}`;
    try {
      const media = { path: "/x/talk.mp3", relPath: "talk.mp3", size: 1, content: "" };
      const ctx = { rootDir: "/x", knownFiles: new Set<string>() };
      const t = await whisperIngestor.ingest(media, ctx);
      expect(t.nodes.filter((n) => n.kind === "transcript")).toHaveLength(2);
      const s = await scipIngestor.ingest(
        { path: "/x/index.scip", relPath: "index.scip", size: 1, content: "" },
        ctx,
      );
      expect(s.nodes.some((n) => n.kind === "scip-symbol")).toBe(true);
      // Failing binary → empty fragment, never a throw.
      writeFileSync(join(bin, "whisper-cli"), "#!/bin/sh\nexit 3\n", { mode: 0o755 });
      expect((await whisperIngestor.ingest(media, ctx)).nodes).toHaveLength(0);
    } finally {
      process.env.PATH = oldPath;
    }
  });

  it("async wrappers + parse edge branches", async () => {
    const ctx = { rootDir: "/x", knownFiles: new Set<string>() };
    const sql = await sqlIngestor.ingest(src("s.sql", "CREATE TABLE t (id int);"), ctx);
    expect(sql.nodes.some((n) => n.kind === "table")).toBe(true);
    const cargo = await cargoIngestor.ingest(
      src("Cargo.toml", '[dependencies]\nserde = "1"\n'),
      ctx,
    );
    expect(cargo.nodes.some((n) => n.kind === "dependency")).toBe(true); // workspace root: no [package]
    expect(parseConcepts('["a",]')).toEqual([]); // JSON.parse throw path
    const { llmDocsIngestor } = await import("../src/ingest/llm/docs.js");
    expect(llmDocsIngestor.detect({ path: "/x/a.pdf", relPath: "a.pdf", size: 1 })).toBe(true);
    expect(llmDocsIngestor.detect({ path: "/x/a.ts", relPath: "a.ts", size: 1 })).toBe(false);
  });
});
