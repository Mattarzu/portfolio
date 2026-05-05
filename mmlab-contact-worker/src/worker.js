const WINDOW_SECONDS = 60;
const buckets = new Map();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function corsHeaders(origin, env) {
  const allowedOrigins = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function validatePayload(raw) {
  const payload = {
    name: cleanText(raw.name),
    contact: cleanText(raw.contact),
    message: cleanText(raw.message),
    page: cleanText(raw.page),
    createdAt: cleanText(raw.createdAt),
    website: cleanText(raw.website)
  };

  if (!payload.name || !payload.contact || !payload.message) {
    return { ok: false, error: "missing-required-fields" };
  }

  if (payload.name.length > 80) return { ok: false, error: "name-too-long" };
  if (payload.contact.length > 160) return { ok: false, error: "contact-too-long" };
  if (payload.message.length > 2000) return { ok: false, error: "message-too-long" };
  if (payload.page.length > 300) return { ok: false, error: "page-too-long" };
  if (payload.createdAt.length > 80) return { ok: false, error: "createdAt-too-long" };
  if (payload.website.length > 200) return { ok: false, error: "website-too-long" };

  return { ok: true, payload };
}

function clientKey(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function enforceRateLimit(request, env) {
  const limit = Math.max(1, Math.min(Number(env.RATE_LIMIT_PER_MINUTE || 5), 60));
  const now = Date.now();
  const key = clientKey(request);
  const bucket = buckets.get(key) || [];

  const fresh = bucket.filter((timestamp) => now - timestamp < WINDOW_SECONDS * 1000);

  if (fresh.length >= limit) {
    buckets.set(key, fresh);
    return false;
  }

  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

function buildTelegramMessage(payload) {
  return [
    "<b>Nuevo contacto — M M LAB</b>",
    "",
    `<b>Nombre:</b> ${escapeHtml(payload.name)}`,
    `<b>Contacto:</b> ${escapeHtml(payload.contact)}`,
    `<b>Página:</b> ${escapeHtml(payload.page || "unknown")}`,
    `<b>Fecha cliente:</b> ${escapeHtml(payload.createdAt || "unknown")}`,
    "",
    "<b>Mensaje:</b>",
    escapeHtml(payload.message)
  ].join("\n");
}

async function sendTelegram(payload, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(payload),
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json().catch(() => null);
  return data && data.ok === true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true }, 200, cors);
    }

    if (url.pathname !== "/contact" || request.method !== "POST") {
      return json({ detail: "not-found" }, 404, cors);
    }

    if (!cors["Access-Control-Allow-Origin"]) {
      return json({ detail: "origin-not-allowed" }, 403);
    }

    if (!enforceRateLimit(request, env)) {
      return json({ detail: "rate-limit-exceeded" }, 429, cors);
    }

    let raw;
    try {
      raw = await request.json();
    } catch {
      return json({ detail: "invalid-json" }, 400, cors);
    }

    const result = validatePayload(raw);
    if (!result.ok) {
      return json({ detail: result.error }, 422, cors);
    }

    // Honeypot: responder OK sin enviar nada.
    if (result.payload.website) {
      return json({ ok: true }, 200, cors);
    }

    const sent = await sendTelegram(result.payload, env);
    if (!sent) {
      return json({ detail: "contact-delivery-failed" }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};
