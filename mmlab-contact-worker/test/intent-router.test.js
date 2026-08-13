import test from "node:test";
import assert from "node:assert/strict";

import worker from "../src/worker-v2.js";
import { detectProjectIntent } from "../src/intent-router.js";

const ORIGIN = "https://allfiction.56-126-148-93.sslip.io";

function request(message) {
  return new Request("https://worker.example/ai-chat", {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      locale: "es-AR",
      history: [],
      sessionId: "intent-router-test",
      website: "",
    }),
  });
}

test("detects explicit project-build intent", () => {
  assert.equal(detectProjectIntent("necesito armar una pagina web").matched, true);
  assert.equal(detectProjectIntent("Quiero automatizar un proceso manual").matched, true);
  assert.equal(detectProjectIntent("I need a website for my business").matched, true);
});

test("keeps informational portfolio questions in AF Intelligence", () => {
  assert.equal(
    detectProjectIntent("Que proyecto demuestra mejor experiencia backend?").matched,
    false,
  );
  assert.equal(
    detectProjectIntent("Como trabaja ALLFICTION con inteligencia artificial?").matched,
    false,
  );
});

test("worker returns an agent handoff without spending a model call", async () => {
  const response = await worker.fetch(request("necesito armar una pagina web"), {
    ALLOWED_ORIGIN: ORIGIN,
    AI_ENABLED: "false",
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.mode, "handoff");
  assert.equal(payload.target, "agent");
  assert.equal(payload.reason, "project-intent");
  assert.equal(payload.handoff.preserveMessage, true);
});

test("worker still delegates informational questions to the original chat path", async () => {
  const response = await worker.fetch(
    request("Que proyecto demuestra mejor experiencia backend?"),
    {
      ALLOWED_ORIGIN: ORIGIN,
      AI_ENABLED: "false",
      AI_RATE_LIMIT: "5",
      AI_RATE_WINDOW_SECONDS: "900",
    },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.notEqual(payload.mode, "handoff");
});
