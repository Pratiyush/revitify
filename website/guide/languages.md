# Languages — Java & beyond

Revitify extracts a real syntax tree for every supported language, then maps each language's
constructs onto the shared [node model](./concepts). This page shows what you get per language, with
Java as the worked example, and explains the one thing you need to know: **sync vs. async**.

## Two extraction engines

| Engine | Languages | API | Loads |
|---|---|---|---|
| **TypeScript compiler** | TypeScript, JavaScript (`.ts .tsx .mts .cts .js .mjs .cjs .jsx`) | `buildGraph` (sync) **and** `buildGraphAsync` | always (it's the one core dep) |
| **tree-sitter (WASM)** | Python, Java, Go, Rust, Ruby, C, C++, C#, Bash, PHP, Scala, Kotlin | `buildGraphAsync` only | lazily, per language, on first match |

TypeScript goes through the real compiler API — no regex guessing. Every other language goes through
its official tree-sitter grammar, loaded as a WASM module only when a matching file is seen.

::: tip The sync/async rule
`revitify()` / `buildGraph()` are **synchronous** and stay lean — they extract TypeScript/JavaScript
at full depth and fall back to a shallow regex pass (top-level symbols only) for Python/Java. The
**async** `revitifyAsync()` / `buildGraphAsync()` run the full tree-sitter engine for *all* twelve
languages. The CLI (`revitify build`) always uses the async engine, so you get full depth there.
:::

## Java, in depth

Java is extracted deeply — more deeply than the reference tool. Given:

```java
package com.shop;
import java.util.Map;

public class Inventory {
    private Map<String, Integer> stock;   // → field
    private int capacity;                  // → field

    public Inventory(int capacity) {       // → constructor
        this.capacity = capacity;
    }

    public int available(String sku) {     // → method
        return stock.getOrDefault(sku, 0); // → calls getOrDefault
    }

    interface Auditor { void audit(); }    // → nested interface + method
    enum Status { OPEN, CLOSED }           // → enum + enum constants
    record Snapshot(String sku, int n) {}  // → record
}
```

revitify produces:

```
file:Inventory.java
  ├─contains→ sym:Inventory.java#Inventory                  (class)
  │   ├─contains→ …#Inventory.stock                         (field)
  │   ├─contains→ …#Inventory.capacity                      (field)
  │   ├─method──→ …#Inventory.Inventory                     (constructor)
  │   ├─method──→ …#Inventory.available                     (method)
  │   │   └─calls→ (resolves getOrDefault if defined in-project)
  │   ├─contains→ …#Inventory.Auditor                       (interface)
  │   │   └─method→ …#Inventory.Auditor.audit               (method)
  │   ├─contains→ …#Inventory.Status                        (enum)
  │   │   ├─contains→ …#Inventory.Status.OPEN               (const)
  │   │   └─contains→ …#Inventory.Status.CLOSED             (const)
  │   └─contains→ …#Inventory.Snapshot                      (record)
```

So a single Java file yields **classes, interfaces, enums + their constants, records, constructors,
methods, fields, and nested types** — each a node, correctly nested, with call and import edges
between them.

## What each language extracts

| Language | Symbols extracted | Calls | Imports | Comments |
|---|---|---|---|---|
| **TypeScript / JS** | functions, classes + methods, interfaces, enums, type aliases, exported consts | ✅ | ✅ file + `imports_from` + `re_exports` | NOTE/WHY/HACK |
| **Java** | classes, interfaces, enums + constants, records, annotations, constructors, methods, fields | ✅ | ✅ references | line + block |
| **Python** | classes, functions, methods (nested) | ✅ | ✅ file-resolved | comments + **docstrings** |
| **Go** | functions, methods, named types (struct/interface) | ✅ | — | comments |
| **Rust** | fns, structs, enums, traits, impl methods, modules, consts, type aliases | ✅ | use-decls | line + block |
| **C** | functions, structs, enums, unions | ✅ | — | comments |
| **C++** | classes, structs, namespaces, functions, enums | ✅ | — | comments |
| **C#** | classes, interfaces, structs, records, enums + members, methods, constructors, properties, fields | ✅ | — | comments |
| **Ruby** | classes, modules, methods (incl. singleton) | ✅ | — | comments |
| **PHP** | classes, interfaces, traits, functions, methods | ✅ | — | comments |
| **Scala** | classes, objects, traits, functions | ✅ | — | comments |
| **Kotlin** | classes, objects, functions, constructors | ✅ | — | comments |
| **SQL** | tables, columns, `REFERENCES` edges | — | — | — |
| **Cargo.toml** | crate, dependencies (`depends_on`) | — | — | — |
| **JSON** | top-level keys | — | — | — |

C-family function names are extracted from the declarator (`int main(void)` → `main`), and
operator/destructor declarators are skipped rather than mangled.

## Mixed-language repos

Revitify graphs a polyglot repo in one pass — a Java service, a Python worker, a Rust core, and a TS
frontend all land in the same graph, with `community` detection finding the clusters that span them.
Cross-language references (e.g. a TS call to a name only defined in Python) resolve in the global
tier and are flagged in the report as **cross-language surprising connections**.

## Graceful degradation

Tree-sitter grammars are **optional dependencies**. If a grammar fails to install or load, revitify
doesn't crash — it falls back to the regex extractor (for Python/Java) or emits a bare file node,
with one notice. The code graph for the languages that *did* load is unaffected. Run
`revitify diagnose` to see exactly which grammars are loadable in your environment.

```sh
revitify diagnose
#   ✔ grammar python
#   ✔ grammar java
#   ✔ grammar go
#   …
#   all systems go.
```

## Adding a language

A new language is one data object — a `LanguageConfig` listing the grammar's node types for
definitions, calls, imports, and comments — plus an entry in the extractor registry. No switch
statements, no engine changes. See [Contributing](/contributing#add-a-language) for the recipe.
