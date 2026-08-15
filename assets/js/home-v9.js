(() => {
  const root = document.documentElement;
  root.classList.add("design-v9");
  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn();
  const bi = (es, en) => `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;

  ready(() => {
    const statement = document.querySelector(".v5-statement");
    if (!statement || document.querySelector("[data-af9-root]")) return;

    const section = document.createElement("section");
    section.id = "automation-lab";
    section.className = "section af9-lab";
    section.dataset.af9Root = "lab";
    section.innerHTML = `
      <div class="shell">
        <header class="af9-head">
          <div><p class="overline">04 / AUTOMATION LAB</p><h2>${bi("Contame cómo trabajás.<br><em>AF dibuja dónde automatizar.</em>", "Describe how you work.<br><em>AF maps where to automate.</em>")}</h2></div>
          <p>${bi("El resultado separa reglas, IA, datos y control humano. No ejecuta acciones externas.", "The result separates rules, AI, data and human control. It executes no external actions.")}</p>
        </header>
        <div class="af9-grid">
          <form class="af9-input-card" data-af9-form>
            <div class="af9-card-head"><span>PROCESS / INPUT</span><b>STRUCTURED AI</b></div>
            <textarea rows="7" maxlength="1200" data-af9-input placeholder="Describí un proceso repetitivo o manual…"></textarea>
            <div class="af9-examples"><button type="button" data-example="leads">CONSULTAS</button><button type="button" data-example="csv">CSV</button><button type="button" data-example="docs">DOCUMENTOS</button></div>
            <div class="af9-runtime" data-af9-runtime><span>RUNTIME</span><b>CHECKING</b></div>
            <button class="button button-primary" type="submit" data-af9-submit>${bi("Analizar proceso", "Analyze process")} ↗</button>
          </form>
          <section class="af9-output-card" aria-live="polite">
            <div class="af9-card-head"><span>AF / OUTPUT</span><b data-af9-state>READY</b></div>
            <div class="af9-empty" data-af9-empty><div>INPUT → RULES → AI? → HUMAN → OUTPUT</div><h3>${bi("Primero el proceso. Después la tecnología.", "Process first. Technology second.")}</h3></div>
            <div class="af9-result" hidden data-af9-result></div>
          </section>
        </div>
      </div>`;
    statement.insertAdjacentElement("beforebegin", section);

    const form = section.querySelector("[data-af9-form]");
    const input = section.querySelector("[data-af9-input]");
    const submit = section.querySelector("[data-af9-submit]");
    const empty = section.querySelector("[data-af9-empty]");
    const result = section.querySelector("[data-af9-result]");
    const state = section.querySelector("[data-af9-state]");
    const runtime = section.querySelector("[data-af9-runtime]");
    const endpoint = String(window.ALLFICTION_AUTOMATION_ENDPOINT || "");
    const healthEndpoint = String(window.ALLFICTION_AUTOMATION_HEALTH_ENDPOINT || "");
    const english = () => String(root.lang).toLowerCase().startsWith("en");
    const examples = {
      leads: ["Recibo consultas, clasifico cada pedido, copio datos a una planilla y aviso manualmente al equipo.", "I receive enquiries, classify each request, copy data into a spreadsheet and notify the team manually."],
      csv: ["Cada mañana descargo un CSV, comparo filas nuevas, actualizo estados y aviso cuando aparece una excepción.", "Every morning I download a CSV, compare new rows, update statuses and notify the team when an exception appears."],
      docs: ["Recibo imágenes de documentos, extraigo datos, los cargo al sistema, valido campos y derivo cada caso.", "I receive document images, extract data, enter it into the system, validate fields and route each case."],
    };
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

    function humanReason(reason) {
      const value = String(reason || "unknown");
      if (value === "provider-http-429") return "PROVIDER RATE LIMITED";
      if (/^provider-http-5\d\d$/.test(value)) return "PROVIDER TEMPORARY ERROR";
      if (value === "invalid-structured-output") return "STRUCTURED OUTPUT INVALID";
      if (value === "empty-ai-response") return "EMPTY PROVIDER RESPONSE";
      if (value === "ai-request-failed") return "PROVIDER REQUEST FAILED";
      if (value === "provider-timeout") return "PROVIDER TIMEOUT";
      if (value === "daily-limit-reached") return "DAILY AI BUDGET LIMIT";
      if (value === "rate-limit-exceeded") return "VISITOR RATE LIMIT";
      if (value === "ai-not-configured") return "AI NOT CONFIGURED";
      if (value === "prompt-injection") return "SAFETY GATE";
      if (value === "sensitive-data-detected") return "PRIVACY GATE";
      return value.replaceAll("-", " ").toUpperCase();
    }

    function renderRuntime(info) {
      if (!runtime || !info) return;
      const parts = [String(info.provider || "").toUpperCase(), String(info.model || "")].filter(Boolean);
      if (Number(info.attempts || 0) > 1) parts.push(`${info.attempts} ATTEMPTS`);
      if (Number(info.elapsedMs || 0) > 0) parts.push(`${info.elapsedMs} MS`);
      const telemetry = info.telemetry || {};
      const usage = telemetry.usage || {};
      if (Number(usage.totalTokens || 0) > 0) parts.push(`${usage.totalTokens} TOK`);
      if (telemetry.finishReason) parts.push(String(telemetry.finishReason).toUpperCase());
      runtime.querySelector("b").textContent = parts.join(" · ") || "UNVERIFIED";
      runtime.classList.toggle("is-ok", info.status === "ok" || info.configured === true);
      runtime.classList.toggle("is-fallback", info.status === "fallback");
    }

    async function loadRuntimeHealth() {
      if (!healthEndpoint || !runtime) return;
      try {
        const response = await fetch(healthEndpoint, { headers: { Accept: "application/json" } });
        const health = await response.json();
        if (!response.ok || !health?.ai) throw new Error("invalid-health");
        renderRuntime({ provider: health.ai.provider, model: health.ai.model, configured: health.ai.configured, status: health.ai.enabled && health.ai.configured ? "ok" : "fallback" });
      } catch {
        runtime.querySelector("b").textContent = "UNVERIFIED";
      }
    }

    function render(payload) {
      const a = payload.analysis;
      result.textContent = "";
      empty.hidden = true;
      result.hidden = false;
      result.append(el("h3", "af9-result-title", a.title), el("p", "af9-summary", a.summary));

      const flow = el("div", "af9-flow");
      (a.workflow || []).forEach((step, index) => {
        const card = el("article", `af9-node kind-${step.kind}`);
        card.append(el("small", "", `${String(step.kind).toUpperCase()}${step.humanApproval ? " · APPROVAL" : ""}`), el("b", "", step.label), el("p", "", step.detail));
        flow.appendChild(card);
        if (index < a.workflow.length - 1) flow.appendChild(el("i", "", "→"));
      });
      result.appendChild(flow);

      const chips = el("div", "af9-chips");
      (a.capabilities || []).forEach((item) => chips.appendChild(el("span", "", item)));
      result.appendChild(chips);

      const trace = el("ol", "af9-trace");
      (payload.trace || []).forEach((item) => { const row = el("li"); row.append(el("span", "", item.id), el("b", "", item.label), el("small", "", item.status)); trace.appendChild(row); });
      result.appendChild(trace);
      if (payload.mode === "ai") {
        const elapsed = Number(payload.elapsedMs || payload.runtime?.elapsedMs || 0);
        const attempts = Number(payload.runtime?.attempts || 1);
        const totalTokens = Number(payload.runtime?.telemetry?.usage?.totalTokens || 0);
        state.textContent = elapsed > 0
          ? `SCHEMA OK · ${elapsed} MS${totalTokens > 0 ? ` · ${totalTokens} TOK` : ""}${attempts > 1 ? ` · ${attempts} ATTEMPTS` : ""}`
          : "SCHEMA OK";
      } else {
        const reason = el("div", "af9-fallback-reason");
        reason.append(el("span", "", "FALLBACK REASON"), el("b", "", humanReason(payload.reason)), el("code", "", String(payload.reason || "unknown")));
        result.prepend(reason);
        state.textContent = `SAFE FALLBACK · ${humanReason(payload.reason)}`;
      }
      renderRuntime(payload.runtime || { provider: payload.provider, model: payload.model, elapsedMs: payload.elapsedMs, status: payload.mode === "ai" ? "ok" : "fallback" });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const process = input.value.trim();
      if (process.length < 30 || !endpoint) { state.textContent = "MORE CONTEXT"; return; }
      submit.disabled = input.disabled = true;
      state.textContent = "ANALYZING";
      try {
        const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ process, locale: root.lang || "es-AR", sessionId: "af-web", website: "" }) });
        const payload = await response.json();
        if (!payload?.analysis) throw new Error("invalid");
        render(payload);
      } catch {
        state.textContent = "OFFLINE";
      } finally {
        submit.disabled = input.disabled = false;
      }
    });

    loadRuntimeHealth();

    section.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", () => {
      const value = examples[button.dataset.example];
      if (value) input.value = value[english() ? 1 : 0];
    }));
  });
})();
