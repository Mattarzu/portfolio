(() => {
  const root = document.documentElement;

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s/.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const ACTION_TERMS = [
    "necesito", "quiero", "quisiera", "busco", "armar", "crear", "hacer",
    "desarrollar", "construir", "automatizar", "integrar", "implementar",
    "need", "want", "looking for", "build", "create", "develop", "automate",
    "integrate", "implement",
  ];

  const PROJECT_TERMS = [
    "pagina web", "sitio web", "website", "web app", "aplicacion", "app",
    "sistema", "software", "plataforma", "ecommerce", "e-commerce",
    "tienda online", "dashboard", "chatbot", "automatizacion", "automation",
    "workflow", "proceso", "process", "integracion", "integration", "api",
    "backend", "frontend", "mobile", "pwa", "producto digital", "digital product",
  ];

  const DIRECT_PROJECT_PHRASES = [
    "tengo una idea", "evaluar una idea", "tengo un proceso manual",
    "quiero una pagina web", "necesito una pagina web", "quiero un sitio web",
    "necesito un sitio web", "quiero una app", "necesito una app",
    "i have an idea", "evaluate an idea", "i have a manual process",
    "i need a website", "i want a website", "i need an app", "i want an app",
  ];

  function isProjectIntent(value) {
    const text = normalize(value);
    if (!text) return false;
    if (DIRECT_PROJECT_PHRASES.some((phrase) => text.includes(phrase))) return true;
    return ACTION_TERMS.some((term) => text.includes(term))
      && PROJECT_TERMS.some((term) => text.includes(term));
  }

  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

  ready(() => {
    const form = document.querySelector("[data-ai-form]");
    const input = document.querySelector("[data-ai-input]");
    const submit = document.querySelector("[data-ai-submit]");
    const panel = document.querySelector("[data-ai-panel]");
    const launcher = document.querySelector("[data-ai-launcher]");
    const close = document.querySelector("[data-ai-close]");
    const messages = document.querySelector("[data-ai-messages]");
    const modeLabel = document.querySelector("[data-ai-mode-label]");
    const endpoint = String(window.ALLFICTION_AGENT_ENDPOINT || "").trim();

    if (!form || !input || !submit || !panel || !launcher || !messages || !endpoint) return;

    let awaitingIdea = false;
    let busy = false;
    let briefMode = false;
    const briefContext = [];

    const english = () => String(root.lang || "").toLowerCase().startsWith("en");
    const copy = (es, en) => english() ? en : es;

    function openPanel() {
      if (!panel.classList.contains("is-open")) launcher.click();
    }

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
        if (url.protocol === "https:" || url.origin === window.location.origin) return url.href;
      } catch {
        return null;
      }
      return null;
    }

    function appendMessage(role, text, options = {}) {
      const item = document.createElement("article");
      item.className = `ai-message ${role}`;
      if (options.agent) item.classList.add("agent");
      if (options.thinking) item.classList.add("is-thinking");

      const label = document.createElement("small");
      label.textContent = role === "user"
        ? copy("Vos", "You")
        : options.agent
          ? `AF Agent${options.provider ? ` · ${options.provider === "gemini" ? "Gemini" : "OpenAI"}` : ""}`
          : "AF Intelligence";

      const bubble = document.createElement("div");
      bubble.className = "ai-bubble";

      if (options.thinking) {
        bubble.setAttribute("aria-label", copy("Enrutando al agente", "Routing to agent"));
        bubble.innerHTML = "<i></i><i></i><i></i>";
      } else {
        bubble.textContent = text;
      }

      item.append(label, bubble);

      if (options.tool) {
        const tool = document.createElement("span");
        tool.className = "ai-v11-tool";
        tool.textContent = `TOOL / ${options.tool}`;
        item.appendChild(tool);
      }

      const sources = Array.isArray(options.sources) ? options.sources.slice(0, 3) : [];
      if (sources.length) {
        const sourceList = document.createElement("div");
        sourceList.className = "ai-message-sources";
        const sourceLabel = document.createElement("small");
        sourceLabel.textContent = copy("Evidencia", "Evidence");
        sourceList.appendChild(sourceLabel);

        sources.forEach((source, index) => {
          const href = safeHref(source?.href);
          if (!href || !source?.label) return;
          const link = document.createElement("a");
          link.href = href;
          link.textContent = `[${index + 1}] ${source.label}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          sourceList.appendChild(link);
        });

        if (sourceList.childElementCount > 1) item.appendChild(sourceList);
      }

      if (Array.isArray(options.trace) && options.trace.length) {
        const trace = document.createElement("ol");
        trace.className = "ai-v11-trace";

        const routerStep = document.createElement("li");
        routerStep.textContent = "ROUTER · project-intent";
        trace.appendChild(routerStep);

        options.trace.forEach((step) => {
          const row = document.createElement("li");
          row.textContent = `${step.label} · ${step.status}`;
          trace.appendChild(row);
        });
        item.appendChild(trace);
      }

      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
      return item;
    }

    function setBusy(next) {
      busy = next;
      submit.disabled = next;
      input.disabled = next;
    }

    function restorePlaceholder() {
      input.placeholder = copy(
        "Preguntá por proyectos, arquitectura o experiencia…",
        "Ask about projects, architecture or experience…",
      );
    }

    function addApproval(request) {
      if (!request || request.action !== "prefill_project_form" || !request.preview) return;

      const card = document.createElement("section");
      card.className = "ai-v11-approval";

      const title = document.createElement("b");
      title.textContent = copy("REQUIERE APROBACIÓN HUMANA", "HUMAN APPROVAL REQUIRED");

      const description = document.createElement("p");
      description.textContent = copy(
        "AF puede preparar este brief en el formulario. No se enviará nada.",
        "AF can prepare this brief in the form. Nothing will be sent.",
      );

      const preview = document.createElement("pre");
      preview.textContent = request.preview;

      const controls = document.createElement("div");
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.textContent = copy("Cancelar", "Cancel");

      const approve = document.createElement("button");
      approve.type = "button";
      approve.className = "is-primary";
      approve.textContent = copy("Aprobar y preparar formulario", "Approve and prepare form");

      controls.append(cancel, approve);
      card.append(title, description, preview, controls);
      messages.appendChild(card);
      messages.scrollTop = messages.scrollHeight;

      cancel.addEventListener("click", () => {
        controls.textContent = copy(
          "Cancelado. No se realizó ninguna acción.",
          "Cancelled. No action was taken.",
        );
      });

      approve.addEventListener("click", () => {
        const contact = document.querySelector("[data-contact-form]");
        const message = contact?.querySelector("textarea[name='message']");
        if (!contact || !message) {
          controls.textContent = copy(
            "No pude localizar el formulario.",
            "I could not locate the form.",
          );
          return;
        }

        message.value = request.preview;
        message.dispatchEvent(new Event("input", { bubbles: true }));

        document.dispatchEvent(new CustomEvent("allfiction:brief-approved", {
          detail: { preview: request.preview },
        }));
      });
    }

    function promptForIdea() {
      openPanel();
      awaitingIdea = true;
      briefMode = true;
      appendMessage(
        "assistant",
        copy(
          "Contame qué querés construir o automatizar, para quién es y qué debería resolver. AF Agent lo convierte en un brief antes de pedirte cualquier acción.",
          "Tell me what you want to build or automate, who it is for and what it should solve. AF Agent will turn it into a brief before asking you to take any action.",
        ),
        { agent: true },
      );
      modeLabel.textContent = copy("AF Agent · esperando contexto", "AF Agent · awaiting context");
      input.placeholder = copy(
        "Ej.: necesito una web para mostrar servicios y recibir consultas…",
        "Example: I need a website to present services and receive enquiries…",
      );
      window.setTimeout(() => input.focus({ preventScroll: true }), 50);
    }

    async function runAgent(question) {
      if (!question || busy) return;

      openPanel();
      const projectBrief = briefMode || isProjectIntent(question);
      if (projectBrief) briefMode = true;
      const previousContext = briefContext.join("\n").slice(0, 600);
      if (projectBrief && !briefContext.includes(question)) {
        briefContext.push(question);
        while (briefContext.join("\n").length > 600) briefContext.shift();
      }
      awaitingIdea = false;
      appendMessage("user", question);
      input.value = "";
      input.style.height = "";
      restorePlaceholder();
      setBusy(true);

      const thinking = appendMessage("assistant", "", { agent: true, thinking: true });
      modeLabel.textContent = copy("Intent Router → AF Agent", "Intent Router → AF Agent");

      let payload = null;
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 14_000);

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: question,
              locale: root.lang || "es-AR",
              sessionId: sessionId(),
              intent: projectBrief ? "project-brief" : "",
              context: projectBrief ? previousContext : "",
              website: "",
            }),
          });
          payload = await response.json().catch(() => null);
          if (!response.ok) payload = null;
        } finally {
          window.clearTimeout(timeout);
        }
      } catch {
        payload = null;
      }

      thinking.remove();
      setBusy(false);

      if (!payload || typeof payload.reply !== "string") {
        appendMessage(
          "assistant",
          copy(
            "No pude activar AF Agent en este momento. Tu mensaje no fue enviado como contacto; podés reintentarlo o usar el formulario manual.",
            "I could not activate AF Agent right now. Your message was not sent as a contact; you can retry or use the form manually.",
          ),
          { agent: true },
        );
        modeLabel.textContent = copy("AF Agent · no disponible", "AF Agent · unavailable");
        input.focus({ preventScroll: true });
        return;
      }

      appendMessage("assistant", payload.reply, {
        agent: true,
        provider: payload.provider,
        tool: payload.toolCall?.name,
        sources: payload.sources,
        trace: payload.trace,
      });

      addApproval(payload.approvalRequest);

      modeLabel.textContent = payload.toolCall?.name
        ? `AF Agent · ${payload.toolCall.name}`
        : copy("AF Agent · modo seguro", "AF Agent · safe mode");
      input.focus({ preventScroll: true });
    }

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element
        ? event.target.closest("[data-ai-question]")
        : null;
      if (!target) return;

      const label = normalize(`${target.textContent || ""} ${target.dataset.aiQuestion || ""}`);
      const evaluateIdea = label.includes("evaluar una idea")
        || label.includes("evaluate an idea");

      if (!evaluateIdea) {
        briefMode = false;
        briefContext.length = 0;
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      promptForIdea();
    }, true);

    form.addEventListener("submit", (event) => {
      const question = String(input.value || "").trim();
      if (!question) return;

      if (!briefMode && !awaitingIdea && !isProjectIntent(question)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      runAgent(question);
    }, true);

    document.querySelector("[data-ai-clear]")?.addEventListener("click", () => {
      awaitingIdea = false;
      briefMode = false;
      briefContext.length = 0;
      restorePlaceholder();
    });

    document.addEventListener("allfiction:contact-sent", (event) => {
      if (event.detail?.source !== "af-agent-brief") return;
      awaitingIdea = false;
      briefMode = false;
      briefContext.length = 0;
      restorePlaceholder();
      modeLabel.textContent = copy("AF Intelligence · listo", "AF Intelligence · ready");
    });

    document.addEventListener("allfiction:language", () => {
      if (awaitingIdea) {
        input.placeholder = copy(
          "Ej.: necesito una web para mostrar servicios y recibir consultas…",
          "Example: I need a website to present services and receive enquiries…",
        );
      }
    });
  });
})();
