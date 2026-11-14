import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

const source = readFileSync(new URL("../assets/js/contact-form.js", import.meta.url), "utf8");

function createField({ name, value = "", required = false, type = "text" } = {}) {
  let currentValue = value;
  const listeners = new Map();
  return {
    name,
    type,
    value: currentValue,
    required,
    attributes: new Map(),
    listeners,
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    checkValidity() {
      if (!this.required) return true;
      return String(currentValue).trim().length > 0;
    },
    dispatchEvent(event) {
      const list = this.listeners.get(event.type) || [];
      list.forEach((callback) => callback(event));
    },
    addEventListener(type, callback) {
      const list = this.listeners.get(type) || [];
      list.push(callback);
      this.listeners.set(type, list);
    },
    set valueSetter(next) {
      currentValue = next;
    },
    get valueGetter() {
      return currentValue;
    },
  };
}

// Property descriptor so FormData can read values.
function wireValue(field) {
  Object.defineProperty(field, "value", {
    get() {
      return field.valueGetter;
    },
    set(next) {
      field.valueSetter = next;
    },
  });
}

function buildDom({ endpoint, fetchImpl, lang = "es-AR" } = {}) {
  const fetchCalls = [];
  const events = [];
  const name = createField({ name: "name", required: true });
  const contact = createField({ name: "contact", required: true });
  const message = createField({ name: "message", required: true, type: "textarea" });
  const website = createField({ name: "website" });
  [name, contact, message, website].forEach(wireValue);

  const status = {
    textContent: "",
    classList: {
      values: new Set(),
      toggle(token, enabled) {
        if (enabled) this.values.add(token);
        else this.values.delete(token);
      },
    },
  };
  const submit = { disabled: false };
  const formListeners = new Map();
  const form = {
    attributes: new Map(),
    dataset: {},
    fields: [name, contact, message, website],
    querySelectorAll(selector) {
      if (selector === "[required]") return this.fields.filter((field) => field.required);
      if (selector === "[aria-invalid]") {
        return this.fields.filter((field) => field.getAttribute("aria-invalid") === "true");
      }
      return [];
    },
    reportValidity() {
      return this.fields.filter((field) => field.required).every((field) => field.checkValidity());
    },
    reset() {
      this.fields.forEach((field) => {
        field.value = "";
        field.removeAttribute("aria-invalid");
      });
    },
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    addEventListener(type, callback) {
      const list = formListeners.get(type) || [];
      list.push(callback);
      formListeners.set(type, list);
    },
    dispatchEvent(event) {
      const normalized = {
        ...event,
        preventDefault() {},
        target: form,
      };
      const list = formListeners.get(event.type) || [];
      return Promise.all(list.map((callback) => callback(normalized)));
    },
  };

  const documentElement = {
    lang,
    classList: { toggle() {} },
  };

  const window = {
    location: { href: "https://example.test/?lang=es" },
    MMLAB_CONTACT_ENDPOINT: endpoint,
    clearTimeout() {},
    setTimeout(handler) {
      handler();
      return 0;
    },
    fetch(url, options) {
      fetchCalls.push({ url, options });
      return fetchImpl(url, options);
    },
  };

  const document = {
    documentElement,
    querySelector(selector) {
      if (selector === "[data-contact-form]") return form;
      if (selector === "[data-contact-submit]") return submit;
      if (selector === "[data-contact-status]") return status;
      return null;
    },
    dispatchEvent(event) {
      events.push(event);
    },
  };

  const fetch = window.fetch.bind(window);

  runInNewContext(source, {
    window,
    document,
    fetch,
    AbortController: class {
      constructor() {
        this.signal = { aborted: false };
      }
      abort() {
        this.signal.aborted = true;
      }
    },
    FormData: class {
      constructor(target) {
        this.entries = target.fields.map((field) => [field.name, field.value]);
      }
      get(key) {
        return this.entries.find((entry) => entry[0] === key)?.[1] ?? "";
      }
    },
    CustomEvent: class {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail?.detail;
      }
    },
    HTMLInputElement: function HTMLInputElement() {},
    HTMLTextAreaElement: function HTMLTextAreaElement() {},
  });

  return { form, status, submit, fetchCalls, events, setFieldValue(field, value) {
    field.value = value;
  } };
}

test("invalid required fields block submit and surface localized error", async () => {
  const dom = buildDom({
    endpoint: "https://mock.test/contact",
    fetchImpl: async () => {
      throw new Error("fetch must not run");
    },
  });
  await dom.form.dispatchEvent({ type: "submit", preventDefault() {} });
  assert.match(dom.status.textContent, /obligatorios|required/i);
  assert.ok(dom.status.classList.values.has("is-error"));
  assert.equal(dom.fetchCalls.length, 0);
});

test("valid payload posts JSON to the configured endpoint only", async () => {
  const dom = buildDom({
    endpoint: "https://mock.test/contact",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://mock.test/contact");
      const body = JSON.parse(options.body);
      assert.equal(body.name, "Ada");
      assert.equal(body.contact, "ada@example.com");
      assert.equal(body.message, "Hola");
      return {
        ok: true,
        async json() {
          return { ok: true };
        },
      };
    },
  });
  dom.setFieldValue(dom.form.fields[0], "Ada");
  dom.setFieldValue(dom.form.fields[1], "ada@example.com");
  dom.setFieldValue(dom.form.fields[2], "Hola");
  await dom.form.dispatchEvent({ type: "submit", preventDefault() {} });
  assert.match(dom.status.textContent, /enviado|sent/i);
  assert.ok(dom.status.classList.values.has("is-success"));
  assert.equal(dom.fetchCalls.length, 1);
  assert.ok(dom.events.some((event) => event.type === "allfiction:contact-sent"));
});

test("missing endpoint keeps the flow offline", async () => {
  const dom = buildDom({
    endpoint: "",
    fetchImpl: async () => {
      throw new Error("fetch must not run");
    },
    lang: "en-GB",
  });
  dom.setFieldValue(dom.form.fields[0], "Ada");
  dom.setFieldValue(dom.form.fields[1], "ada@example.com");
  dom.setFieldValue(dom.form.fields[2], "Hi");
  await dom.form.dispatchEvent({ type: "submit", preventDefault() {} });
  assert.match(dom.status.textContent, /unavailable|email or linkedin/i);
  assert.equal(dom.fetchCalls.length, 0);
});

test("provider errors stay on the mock boundary", async () => {
  const dom = buildDom({
    endpoint: "https://mock.test/contact",
    fetchImpl: async () => ({
      ok: false,
      async json() {
        return { ok: false, detail: "rate-limited" };
      },
    }),
  });
  dom.setFieldValue(dom.form.fields[0], "Ada");
  dom.setFieldValue(dom.form.fields[1], "ada@example.com");
  dom.setFieldValue(dom.form.fields[2], "Hola");
  await dom.form.dispatchEvent({ type: "submit", preventDefault() {} });
  assert.match(dom.status.textContent, /No se pudo|could not be sent/i);
  assert.ok(dom.status.classList.values.has("is-error"));
  assert.equal(dom.fetchCalls.length, 1);
  assert.match(dom.fetchCalls[0].url, /^https:\/\/mock\.test\//);
});