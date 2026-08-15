const endpoint = process.env.AF_AUTOMATION_ENDPOINT
  || "https://mmlab-contact-api.mattm2.workers.dev/automation-analyze";
const origin = process.env.AF_AUTOMATION_ORIGIN
  || "https://allfiction.56-126-148-93.sslip.io";

const requested = Number.parseInt(process.env.AF_BENCH_SAMPLES || "4", 10);
const sampleCount = Math.max(1, Math.min(Number.isFinite(requested) ? requested : 4, 4));

const processes = [
  "Recibo consultas, clasifico cada pedido, copio los datos a una planilla y aviso manualmente al equipo para hacer seguimiento.",
  "Cada mañana reviso pedidos nuevos, comparo estados en una planilla y notifico manualmente las excepciones al responsable.",
  "Recibo documentos, valido campos básicos, registro los datos en un sistema interno y derivo manualmente cada caso al área correspondiente.",
  "Reviso solicitudes entrantes, separo las urgentes, actualizo un registro compartido y preparo avisos individuales para el equipo.",
];

const rows = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
  return sorted[Math.min(rank - 1, sorted.length - 1)];
}

for (let i = 0; i < sampleCount; i += 1) {
  const started = performance.now();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      process: processes[i],
      locale: "es-AR",
      sessionId: `v15b4-benchmark-${i + 1}`,
      website: "",
    }),
  });
  const payload = await response.json().catch(() => null);
  const httpElapsedMs = Math.round(performance.now() - started);
  const runtime = payload?.runtime || {};
  const usage = runtime.telemetry?.usage || {};

  rows.push({
    sample: i + 1,
    httpStatus: response.status,
    mode: payload?.mode || "invalid",
    reason: payload?.reason || null,
    provider: runtime.provider || payload?.provider || null,
    model: runtime.model || payload?.model || null,
    providerElapsedMs: Number(runtime.elapsedMs || 0),
    httpElapsedMs,
    attempts: Number(runtime.attempts || 0),
    finishReason: runtime.telemetry?.finishReason || null,
    inputTokens: Number(usage.inputTokens || 0),
    outputTokens: Number(usage.outputTokens || 0),
    thoughtsTokens: Number(usage.thoughtsTokens || 0),
    totalTokens: Number(usage.totalTokens || 0),
  });

  console.log(JSON.stringify(rows.at(-1)));
  if (i < sampleCount - 1) await sleep(750);
}

const aiRows = rows.filter((row) => row.mode === "ai");
const latencies = rows.map((row) => row.httpElapsedMs);
const providerLatencies = rows.map((row) => row.providerElapsedMs).filter((value) => value > 0);
const totalTokens = aiRows.map((row) => row.totalTokens).filter((value) => value > 0);

const summary = {
  benchmark: "AF Automation V15B.4",
  samples: rows.length,
  note: "Small production sample; p95 is indicative only.",
  aiSuccess: aiRows.length,
  fallback: rows.filter((row) => row.mode === "guided").length,
  retryCount: rows.filter((row) => row.attempts > 1).length,
  latencyMs: {
    p50Http: percentile(latencies, 50),
    p95HttpApprox: percentile(latencies, 95),
    maxHttp: latencies.length ? Math.max(...latencies) : null,
    p50Provider: percentile(providerLatencies, 50),
  },
  usage: {
    averageTotalTokens: totalTokens.length
      ? Math.round(totalTokens.reduce((sum, value) => sum + value, 0) / totalTokens.length)
      : null,
    minTotalTokens: totalTokens.length ? Math.min(...totalTokens) : null,
    maxTotalTokens: totalTokens.length ? Math.max(...totalTokens) : null,
  },
  results: rows,
};

console.log("\n========== AF AUTOMATION BENCHMARK ==========");
console.log(JSON.stringify(summary, null, 2));
