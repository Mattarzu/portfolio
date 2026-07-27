(() => {
  const form = document.querySelector("[data-contact-form]");
  const submit = document.querySelector("[data-contact-submit]");
  const status = document.querySelector("[data-contact-status]");
  const endpoint = String(window.MMLAB_CONTACT_ENDPOINT || "").trim();
  let busy = false;

  if (!form || !submit || !status) return;

  const isEnglish = () => document.documentElement.lang.toLowerCase().startsWith("en");

  function setStatus(type, es, en) {
    status.textContent = isEnglish() ? en : es;
    status.classList.toggle("is-success", type === "success");
    status.classList.toggle("is-error", type === "error");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;

    form.querySelectorAll("[required]").forEach((field) => {
      field.setAttribute("aria-invalid", String(!field.checkValidity()));
    });

    if (!form.reportValidity()) {
      setStatus("error", "Revisá los campos obligatorios.", "Please review the required fields.");
      return;
    }

    if (!endpoint) {
      setStatus(
        "error",
        "El canal directo no está disponible. Usá email o LinkedIn.",
        "The direct channel is unavailable. Please use email or LinkedIn.",
      );
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      page: window.location.href,
      createdAt: new Date().toISOString(),
      website: String(formData.get("website") || "").trim(),
    };

    busy = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    setStatus("busy", "Enviando consulta…", "Sending enquiry…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 14_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(result?.detail || "send-failed");

      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((field) => {
        field.removeAttribute("aria-invalid");
      });
      setStatus(
        "success",
        "Mensaje enviado. Matt recibió la notificación.",
        "Message sent. Matt received the notification.",
      );
    } catch {
      setStatus(
        "error",
        "No se pudo enviar ahora. Probá por email o LinkedIn.",
        "It could not be sent right now. Please try email or LinkedIn.",
      );
    } finally {
      window.clearTimeout(timeout);
      busy = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.removeAttribute("aria-invalid");
    }
  });
})();
