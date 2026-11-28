import assert from "node:assert/strict";
import { test } from "node:test";

import { DailyUsageCounter, consumeDailyBudget } from "../src/daily-budget.js";

function createDailyUsageState({ yieldLoop = false } = {}) {
  const store = new Map();
  let gate = Promise.resolve();

  async function yieldTurn() {
    if (yieldLoop) await new Promise((resolve) => setImmediate(resolve));
  }

  return {
    storage: {
      async get(key) {
        await yieldTurn();
        return store.has(key) ? store.get(key) : undefined;
      },
      async put(key, value) {
        await yieldTurn();
        store.set(key, value);
      },
    },
    async blockConcurrencyWhile(fn) {
      const previous = gate;
      let release;
      gate = new Promise((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        return await fn();
      } finally {
        release();
      }
    },
  };
}

function consumeRequest(key, limit) {
  return new Request("https://daily-usage/consume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, limit }),
  });
}

test("DailyUsageCounter allows only one increment when two yielding consumes race", async () => {
  const counter = new DailyUsageCounter(createDailyUsageState({ yieldLoop: true }));
  const [first, second] = await Promise.all([
    counter.fetch(consumeRequest("af-ai-usage:test", 1)),
    counter.fetch(consumeRequest("af-ai-usage:test", 1)),
  ]);
  const bodies = [await first.json(), await second.json()];
  const allowed = bodies.filter((body) => body.ok === true);
  const rejected = bodies.filter((body) => body.ok === false);

  assert.equal(allowed.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(allowed[0].used, 1);
  assert.equal(rejected[0].used, 1);
});

test("consumeDailyBudget prefers the Durable Object binding over a yielding KV store", async () => {
  const memoryStore = new Map();
  const objects = new Map();
  const env = {
    AI_USAGE_KV: {
      async get() {
        throw new Error("KV must not be used when AI_USAGE is bound");
      },
      async put() {
        throw new Error("KV must not be used when AI_USAGE is bound");
      },
    },
    AI_USAGE: {
      idFromName(name) {
        return { name: String(name) };
      },
      get(id) {
        const name = id.name;
        if (!objects.has(name)) {
          objects.set(name, new DailyUsageCounter(createDailyUsageState({ yieldLoop: true })));
        }
        return objects.get(name);
      },
    },
  };

  const [first, second] = await Promise.all([
    consumeDailyBudget(env, { key: "af-ai-usage:test", limit: 1, memoryStore }),
    consumeDailyBudget(env, { key: "af-ai-usage:test", limit: 1, memoryStore }),
  ]);

  assert.equal([first, second].filter(Boolean).length, 1);
  assert.equal([first, second].filter((value) => value === false).length, 1);
  assert.equal(memoryStore.size, 0);
});
