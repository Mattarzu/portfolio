(() => {
  const STORAGE_KEY = "allfiction_prepared_project_brief";

  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  function isEnglish() {
    return String(document.documentElement.lang || "").toLowerCase().startsWith("en");
  }

  function copy(es, en) {
    return isEnglish() ? en : es;
  }

  function getContactForm() {
    return document.querySelector("[data-contact-form]");
  }

  function closeDrawer() {
    const panel = document.querySelector("[data-ai-panel]");
    const backdrop = document.querySelector("[data-ai-backdrop]");
    const launcher = document.querySelector("[data-ai-launcher]");

    document.body.classList.remove("ai-open");

    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
    }

    backdrop?.classList.remove("is-visible");
    launcher?.setAttribute("aria-expanded", "false");
  }

  function preparedBrief() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  }

  function storeBrief(preview) {
    try {
      sessionStorage.setItem(STORAGE_KEY, preview);
    } catch {}
  }

  function clearStoredBrief() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function ensureContactBanner(preview) {
    const form = getContactForm();
    if (!form) return null;

    form.classList.add("is-ai-brief-ready");
    form.dataset.aiBriefReady = "true";

    let banner = document.querySelector("[data-af13-contact-brief]");
    if (!banner) {
      banner = document.createElement("aside");
      banner.className = "af13-contact-brief";
      banner.dataset.af13ContactBrief = "true";
      banner.setAttribute("role", "status");

      const label = document.createElement("span");
      label.className = "af13-contact-brief__label";
      label.dataset.af13Label = "true";

      const title = document.createElement("strong");
      title.dataset.af13Title = "true";

      const description = document.createElement("p");
      description.dataset.af13Description = "true";

      const actions = document.createElement("div");
      actions.className = "af13-contact-brief__actions";

      const review = document.createElement("button");
      review.type = "button";
      review.dataset.af13ReviewForm = "true";

      actions.appendChild(review);
      banner.append(label, title, description, actions);
      form.parentNode?.insertBefore(banner, form);
    }

    banner.querySelector("[data-af13-label]").textContent = "AF AGENT / HANDOFF";
    banner.querySelector("[data-af13-title]").textContent = copy("Brief preparado", "Brief prepared");
    banner.querySelector("[data-af13-description]").textContent = copy(
      "El brief ya está cargado en el formulario. Revisá tus datos y enviá cuando quieras; todavía no se envió nada.",
      "The brief is already loaded in the form. Review your details and send whenever you are ready; nothing has been sent yet.",
    );
    banner.querySelector("[data-af13-review-form]").textContent = copy("Revisar formulario", "Review form");
    banner.dataset.previewLength = String(preview.length);
    return banner;
  }

  function compactApprovalCard() {
    const card = Array.from(document.querySelectorAll(".ai-v11-approval")).at(-1);
    if (!card) return;

    card.classList.add("is-approved");
    card.replaceChildren();

    const title = document.createElement("b");
    title.textContent = copy("BRIEF PREPARADO", "BRIEF PREPARED");

    const description = document.createElement("p");
    description.textContent = copy(
      "El formulario está listo. Todavía no se envió nada.",
      "The form is ready. Nothing has been sent yet.",
    );

    const controls = document.createElement("div");
    const review = document.createElement("button");
    review.type = "button";
    review.className = "is-primary";
    review.dataset.af13ReviewForm = "true";
    review.textContent = copy("Revisar formulario", "Review form");

    controls.appendChild(review);
    card.append(title, description, controls);
  }

  function focusPreparedForm({ smooth = true } = {}) {
    const form = getContactForm();
    const section = document.getElementById("contacto");
    if (!form || !section) return;

    closeDrawer();
    form.classList.add("is-ai-brief-ready");

    section.scrollIntoView({
      behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto",
      block: "start",
    });

    window.setTimeout(() => {
      const firstEmpty = Array.from(
        form.querySelectorAll("input[name='name'], input[name='contact'], textarea[name='message']"),
      ).find((field) => !String(field.value || "").trim());
      const target = firstEmpty || form.querySelector("textarea[name='message']");
      target?.focus({ preventScroll: true });
      form.classList.add("is-ai-brief-focus");
      window.setTimeout(() => form.classList.remove("is-ai-brief-focus"), 1600);
    }, smooth ? 420 : 40);
  }

  function restorePreparedBrief() {
    const preview = preparedBrief();
    if (!preview) return;

    const form = getContactForm();
    const message = form?.querySelector("textarea[name='message']");
    if (!form || !message) return;

    if (!String(message.value || "").trim()) {
      message.value = preview;
      message.dispatchEvent(new Event("input", { bubbles: true }));
    }

    ensureContactBanner(preview);
  }

  function clearPreparedState() {
    clearStoredBrief();
    const form = getContactForm();
    form?.classList.remove("is-ai-brief-ready", "is-ai-brief-focus");
    if (form) delete form.dataset.aiBriefReady;
    document.querySelector("[data-af13-contact-brief]")?.remove();
  }

  ready(() => {
    const form = getContactForm();

    document.addEventListener("allfiction:brief-approved", (event) => {
      const preview = String(event.detail?.preview || "").trim();
      if (!preview) return;

      storeBrief(preview);
      ensureContactBanner(preview);
      compactApprovalCard();
      window.setTimeout(() => focusPreparedForm({ smooth: true }), 80);
    });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element
        ? event.target.closest("[data-af13-review-form]")
        : null;
      if (!target) return;
      event.preventDefault();
      focusPreparedForm({ smooth: true });
    });

    form?.addEventListener("reset", () => {
      window.setTimeout(clearPreparedState, 0);
    });

    document.addEventListener("allfiction:language", () => {
      const preview = preparedBrief();
      if (preview) ensureContactBanner(preview);
    });

    restorePreparedBrief();
  });
})();
