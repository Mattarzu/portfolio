const mmLabPrefersReducedMotion = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mmLabTranslate = (key) => {
  const api = window.MMLAB_I18N;
  if (api && typeof api.translate === "function") {
    const value = api.translate(key);
    if (value && value !== key) return value;
  }

  return key;
};

(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  const links = Array.from(document.querySelectorAll(".nav-links a"));

  if (!nav) return;

  function closeMenu() {
    if (!toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const nextOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", String(nextOpen));
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!toggle || !nav.classList.contains("is-open")) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!nav.contains(target) && !toggle.contains(target)) {
      closeMenu();
    }
  });

  const sections = links
    .map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;

      const id = href.replace("#", "");
      const section = id ? document.getElementById(id) : null;
      return section ? { id, section, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const active = sections.find((item) => item.section === visible.target);
      if (!active) return;

      sections.forEach((item) => {
        item.link.classList.toggle("is-active", item.id === active.id);
      });
    },
    {
      rootMargin: "-22% 0px -58% 0px",
      threshold: [0.15, 0.35, 0.6]
    }
  );

  sections.forEach((item) => observer.observe(item.section));
})();
