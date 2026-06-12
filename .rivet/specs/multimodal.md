# Feature: Multimodal ingestion — opt-in, key-gated (Phase 8)

> Upstream: llm.py (backend autodetect), transcribe.py (whisper), scip_ingest.py, SQL/cargo
> introspection @ graphify 0.8.38. NO LLM SDKs — native fetch; local tools gate on PATH.

## Requirement REQUIREMENT_MM-01 — the offline gate is absolute

WHEN no API key and no local tool is present THEN a build over code+PDF+audio SHALL produce a
graph identical to the code-only build, make ZERO network calls, and print one skip notice per
gated ingestor.

@check kind=unit ref=test/multimodal.test.ts::GATE: without keys the run never touches the network and equals the code-only graph

## Requirement REQUIREMENT_MM-02 — backend autodetection mirrors llm.py

WHEN keys are present THEN detection SHALL order Anthropic → Gemini → OpenAI → Ollama, each
backend speaking its provider's response shape over fetch, erroring loudly on non-OK.

@check kind=unit ref=test/multimodal.test.ts::anthropic → gemini → openai → ollama → none
@check kind=unit ref=test/multimodal.test.ts::gemini, openai, ollama parse their shapes; anthropic errors loudly on non-ok
@check kind=unit ref=test/multimodal.test.ts::with a key + mocked backend, PDFs contribute concept nodes

## Requirement REQUIREMENT_MM-03 — offline schema/deps ingestion

WHEN .sql DDL or Cargo.toml is walked THEN tables/columns/REFERENCES and crate/dependency
edges SHALL extract fully offline (both pipelines — these ingestors are sync-capable).

@check kind=unit ref=test/multimodal.test.ts::tables, columns, and REFERENCES edges from DDL
@check kind=unit ref=test/multimodal.test.ts::crate + dependency edges from Cargo.toml

## Requirement REQUIREMENT_MM-04 — local tools never become hard dependencies

WHEN whisper-cli/scip exist on PATH THEN AV/SCIP files SHALL ingest through them; IF the
binary is absent or fails THEN the ingestor SHALL report unavailable / return empty — never
throw, never install anything.

@check kind=unit ref=test/multimodal.test.ts::whisper + scip spawn, parse, and survive failures
@check kind=unit ref=test/multimodal.test.ts::detect + available are honest
