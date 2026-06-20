# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue or PR.

- Email **pratiyush1@gmail.com** with details and, if possible, a minimal reproduction.
- Or use GitHub's [private vulnerability reporting](https://github.com/Pratiyush/revitify/security/advisories/new).

You'll get an acknowledgement as soon as possible; please allow a reasonable window to fix before any
public disclosure.

## Design posture

revitify is **offline by default** — a code-only build needs no network and no API keys, and the heavy
optional pieces (tree-sitter grammars, the MCP SDK, LLM backends) load lazily. Reports of particular
interest:

- the **offline invariant** being breakable — a code-only run reaching the network;
- **multi-modal key-gating** leaking a key, or an LLM/transcription backend running without explicit
  opt-in;
- command/path injection via an environment variable (`OLLAMA_HOST`, `WHISPER_CPP`) or a crafted file
  during ingestion;
- the served HTTP API or MCP server exposing data beyond the local graph it was pointed at.

## Supported versions

revitify is pre-1.0; fixes land on `main`. Build from `main` for the latest security fixes until a
tagged release exists.
