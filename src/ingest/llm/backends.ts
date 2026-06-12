/**
 * Pluggable LLM backends (port of graphify llm.py) — native fetch, NO SDKs. Autodetection
 * order mirrors upstream: Anthropic → Gemini → OpenAI → local Ollama. Model ids override via
 * REVITIFY_LLM_MODEL. Everything here is opt-in: no key, no backend, no network — ever.
 */

export interface LlmBackend {
  readonly id: string;
  complete(prompt: string): Promise<string>;
}

export function detectBackend(env: NodeJS.ProcessEnv): LlmBackend | undefined {
  if (env.ANTHROPIC_API_KEY) return anthropic(env);
  if (env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY) return gemini(env);
  if (env.OPENAI_API_KEY) return openai(env);
  if (env.OLLAMA_HOST ?? env.REVITIFY_OLLAMA) return ollama(env);
  return undefined;
}

const text = async (res: Response, pick: (json: never) => string | undefined): Promise<string> => {
  if (!res.ok) throw new Error(`llm backend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const value = pick((await res.json()) as never);
  if (value === undefined) throw new Error("llm backend returned no text");
  return value;
};

function anthropic(env: NodeJS.ProcessEnv): LlmBackend {
  return {
    id: "anthropic",
    complete: (prompt) =>
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY as string,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: env.REVITIFY_LLM_MODEL ?? "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      }).then((r) => text(r, (j: { content?: Array<{ text?: string }> }) => j.content?.[0]?.text)),
  };
}

function gemini(env: NodeJS.ProcessEnv): LlmBackend {
  const key = env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY;
  const model = env.REVITIFY_LLM_MODEL ?? "gemini-2.0-flash";
  return {
    id: "gemini",
    complete: (prompt) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      ).then((r) =>
        text(
          r,
          (j: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }) =>
            j.candidates?.[0]?.content?.parts?.[0]?.text,
        ),
      ),
  };
}

function openai(env: NodeJS.ProcessEnv): LlmBackend {
  return {
    id: "openai",
    complete: (prompt) =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: env.REVITIFY_LLM_MODEL ?? "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      }).then((r) =>
        text(
          r,
          (j: { choices?: Array<{ message?: { content?: string } }> }) =>
            j.choices?.[0]?.message?.content,
        ),
      ),
  };
}

function ollama(env: NodeJS.ProcessEnv): LlmBackend {
  const host = env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
  return {
    id: "ollama",
    complete: (prompt) =>
      fetch(`${host}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: env.REVITIFY_LLM_MODEL ?? "llama3.2",
          prompt,
          stream: false,
        }),
      }).then((r) => text(r, (j: { response?: string }) => j.response)),
  };
}
