(() => {
  const root = document.documentElement;
  const languageKey = "allfiction_language";
  const languageButtons = Array.from(document.querySelectorAll("[data-language]"));
  const pageTitle = {
    "es-AR": root.dataset.titleEs,
    "en-GB": root.dataset.titleEn
  };
  const pageDescription = {
    "es-AR": root.dataset.descriptionEs,
    "en-GB": root.dataset.descriptionEn
  };

  function normalizeLanguage(value) {
    return String(value || "").toLowerCase().startsWith("en") ? "en-GB" : "es-AR";
  }

  function setMeta(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute("content", value);
  }

  function setLanguage(value, syncUrl = true) {
    const language = normalizeLanguage(value);
    root.lang = language;

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    if (pageTitle[language]) {
      document.title = pageTitle[language];
      setMeta("meta[property='og:title']", pageTitle[language]);
      setMeta("meta[name='twitter:title']", pageTitle[language]);
    }

    if (pageDescription[language]) {
      setMeta("meta[name='description']", pageDescription[language]);
      setMeta("meta[property='og:description']", pageDescription[language]);
      setMeta("meta[name='twitter:description']", pageDescription[language]);
    }

    localStorage.setItem(languageKey, language);

    if (syncUrl) {
      const url = new URL(window.location.href);
      if (language === "es-AR") url.searchParams.delete("lang");
      else url.searchParams.set("lang", "en");
      window.history.replaceState({}, "", url);
    }
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = localStorage.getItem(languageKey);
  setLanguage(requestedLanguage || savedLanguage || navigator.language, false);

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!(event.target instanceof Node)) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNav();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
      closeAssistant();
    }
  });

  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const navLinks = Array.from(document.querySelectorAll("[data-nav] a[href^='#']"));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        sections.forEach((item) => {
          item.link.classList.toggle("is-active", item.section === visible.target);
        });
      },
      { rootMargin: "-25% 0px -58% 0px", threshold: [0.1, 0.35, 0.65] }
    );
    sections.forEach((item) => navObserver.observe(item.section));
  }

  const filterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
  const projectCards = Array.from(document.querySelectorAll("[data-project-category]"));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      projectCards.forEach((card) => {
        const categories = (card.dataset.projectCategory || "").split(" ");
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });

  const assistantLauncher = document.querySelector("[data-assistant-launcher]");
  const assistantPanel = document.querySelector("[data-assistant-panel]");
  const assistantClose = document.querySelector("[data-assistant-close]");

  function closeAssistant() {
    if (!assistantLauncher || !assistantPanel) return;
    assistantLauncher.setAttribute("aria-expanded", "false");
    assistantPanel.classList.remove("is-open");
  }

  if (assistantLauncher && assistantPanel) {
    assistantLauncher.addEventListener("click", () => {
      const open = assistantLauncher.getAttribute("aria-expanded") !== "true";
      assistantLauncher.setAttribute("aria-expanded", String(open));
      assistantPanel.classList.toggle("is-open", open);
    });

    assistantClose?.addEventListener("click", closeAssistant);
    assistantPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeAssistant);
    });
  }
})();
