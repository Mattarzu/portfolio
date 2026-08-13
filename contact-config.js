// Public frontend config for the ALLFICTION Software contact backend.
// No secrets here. Provider and Telegram credentials live only in the backend.
window.MMLAB_CONTACT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/contact";
window.MMLAB_AI_CHAT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/ai-chat";
window.MMLAB_AUTOMATION_ANALYZE_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/automation-analyze";
window.MMLAB_AI_ENABLED = true;
window.ALLFICTION_AI_ENDPOINT = window.MMLAB_AI_CHAT_ENDPOINT;
window.ALLFICTION_AUTOMATION_ENDPOINT = window.MMLAB_AUTOMATION_ANALYZE_ENDPOINT;
window.ALLFICTION_AI_ENABLED = true;

// Visual layers are isolated from the production contact/AI/i18n behaviour.
// V4 establishes the editorial identity; V5 adds progressive enhancement;
// V6 owns the concrete copy; V7 adds contextual navigation and adaptive motion;
// V8 owns the warm yellow palette; V9 adds the Automation Lab.
(() => {
  const v4Revision = "20260812-v4";
  const v5Revision = "20260812-v5";
  const v6Revision = "20260812-v6";
  const v7Revision = "20260812-v7";
  const v8Revision = "20260813-v8";
  const v9Revision = "20260813-v9";

  const ensureStylesheet = (selector, href, datasetKey) => {
    if (document.querySelector(selector)) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    stylesheet.dataset[datasetKey] = "true";
    document.head.appendChild(stylesheet);
  };

  const ensureScript = (selector, src, datasetKey, onload) => {
    const existing = document.querySelector(selector);
    if (existing) {
      if (typeof onload === "function") onload();
      return existing;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset[datasetKey] = "true";
    if (typeof onload === "function") script.addEventListener("load", onload, { once: true });
    document.head.appendChild(script);
    return script;
  };

  ensureStylesheet(
    "link[data-allfiction-v4]",
    `./assets/css/home-v4.css?v=${v4Revision}`,
    "allfictionV4",
  );

  const loadV9 = () => {
    ensureStylesheet("link[data-allfiction-v9]", `./assets/css/home-v9.css?v=${v9Revision}`, "allfictionV9");
    ensureStylesheet("link[data-allfiction-v9-grid]", `./assets/css/af9.css?v=${v9Revision}`, "allfictionV9Grid");
    ensureStylesheet("link[data-allfiction-v9-core]", `./assets/css/af9-core.css?v=${v9Revision}`, "allfictionV9Core");
    ensureStylesheet("link[data-allfiction-v9-controls]", `./assets/css/af9-controls.css?v=${v9Revision}`, "allfictionV9Controls");
    ensureStylesheet("link[data-allfiction-v9-output]", `./assets/css/af9-output.css?v=${v9Revision}`, "allfictionV9Output");
    ensureScript("script[data-allfiction-v9]", `./assets/js/home-v9.js?v=${v9Revision}`, "allfictionV9");
  };

  const loadV8 = () => {
    ensureStylesheet(
      "link[data-allfiction-v8]",
      `./assets/css/home-v8.css?v=${v8Revision}`,
      "allfictionV8",
    );
    loadV9();
  };

  const loadV7 = () => {
    ensureStylesheet(
      "link[data-allfiction-v7]",
      `./assets/css/home-v7.css?v=${v7Revision}`,
      "allfictionV7",
    );
    ensureScript(
      "script[data-allfiction-v7]",
      `./assets/js/home-v7.js?v=${v7Revision}`,
      "allfictionV7",
      loadV8,
    );
  };

  const loadV6 = () => {
    ensureScript(
      "script[data-allfiction-v6]",
      `./assets/js/home-v6.js?v=${v6Revision}`,
      "allfictionV6",
      loadV7,
    );
  };

  const loadV5 = () => {
    ensureStylesheet(
      "link[data-allfiction-v5]",
      `./assets/css/home-v5.css?v=${v5Revision}`,
      "allfictionV5",
    );
    ensureScript(
      "script[data-allfiction-v5]",
      `./assets/js/home-v5.js?v=${v5Revision}`,
      "allfictionV5",
      loadV6,
    );
  };

  ensureScript(
    "script[data-allfiction-v4]",
    `./assets/js/home-v4.js?v=${v4Revision}`,
    "allfictionV4",
    loadV5,
  );
})();
