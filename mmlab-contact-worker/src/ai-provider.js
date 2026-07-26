const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export const DEFAULT_AI_PROVIDER = "gemini";
export const DEFAULT_AI_MODELS = Object.freeze({
  gemini: "gemini-3.5-flash-lite",
  openai: "gpt-5.4-nano-2026-03-17",
});

const SUPPORTED_PROVIDERS = new Set(Object.keys(DEFAULT_AI_MODELS));

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProvider(value) {
  return cleanText(value).toLowerCase() || DEFAULT_AI_PROVIDER;
}

function modelForProvider(provider, env) {
  const providerModel =
    provider === "gemini" ? env.GEMINI_MODEL : env.OPENAI_MODEL;
  return (
    cleanText(env.AI_MODEL) ||
    cleanText(providerModel) ||
    DEFAULT_AI_MODELS[provider] ||
    ""
  );
}

function keyForProvider(provider, env) {
  if (provider === "gemini") return cleanText(env.GEMINI_API_KEY);
  if (provider === "openai") return cleanText(env.OPENAI_API_KEY);
  return "";
}

export function resolveProvider(env = {}) {
  const provider = normalizeProvider(env.AI_PROVIDER);
  const supported = SUPPORTED_PROVIDERS.has(provider);
  const model = supported ? modelForProvider(provider, env) : "";
  const apiKey = supported ? keyForProvider(provider, env) : "";

  return {
    provider,
    model,
    apiKey,
    supported,
    configured: supported && Boolean(apiKey),
  };
}

export function publicProviderState(env = {}) {
  const { provider, model, supported, configured } = resolveProvider(env);
  return { provider, model, supported, configured };
}

function geminiRequest({ instructions, input, maxOutputTokens }) {
  return {
    systemInstruction: {
      parts: [{ text: instructions }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: input }],
      },
    ],
    generationConfig: {
      candidateCount: 1,
      maxOutputTokens,
      responseMimeType: "text/plain",
    },
    store: false,
  };
}

function openAiRequest({
  model,
  instructions,
  input,
  maxOutputTokens,
  safetyIdentifier,
}) {
  return {
    model,
    instructions,
    input,
    reasoning: { effort: "none" },
    max_output_tokens: maxOutputTokens,
    safety_identifier: safetyIdentifier,
    store: false,
  };
}

export function extractGeminiText(data) {
  const chunks = [];

  for (const candidate of data?.candidates || []) {
    for (const part of candidate?.content?.parts || []) {
      if (
        typeof part?.text === "string" &&
        part.text.trim() &&
        part.thought !== true
      ) {
        chunks.push(part.text);
      }
    }
  }

  return cleanText(chunks.join("\n")).slice(0, 1200);
}

export function extractOpenAiText(data) {
  const chunks = [];

  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return cleanText(chunks.join("\n")).slice(0, 1200);
}

export function extractProviderText(provider, data) {
  if (provider === "gemini") return extractGeminiText(data);
  if (provider === "openai") return extractOpenAiText(data);
  return "";
}

export async function generateWithProvider({
  env,
  instructions,
  input,
  maxOutputTokens,
  safetyIdentifier,
  signal,
}) {
  const config = resolveProvider(env);

  if (!config.supported) {
    return { ok: false, reason: "unsupported-ai-provider" };
  }

  if (!config.configured) {
    return { ok: false, reason: "ai-not-configured" };
  }

  let url;
  let headers;
  let body;

  if (config.provider === "gemini") {
    url = `${GEMINI_API_BASE}/${encodeURIComponent(config.model)}:generateContent`;
    headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": config.apiKey,
    };
    body = geminiRequest({ instructions, input, maxOutputTokens });
  } else {
    url = OPENAI_RESPONSES_URL;
    headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    body = openAiRequest({
      model: config.model,
      instructions,
      input,
      maxOutputTokens,
      safetyIdentifier,
    });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      signal,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { ok: false, reason: `provider-http-${response.status}` };
    }

    const data = await response.json().catch(() => null);
    const reply = extractProviderText(config.provider, data);
    if (!reply) return { ok: false, reason: "empty-ai-response" };

    return {
      ok: true,
      provider: config.provider,
      model: config.model,
      reply,
      requestId: response.headers.get("x-request-id") || undefined,
    };
  } catch {
    return { ok: false, reason: "ai-request-failed" };
  }
}
