// Public frontend config for the ALLFICTION Software contact backend.
// No secrets here. Provider and Telegram credentials live only in the backend.
window.MMLAB_CONTACT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/contact";
window.MMLAB_AI_CHAT_ENDPOINT = "https://mmlab-contact-api.mattm2.workers.dev/ai-chat";
window.MMLAB_AI_ENABLED = true;
window.ALLFICTION_AI_ENDPOINT = window.MMLAB_AI_CHAT_ENDPOINT;
window.ALLFICTION_AI_ENABLED = true;

// V4 is intentionally loaded as an isolated visual/content layer so the existing
// portfolio behaviour can be reverted without touching contact, AI or i18n logic.
(() => {
  const revision = "20260812-v4";

  if (!document.querySelector("link[data-allfiction-v4]")) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `./assets/css/home-v4.css?v=${revision}`;
    stylesheet.dataset.allfictionV4 = "true";
    document.head.appendChild(stylesheet);
  }

  if (!document.querySelector("script[data-allfiction-v4]")) {
    const script = document.createElement("script");
    script.src = `./assets/js/home-v4.js?v=${revision}`;
    script.dataset.allfictionV4 = "true";
    document.head.appendChild(script);
  }
})();
