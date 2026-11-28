export class DailyUsageCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, error: "invalid-json" }, { status: 400 });
    }

    const key = typeof payload?.key === "string" && payload.key ? payload.key : "";
    const limit = Number(payload?.limit);
    if (!key || !Number.isFinite(limit) || limit < 1) {
      return Response.json({ ok: false, error: "invalid-consume" }, { status: 400 });
    }

    let allowed = false;
    let used = 0;
    await this.state.blockConcurrencyWhile(async () => {
      used = Number(await this.state.storage.get(key)) || 0;
      if (used >= limit) return;
      used += 1;
      await this.state.storage.put(key, used);
      allowed = true;
    });

    return Response.json({ ok: allowed, used, limit });
  }
}

export async function consumeDailyBudget(env, { key, limit, memoryStore }) {
  if (env.AI_USAGE?.idFromName && env.AI_USAGE?.get) {
    const stub = env.AI_USAGE.get(env.AI_USAGE.idFromName(key));
    const response = await stub.fetch(
      new Request("https://daily-usage/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, limit }),
      }),
    );
    if (!response.ok) return false;
    const body = await response.json();
    return body.ok === true;
  }

  if (env.AI_USAGE_KV?.get && env.AI_USAGE_KV?.put) {
    const used = Number.parseInt((await env.AI_USAGE_KV.get(key)) || "0", 10) || 0;
    if (used >= limit) return false;
    await env.AI_USAGE_KV.put(key, String(used + 1), { expirationTtl: 172800 });
    return true;
  }

  const used = memoryStore.get(key) || 0;
  if (used >= limit) return false;
  memoryStore.set(key, used + 1);
  return true;
}
