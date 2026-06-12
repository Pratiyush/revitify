# Handoff: Revitify `graph.html` Visualization

## Overview

A complete redesign of Revitify's generated code-knowledge-graph visualization. The output is a **single self-contained HTML template** (inline CSS + JS, two CDN scripts) that the Revitify generator populates with graph data. It replaces the old static legend page with: an interactive legend-as-filter sidebar, fuzzy search, four views (Graph / Focus / List / Hubs), a node detail panel, Obsidian-style live "movement" physics with hover-neighborhood highlighting, a Display & Physics settings panel, dark/light themes, URL-hash state sharing, and PNG/JSON export.

## About the design files — read this first

Unlike a typical design handoff, **`graph_template.html` is production-ready as-is**. It is not a mock to recreate in a framework — it is the artifact the generator should ship. The integration task is:

1. Drop `graph_template.html` into the Revitify repo as the generator's template (replacing the old one).
2. Make the generator replace exactly one line (see *Data injection contract*).
3. Verify against a real generated graph.

No build step, no framework, no npm dependencies. Two CDN `<script>` tags (Cytoscape.js 3.x and cytoscape-fcose) are the only external resources; if offline viewing is required, inline those two libraries into the template.

## Files

| File | Purpose |
|---|---|
| `graph_template.html` | **The deliverable.** Clean template with the `null` data placeholder. Wire this into the generator. |
| `graph_sample_populated.html` | The same template with `sample_graph.json` baked in — open in a browser to see everything working. |
| `sample_graph.json` | Real sample output from Revitify (27 nodes / 36 links) used during development. |

## Data injection contract

The template contains exactly one line to replace (search for `DATA INJECTION POINT` comment):

```html
<script>window.__GRAPHIFY_DATA__ = window.__GRAPHIFY_DATA__ || null;</script>
```

The generator replaces `null` with the JSON graph object (or prepends its own `<script>window.__GRAPHIFY_DATA__ = {...}</script>` before this line — both work). If left `null`, the file synthesizes a demo graph so the template previews standalone.

### Accepted schemas (both normalized at load)

**Native Revitify shape:**
```json
{
  "nodes": [{ "id": "file:src/x.ts", "label": "x.ts", "name": "x.ts",
              "kind": "file", "source_file": "src/x.ts",
              "source_location": "src/x.ts:12", "community": 0, "summary": "..." }],
  "links": [{ "source": "a", "target": "b", "relation": "imports" }],
  "built_at_commit": "abc1234"
}
```

**Legacy shape:**
```json
{
  "nodes": [{ "id", "label", "type", "path", "community", "summary" }],
  "edges": [{ "source", "target", "type", "provenance": "EXTRACTED|INFERRED|AMBIGUOUS" }],
  "meta": { "repo": "name" }
}
```

Graceful degradation: every field except `id` is optional. Missing `community` hides the community filter/color mode; missing `summary` hides the docstring block; missing provenance switches the edge legend to edge *types*.

## Node kinds & colors (design tokens)

Fixed colors, tested on both themes. Kinds not in this table get auto-assigned from a 5-color extra palette.

| Kind | Color | Kind | Color |
|---|---|---|---|
| directory | `#7c8aa0` | type | `#c9a83a` |
| package | `#a9805b` | function | `#23c08a` |
| module | `#5b8def` | method | `#94c93d` |
| file | `#3b9eff` | field | `#c77d3f` |
| class | `#a279f5` | variable | `#fb8b4c` |
| record / struct | `#2f9bb8` | constant | `#d05f5f` |
| interface | `#22c3d6` | test | `#6aa84f` |
| annotation | `#7d5bbe` | doc | `#f0a93b` |
| enum | `#e065d0` | concept | `#ef74a8` |

**Kind aliases** (normalized before lookup): `func/fn/subroutine→function`, `ctor/constructor→method`, `var/let→variable`, `const→constant`, `namespace→module`, `pkg→package`, `property/prop→field`, `md/markdown/document→doc`, `impl→class`, `trait/protocol→interface`, `typealias/typedef/alias→type`.

## Edge encoding

- **With provenance:** EXTRACTED = solid `#64748b` @ 0.62 opacity · INFERRED = dashed `#2f9bb8` @ 0.50 · AMBIGUOUS = dotted `#b06fd0` @ 0.28.
- **Without provenance (relation mode):** contains = solid, imports = dashed, references = dotted, calls = solid teal; further relations cycle through 4 line styles. Legend header switches to "Edge types" automatically.
- Node **size scales with degree**; top-N hubs get an accent ring/halo and are always labeled.

## Views & interactions

1. **Graph** (default): fcose layout run once then frozen; pan/zoom/drag; labels fade in past a zoom threshold (adjustable in settings); hover lights the closed neighborhood and dims the rest (Obsidian-style).
2. **Focus**: ego network of a node, depth slider 1–3. Entered by double-click, the Focus tab (falls back to top hub if nothing selected), `F` key, or detail-panel button.
3. **List**: sortable/filterable table; row click opens detail panel + "Show in graph."
4. **Hubs**: ranked god nodes + cross-cluster "surprising connections."

**Movement mode** (topbar orbit icon, `M`): custom spring/repulsion/center-gravity simulation with spatial-hash repulsion (O(n) per tick). Auto-on ≤400 nodes, off above. **Critical implementation detail:** hover *and* tap targeting are fully pointer-driven — a custom hit-test against live node positions runs on mousemove, every 4th physics frame, and on pan/zoom. Do **not** revert to Cytoscape's native `mouseover`/`tap` node events alone; they hit-test stale positions after nodes move and caused the bugs this fixed.

**Settings panel** ("Display & physics" card): node size ×, link width ×, label fade threshold, direction-arrows toggle, repel ×, link distance ×, center pull ×. Persisted to `localStorage["revitify-graph-settings"]`.

**Keyboard:** `/` search · `Esc` clear/close · `F` focus · `L` sidebar · `T` theme · `M` movement.

**URL hash state:** `view`, `node` (selected), `q`, `deg`, `path`, `comm`, `depth`, `color`, `move` — shareable/bookmarkable.

**Chrome tooltips:** any element with `data-tip="…"` gets a styled tooltip (260 ms delay, flips above/below by viewport position).

## Performance notes (2,000+ nodes)

- Canvas rendering (Cytoscape), not SVG.
- Layout runs once (`fcose`, quality `default`), then physics frozen unless movement mode is on.
- Label visibility recomputed at most every 80 ms, capped count at low zoom; hubs always labeled.
- Filter re-renders debounced; minimap redraw throttled to 120 ms.
- Movement sim uses a 170 px spatial hash grid for repulsion; warns via toast above 1,500 nodes.

## Theming

Dark theme is default. All chrome colors are CSS custom properties on `:root[data-theme="dark"|"light"]` — adjust there only. The accent is a single blue (`--accent`); node/edge colors are JS constants (`TYPE_BASE`, `PROV_BASE`, `RELATION_BASE`) near the top of the script.

## Verification checklist (run after generator integration)

- [ ] Legend items toggle node kinds / edge styles; counts match data
- [ ] Search (`/`) jumps + highlights; `Esc` clears
- [ ] All four views render; Focus depth slider works
- [ ] Provenance/relation line styles distinguishable in both themes
- [ ] Movement toggle (`M`) on/off; hover + click track moving nodes correctly
- [ ] URL hash round-trips (reload restores view/selection/filters)
- [ ] PNG and filtered-JSON export download
- [ ] Largest real graph stays interactive (target: 2k nodes)

---

## Revitify divergence log (template is no longer byte-identical to the handoff)

**v1.1 — mobile adaptation (2026-06-12).** The handoff shipped desktop-only (no media
queries; the sidebar's only toggle was the `L` key). Marked `MOBILE ADAPTATION` blocks add:
a topbar hamburger (`#sbToggle`) + tap-to-close backdrop; the sidebar becomes an off-canvas
drawer under 760px (closed by default on phones, reusing the existing `nosb` mechanic);
the detail panel goes full-width; the minimap hides; the topbar scrolls horizontally;
inputs pin to 16px (iOS zoom-on-focus); hover tooltips are suppressed on coarse pointers;
picking a view on a phone closes the drawer. Everything else — and all four CDN tags the
generator replaces — is untouched.
