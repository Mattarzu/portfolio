(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
      return;
    }
    fn();
  };

  ready(() => {
    const isLocalHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);

    const aiEndpoint = isLocalHost
      ? "http://127.0.0.1:8787/ai-chat"
      : window.MMLAB_AI_CHAT_ENDPOINT || "";

    const contactEndpoint =
      window.CHAT_ENDPOINT ||
      window.MMLAB_CONTACT_ENDPOINT ||
      (isLocalHost ? "http://127.0.0.1:8000/contact" : "");

    function replaceWithCleanClone(selector) {
      const oldNode = document.querySelector(selector);
      if (!oldNode) return null;

      const clone = oldNode.cloneNode(true);
      clone.removeAttribute("style");
      oldNode.replaceWith(clone);
      return clone;
    }

    const hero = replaceWithCleanClone(".hero-mascot");
    const toggle = replaceWithCleanClone(".panda-toggle");
    const panel = replaceWithCleanClone("#panda-panel");

    if (!hero || !toggle || !panel) return;

    document.body.classList.add("panda-stable");

    const closeBtn = panel.querySelector(".panda-close");
    const mode = panel.querySelector("#panda-mode");
    const message = panel.querySelector("#panda-message");
    const hint = panel.querySelector("#panda-hint");
    const actions = panel.querySelector(".panda-actions");
    const controls = panel.querySelector(".panda-controls");
    const contactOpen = panel.querySelector(".panda-contact-open");
    const contactForm = panel.querySelector(".panda-contact-form");

    let aiOpen = panel.querySelector(".panda-ai-open");
    let typeJob = 0;
    let busy = false;

    function ensureAiButton() {
      if (aiOpen) return aiOpen;

      aiOpen = document.createElement("button");
      aiOpen.className = "panda-ai-open";
      aiOpen.type = "button";
      aiOpen.textContent = "Preguntar a Panda IA";

      if (contactOpen && contactOpen.parentElement) {
        contactOpen.insertAdjacentElement("afterend", aiOpen);
      } else if (actions) {
        actions.appendChild(aiOpen);
      } else {
        panel.appendChild(aiOpen);
      }

      return aiOpen;
    }

    function ensureBubble() {
      let bubble = document.getElementById("panda-ai-bubble");
      if (bubble) return bubble;

      bubble = document.createElement("section");
      bubble.id = "panda-ai-bubble";
      bubble.className = "panda-ai-bubble";
      bubble.hidden = true;
      bubble.setAttribute("aria-live", "polite");
      bubble.innerHTML = `
        <div class="panda-ai-bubble-title">Panda IA</div>
        <div class="panda-ai-bubble-text"></div>
        <div class="panda-ai-bubble-hint"></div>
      `;

      document.body.appendChild(bubble);
      return bubble;
    }

    function ensureComposer() {
      let composer = document.getElementById("panda-ai-composer");
      if (composer) return composer;

      composer = document.createElement("form");
      composer.id = "panda-ai-composer";
      composer.className = "panda-ai-composer";
      composer.hidden = true;
      composer.innerHTML = `
        <input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="panda-hp" />
        <label for="panda-ai-composer-message">Pregunta para Panda IA</label>
        <div class="panda-ai-composer-row">
          <textarea id="panda-ai-composer-message" name="message" rows="2" maxlength="1200" placeholder="Escribí tu pregunta"></textarea>
          <button class="panda-ai-composer-submit" type="submit">Enviar</button>
        </div>
      `;

      document.body.appendChild(composer);
      return composer;
    }

    ensureAiButton();
    const bubble = ensureBubble();
    const composer = ensureComposer();
    const textarea = composer.querySelector("#panda-ai-composer-message");
    const submitBtn = composer.querySelector(".panda-ai-composer-submit");

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar asistente Panda" : "Abrir asistente Panda");
    }

    function setPanelText(nextMode, nextMessage, nextHint) {
      if (mode) mode.textContent = nextMode;
      if (message) message.textContent = nextMessage;
      if (hint) hint.textContent = nextHint;
    }

    function setBubble(titleText, bodyText, hintText = "") {
      bubble.hidden = false;

      const title = bubble.querySelector(".panda-ai-bubble-title");
      const text = bubble.querySelector(".panda-ai-bubble-text");
      const bubbleHint = bubble.querySelector(".panda-ai-bubble-hint");

      if (title) title.textContent = titleText;
      if (text) text.textContent = bodyText;
      if (bubbleHint) bubbleHint.textContent = hintText;
    }

    async function typeBubble(text, speed = 9) {
      const target = bubble.querySelector(".panda-ai-bubble-text");
      if (!target) return;

      const currentJob = ++typeJob;

      if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        target.textContent = text;
        return;
      }

      target.textContent = "";

      for (const char of text) {
        if (currentJob !== typeJob) return;
        target.textContent += char;
        await new Promise((resolve) => setTimeout(resolve, speed));
      }
    }

    function setSpeaking(isSpeaking) {
      document.body.classList.toggle("panda-speaking", isSpeaking);
    }

    function setBusy(nextBusy) {
      busy = nextBusy;
      if (!submitBtn) return;
      submitBtn.disabled = nextBusy;
      submitBtn.textContent = nextBusy ? "Enviando..." : "Enviar";
    }

    function hideAiSurface() {
      document.body.classList.remove("panda-ai-active", "panda-speaking");
      bubble.hidden = true;
      composer.hidden = true;
    }

    function setMode(nextMode) {
      document.body.dataset.pandaStableMode = nextMode;

      if (nextMode === "home") {
        hideAiSurface();
        setOpen(true);

        if (contactForm) contactForm.hidden = true;
        if (actions) actions.hidden = false;
        if (controls) controls.hidden = false;

        setPanelText(
          "M M Panda",
          "Soy el asistente de M M LAB. Puedo mostrarte proyectos, recibir un mensaje para Matt o responder con IA local.",
          "Elegí una opción."
        );
        return;
      }

      if (nextMode === "contact") {
        hideAiSurface();
        setOpen(true);

        if (actions) actions.hidden = false;
        if (controls) controls.hidden = false;
        if (contactForm) contactForm.hidden = false;

        setPanelText(
          "Hablar con Matt",
          "Completá el formulario y Panda se lo envía a Matt.",
          contactEndpoint ? "El envío usa el Worker de contacto." : "Sin endpoint configurado."
        );
        return;
      }

      if (nextMode === "ai") {
        document.body.classList.add("panda-ai-active");
        document.body.classList.remove("panda-speaking");

        setOpen(false);
        composer.hidden = false;

        setBubble(
          "Panda IA",
          "Preguntame sobre desarrollo web, automatización, backend, IA aplicada o cómo trabajar con Matt.",
          "Enter envía. Shift+Enter agrega una línea."
        );

        textarea.focus({ preventScroll: true });
      }
    }

    async function sendAiMessage(payload) {
      if (!aiEndpoint) return { ok: false, reason: "missing-endpoint" };

      try {
        const response = await fetch(aiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          return { ok: false, reason: data?.detail || `http-${response.status}` };
        }

        if (!data || data.ok !== true || typeof data.reply !== "string") {
          return { ok: false, reason: "invalid-response" };
        }

        return { ok: true, reply: data.reply };
      } catch {
        return { ok: false, reason: "network-error" };
      }
    }

    async function submitAiQuestion() {
      if (!textarea || busy) return;

      const payload = {
        message: textarea.value.trim(),
        page: window.location.href,
        locale: document.documentElement.lang || navigator.language || "es",
        website: String(composer.querySelector('[name="website"]')?.value || "").trim()
      };

      if (!payload.message) {
        setMode("ai");
        setBubble(
          "Panda IA",
          "Escribí una pregunta para poder responder.",
          "Enter envía. Shift+Enter agrega una línea."
        );
        textarea.focus({ preventScroll: true });
        return;
      }

      setMode("ai");
      setBusy(true);
      setSpeaking(true);
      setBubble("Panda IA", "Pensando...", "Consultando Qwen local mediante el Worker.");

      const result = await sendAiMessage(payload);

      setBusy(false);

      if (result.ok) {
        setBubble("Panda IA", "", "Para avanzar con una consulta real, usá “Hablar con Matt”.");
        await typeBubble(result.reply);
        setSpeaking(false);
        textarea.value = "";
        textarea.focus({ preventScroll: true });
        return;
      }

      setSpeaking(false);
      setBubble(
        "Panda IA no disponible",
        `No pude responder con IA. Motivo: ${result.reason}`,
        "Verificá que Qwen local y wrangler dev estén activos."
      );
    }

    async function submitContact(event) {
      event.preventDefault();

      if (!contactForm || !contactEndpoint) {
        setPanelText("Contacto no disponible", "No hay endpoint de contacto configurado.", "Probá más tarde.");
        return;
      }

      const formData = new FormData(contactForm);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        contact: String(formData.get("contact") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        page: window.location.href,
        createdAt: new Date().toISOString(),
        website: String(formData.get("website") || "").trim()
      };

      if (!payload.name || !payload.contact || !payload.message) {
        setPanelText("Faltan datos", "Completá nombre, contacto y mensaje.", "El contacto puede ser email, Telegram u otra vía.");
        return;
      }

      setPanelText("Enviando", "Panda está enviando el mensaje a Matt.", "Esperá unos segundos.");

      try {
        const response = await fetch(contactEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data || data.ok !== true) {
          setPanelText("No se pudo enviar", "El Worker no confirmó el envío.", "Probá más tarde.");
          return;
        }

        contactForm.reset();
        contactForm.hidden = true;
        setPanelText("Mensaje enviado", "Matt recibió la notificación.", "Gracias por dejar el contexto inicial.");
      } catch {
        setPanelText("Error de red", "No pude conectar con el Worker.", "Probá más tarde.");
      }
    }

    toggle.addEventListener("click", () => {
      if (document.body.dataset.pandaStableMode === "ai") {
        setMode("home");
        return;
      }

      if (panel.hidden) setMode("home");
      else {
        setOpen(false);
        hideAiSurface();
      }
    });

    hero.addEventListener("click", () => {
      if (document.body.dataset.pandaStableMode === "ai") {
        setMode("home");
        return;
      }

      if (panel.hidden) setMode("home");
      else {
        setOpen(false);
        hideAiSurface();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        setOpen(false);
        hideAiSurface();
      });
    }

    if (contactOpen) {
      contactOpen.addEventListener("click", () => setMode("contact"));
    }

    if (aiOpen) {
      aiOpen.addEventListener("click", () => setMode("ai"));
    }

    if (contactForm) {
      contactForm.addEventListener("submit", submitContact);
    }

    composer.addEventListener("submit", (event) => {
      event.preventDefault();
      submitAiQuestion();
    });

    submitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      submitAiQuestion();
    });

    textarea.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault();
      submitAiQuestion();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      hideAiSurface();
    });

    setOpen(false);
    hideAiSurface();
  });
})();
