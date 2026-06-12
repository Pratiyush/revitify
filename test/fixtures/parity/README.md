# Parity baseline fixture

`llm-dev-kit.graphify.graph.json` is the reference output for `scripts/compare-parity.mjs` —
Python graphify run OFFLINE (no API keys in env) on a copy of llm-dev-kit.

Provenance:

- corpus: `~/Github/llm-dev-kit` @ commit `8ad54b18` (copied minus `node_modules`,
  `graphify-out`, `revitify-out`, `dist`, `_ref`, `.claude`)
- generator: `graphify update .` — graphify **0.8.37** from PyPI (`uv tool install graphifyy`).
  Note: `.track` pins upstream 0.8.38 (PR #1271); PyPI lagged at baseline time. Re-generate this
  fixture when re-syncing `.track`.
- result: 893 nodes, 1788 links, 65 communities, 178 files extracted

Regenerate:

```sh
uv tool install graphifyy
rsync -a --exclude node_modules --exclude graphify-out --exclude revitify-out \
  --exclude .claude --exclude _ref --exclude dist ~/Github/llm-dev-kit/ /tmp/parity-corpus/
cd /tmp/parity-corpus && env -i HOME="$HOME" PATH="$HOME/.local/bin:/usr/bin:/bin" graphify update .
cp graphify-out/graph.json <revitify>/test/fixtures/parity/llm-dev-kit.graphify.graph.json
```
