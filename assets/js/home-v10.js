(() => {
  const root = document.documentElement;
  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

  ready(async () => {
    const lab = document.querySelector("#automation-lab .shell");
    if (!lab || document.querySelector("[data-af10-root]")) return;

    const runEndpoint = String(window.ALLFICTION_AGENT_ENDPOINT || "");
    const healthEndpoint = String(window.ALLFICTION_AGENT_HEALTH_ENDPOINT || "");
    if (!runEndpoint || !healthEndpoint) return;

    try {
      const health = await fetch(healthEndpoint, { headers: { Accept: "application/json" } });
      const state = await health.json();
      if (!health.ok || state?.capability !== "tool-calling-v1") return;
    } catch {
      return;
    }

    root.classList.add("design-v10");
    const bilingual = (es, en) => `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;
    const agent = document.createElement("section");
    agent.className = "af10-agent";
    agent.dataset.af10Root = "agent";
    agent.innerHTML = `
      <header class="af10-head">
        <div><p class="overline">05 / AF AGENT</p><h3>${bilingual("Ahora AF puede elegir<br><em>herramientas.</em>", "AF can now choose<br><em>tools.</em>")}</h3></div>
        <p>${bilingual("Las tools públicas son de solo lectura. Cualquier paso que cambie la interfaz requiere aprobación explícita.", "Public tools are read-only. Any step that changes the interface requires explicit approval.")}</p>
      </header>
      <div class="af10-console">
        <form class="af10-form" data-af10-form>
          <textarea rows="3" maxlength="800" data-af10-input></textarea>
          <div class="af10-actions">
            <button type="button" data-af10-example="evidence">AI EVIDENCE</button>
            <button type="button" data-af10-example="project">MOTORATLAS</button>
            <button type="button" data-af10-example="brief">PROJECT BRIEF</button>
            <button class="af10-run" type="submit" data-af10-submit>${bilingual("Ejecutar agente", "Run agent")} ↗</button>
          </div>
        </form>
        <div class="af10-output" aria-live="polite" data-af10-output>
          <div class="af10-ready"><span>MODEL</span><i>→</i><span>TOOL</span><i>→</i><span>RESULT</span></div>
        </div>
      </div>`;
    lab.appendChild(agent);

    const form = agent.querySelector("[data-af10-form]");
    const input = agent.querySelector("[data-af10-input]");
    const submit = agent.querySelector("[data-af10-submit]");
    const output = agent.querySelector("[data-af10-output]");
    const english = () => String(root.lang || "").toLowerCase().startsWith("en");
    const examples = {
      evidence: ["¿Qué proyectos demuestran mejor capacidades reales de inteligencia artificial?", "Which projects best demonstrate real AI capabilities?"],
      project: ["Mostrame la evidencia pública y arquitectura principal de MotorAtlas.", "Show me MotorAtlas public evidence and its main architecture."],
      brief: ["Prepará un brief para automatizar consultas entrantes, clasificarlas y dejar revisión humana antes de responder.", "Draft a brief to automate inbound enquiries, classify them and keep human review before responding."],
    };

    function sessionId() {
      const key = "allfiction_agent_session";
      let value = sessionStorage.getItem(key);
      if (!value) {
        value = globalThis.crypto?.randomUUID?.() || `af-agent-${Date.now().toString(36)}`;
        sessionStorage.setItem(key, value);
      }
      return value;
    }

    function safeHref(value) {
      try {
        const url = new URL(value, window.location.href);
        return url.protocol === "https:" ? url.href : null;
      } catch {
        return null;
      }
    }

    function addTrace(trace) {
      const list = document.createElement("ol");
      list.className = "af10-trace";
      (trace || []).forEach((item) => {
        const row = document.createElement("li");
        row.innerHTML = `<span>${item.id}</span><b>${item.label}</b><small></small>`;
        row.querySelector("small").textContent = item.status;
        list.appendChild(row);
      });
      output.appendChild(list);
    }

    function render(payload) {
      output.textContent = "";
      const meta = document.createElement("div");
      meta.className = "af10-meta";
      meta.innerHTML = `<b>AF / ${payload.mode === "agent" ? "AGENT" : "GUIDED"}</b><span></span>`;
      meta.querySelector("span").textContent = payload.toolCall?.name || payload.reason || "safe fallback";
      output.appendChild(meta);

      const reply = document.createElement("p");
      reply.className = "af10-reply";
      reply.textContent = payload.reply || "";
      output.appendChild(reply);

      if (Array.isArray(payload.sources) && payload.sources.length) {
        const sources = document.createElement("div");
        sources.className = "af10-sources";
        payload.sources.forEach((source) => {
          const href = safeHref(source?.href);
          if (!href) return;
          const link = document.createElement("a");
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = `${source.label} ↗`;
          sources.appendChild(link);
        });
        output.appendChild(sources);
      }

      addTrace(payload.trace);

      if (payload.approvalRequest?.action === "prefill_project_form") {
        const approval = document.createElement("section");
        approval.className = "af10-approval";
        const title = document.createElement("b");
        title.textContent = english() ? "HUMAN APPROVAL REQUIRED" : "REQUIERE APROBACIÓN HUMANA";
        const preview = document.createElement("pre");
        preview.textContent = payload.approvalRequest.preview;
        const controls = document.createElement("div");
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = english() ? "Cancel" : "Cancelar";
        const approve = document.createElement("button");
        approve.type = "button";
        approve.className = "af10-approve";
        approve.textContent = english() ? "Approve and prepare form" : "Aprobar y preparar formulario";
        controls.append(cancel, approve);
        approval.append(title, preview, controls);
        output.appendChild(approval);

        cancel.addEventListener("click", () => {
          controls.textContent = english() ? "Cancelled. No action was taken." : "Cancelado. No se realizó ninguna acción.";
        });

        approve.addEventListener("click", () => {
          const contact = document.querySelector("[data-contact-form]");
          const message = contact?.querySelector("textarea[name='message']");
          if (!contact || !message) return;
          message.value = payload.approvalRequest.preview;
          message.dispatchEvent(new Event("input", { bubbles: true }));
          controls.textContent = english()
            ? "Approved. The form was prepared locally; it has not been sent."
            : "Aprobado. El formulario se preparó localmente; todavía no fue enviado.";
          document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => contact.querySelector("input[name='name']")?.focus({ preventScroll: true }), 450);
        });
      }
    }

    async function run(message) {
      const value = String(message || "").trim();
      if (!value) return;
      submit.disabled = input.disabled = true;
      output.innerHTML = `<div class="af10-thinking"><i></i><i></i><i></i><span>${english() ? "Selecting a tool…" : "Seleccionando herramienta…"}</span></div>`;
      try {
        const response = await fetch(runEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: value,
            locale: root.lang || "es-AR",
            sessionId: sessionId(),
            website: "",
          }),
        });
        const payload = await response.json();
        if (!payload?.reply) throw new Error("invalid-agent-response");
        render(payload);
      } catch {
        output.textContent = english()
          ? "Agent mode could not connect. AF Intelligence and Automation Lab remain available."
          : "No se pudo conectar el modo agente. AF Intelligence y Automation Lab siguen disponibles.";
      } finally {
        submit.disabled = input.disabled = false;
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      run(input.value);
    });

    agent.querySelectorAll("[data-af10-example]").forEach((button) => {
      button.addEventListener("click", () => {
        const pair = examples[button.dataset.af10Example];
        if (pair) input.value = pair[english() ? 1 : 0];
      });
    });

    function syncCopy() {
      input.placeholder = english()
        ? "Ask AF to find evidence, inspect a project or draft a project brief…"
        : "Pedile a AF que busque evidencia, inspeccione un proyecto o prepare un brief…";
    }
    syncCopy();
    document.addEventListener("allfiction:language", syncCopy);
  });
})();
