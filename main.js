(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".panda-toggle");
  const panel = document.getElementById("panda-panel");
  const closeBtn = document.querySelector(".panda-close");
  const message = document.getElementById("panda-message");
  const heroMascot = document.querySelector(".hero-mascot");
  const pandaLinks = document.querySelectorAll(".panda-actions a");

  if (!toggle || !panel || !message) return;

  const messages = {
    welcome: "Hola, soy M M Panda. Bienvenido a M M LAB. Te acompaño por los proyectos, el stack y el roadmap.",
    default: "Estoy acá para guiarte por M M LAB.",
    hero: "Este laboratorio reúne software, automatización, IA local y herramientas propias.",
    about: "Acá se resume el enfoque de trabajo detrás de M M LAB.",
    projects: "Estos son los proyectos principales del laboratorio.",
    stack: "Este bloque resume el stack técnico principal.",
    roadmap: "Acá están los próximos frentes y mejoras del laboratorio.",
    contact: "GitHub es la base pública donde se organizan los proyectos."
  };

  let userInteracted = false;
  let greetingShown = false;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  function speak(keyOrText) {
    message.textContent = messages[keyOrText] || keyOrText;
  }

  toggle.addEventListener("click", () => {
    userInteracted = true;
    const open = panel.hidden;
    setOpen(open);
    if (open) speak("default");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      userInteracted = true;
      setOpen(false);
    });
  }

  if (heroMascot) {
    heroMascot.addEventListener("click", () => {
      userInteracted = true;
      const target = document.getElementById("proyectos");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(true);
      speak("projects");
    });

    heroMascot.addEventListener("mouseenter", () => {
      setOpen(true);
      speak("hero");
    });
  }

  pandaLinks.forEach((link) => {
    link.addEventListener("click", () => {
      userInteracted = true;
      const href = (link.getAttribute("href") || "").replace("#", "");

      if (href === "proyectos") speak("projects");
      else if (href === "stack") speak("stack");
      else if (href === "roadmap") speak("roadmap");
      else speak("default");
    });
  });

  const sectionMessages = new Map([
    ["sobre-mi", "about"],
    ["proyectos", "projects"],
    ["stack", "stack"],
    ["roadmap", "roadmap"],
    ["contacto", "contact"]
  ]);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const key = sectionMessages.get(visible.target.id);
      if (key && !panel.hidden) speak(key);
    },
    {
      threshold: [0.25, 0.45, 0.7]
    }
  );

  sectionMessages.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  window.addEventListener("load", () => {
    if (greetingShown) return;

    setTimeout(() => {
      if (!sessionStorage.getItem("mm-panda-greeted")) {
        greetingShown = true;
        setOpen(true);
        speak("welcome");
        sessionStorage.setItem("mm-panda-greeted", "1");

        setTimeout(() => {
          if (!userInteracted) setOpen(false);
        }, 6500);
      }
    }, 900);
  });
})();
