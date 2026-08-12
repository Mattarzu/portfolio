(() => {
  const root = document.documentElement;
  root.classList.add("copy-v6");

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setHTML = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = value;
  };

  const bilingual = (es, en) =>
    `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;

  ready(() => {
    // Hero: concrete language, no generic AI/startup slogans.
    setText(
      ".hero .overline [data-lang='es']",
      "ALLFICTION SOFTWARE · PRODUCTOS, IA E INFRAESTRUCTURA",
    );
    setText(
      ".hero .overline [data-lang='en']",
      "ALLFICTION SOFTWARE · PRODUCTS, AI & INFRASTRUCTURE",
    );

    setHTML(
      ".hero h1 [data-lang='es']",
      "Software para problemas<br><em>que no entran en una plantilla.</em>",
    );
    setHTML(
      ".hero h1 [data-lang='en']",
      "Software for problems<br><em>that do not fit a template.</em>",
    );

    setText(
      ".hero-lead [data-lang='es']",
      "Primero entendemos qué tiene que funcionar. Después elegimos la tecnología: una app, IA, automatización, datos, 3D o infraestructura. Lo importante es que llegue a producción y sirva.",
    );
    setText(
      ".hero-lead [data-lang='en']",
      "First we work out what has to function. Then we choose the technology: an app, AI, automation, data, 3D or infrastructure. What matters is that it reaches production and does the job.",
    );

    setText(".hero-actions .button-primary [data-lang='es']", "Ver proyectos");
    setText(".hero-actions .button-primary [data-lang='en']", "See projects");
    setText(".hero-actions .button-ghost [data-lang='es']", "Preguntarle a AF");
    setText(".hero-actions .button-ghost [data-lang='en']", "Ask AF");

    const trustItems = document.querySelectorAll(".hero-trust li");
    const trustCopy = ["Apps en producción", "IA con un propósito", "Infraestructura propia"];
    trustItems.forEach((item, index) => {
      if (trustCopy[index]) item.textContent = trustCopy[index];
    });

    setText(".stage-topbar > span:first-child", "ALLFICTION / PROYECTOS");
    setText(".stage-label small", "SOFTWARE EN FUNCIONAMIENTO");
    setText(".stage-label strong [data-lang='es']", "Producto · IA · Sistemas");
    setText(".stage-label strong [data-lang='en']", "Product · AI · Systems");

    const modules = document.querySelectorAll(".stage-modules > div");
    const moduleCopy = [
      ["01 / MOTORATLAS 3D", "Diagnóstico automotor · 2D/3D"],
      ["02 / MOLLCHEF", "Recetas · escaneo · cocina guiada"],
      ["03 / MATTMESH", "Nodos · voz · automatización"],
    ];
    modules.forEach((module, index) => {
      if (!moduleCopy[index]) return;
      const small = module.querySelector("small");
      const strong = module.querySelector("strong");
      if (small) small.textContent = moduleCopy[index][0];
      if (strong) strong.textContent = moduleCopy[index][1];
    });

    setText(".stage-ai-card small", "AF INTELLIGENCE");
    setText(
      ".stage-ai-card strong [data-lang='es']",
      "Preguntá qué hicimos y cómo está construido",
    );
    setText(
      ".stage-ai-card strong [data-lang='en']",
      "Ask what we built and how it works",
    );

    // Selected work.
    setHTML(
      "#ingenieria-reciente .overline",
      `01 / ${bilingual("Proyectos recientes", "Recent projects")}`,
    );
    setHTML(
      "#ingenieria-reciente .section-heading h2 [data-lang='es']",
      "Cosas que ya<br><em>funcionan.</em>",
    );
    setHTML(
      "#ingenieria-reciente .section-heading h2 [data-lang='en']",
      "Things that already<br><em>work.</em>",
    );
    setText(
      "#ingenieria-reciente .section-intro [data-lang='es']",
      "No son conceptos ni demos armadas para la portada. Son sistemas que tuvieron que resolver datos, estados, errores, despliegues y usuarios reales.",
    );
    setText(
      "#ingenieria-reciente .section-intro [data-lang='en']",
      "These are not concepts or demos made for a homepage. They are systems that had to deal with data, state, errors, deployment and real users.",
    );

    // Qivox cinematic scene.
    setHTML(
      ".v5-cinema-head .overline",
      `02.5 / ${bilingual("Qivox por dentro", "Inside Qivox")}`,
    );
    setHTML(
      ".v5-cinema-title-row h2",
      bilingual(
        "La pantalla también<br><em>forma parte del sistema.</em>",
        "The screen is also<br><em>part of the system.</em>",
      ),
    );
    setHTML(
      ".v5-cinema-title-row > p",
      bilingual(
        "Estas son capturas reales de Qivox. La web y el teléfono comparten datos y lógica, pero cada interfaz está pensada para el contexto en el que se usa.",
        "These are real Qivox screens. Web and phone share data and logic, but each interface is designed for the context in which it is used.",
      ),
    );
    setText(".v5-browser-bar b", "PRODUCTO REAL");
    setText(".v5-cinema-badge span", "WEB + MÓVIL / MISMO SISTEMA");
    setHTML(
      ".v5-cinema-copy h3",
      bilingual("Web y móvil.<br>El mismo sistema.", "Web and mobile.<br>The same system."),
    );
    setHTML(
      ".v5-cinema-copy > p",
      bilingual(
        "Qivox maneja sedes, membresías, datos persistentes y operaciones en tiempo real sin separar la experiencia del sistema que la sostiene.",
        "Qivox handles sites, memberships, persistent data and real-time operations without separating the experience from the system behind it.",
      ),
    );
    const cinemaLink = document.querySelector(".v5-cinema-copy .text-link");
    if (cinemaLink) {
      cinemaLink.innerHTML = `${bilingual("Ver cómo está hecho", "See how it is built")} <span>↗</span>`;
    }

    // What we build: explain problem classes rather than sell capabilities.
    setHTML(
      ".v5-build-intro .overline",
      `03 / ${bilingual("Lo que hacemos", "What we do")}`,
    );
    setHTML(
      ".v5-build-intro h2",
      bilingual(
        "Problemas que sabemos<br><em>resolver.</em>",
        "Problems we know<br><em>how to solve.</em>",
      ),
    );
    setHTML(
      ".v5-build-intro > p",
      bilingual(
        "A veces hace falta una API. Otras, visión, 3D, una cola de trabajos o una PWA. Elegimos la pieza por el problema, no al revés.",
        "Sometimes the answer is an API. Other times it is vision, 3D, a job queue or a PWA. We choose the piece for the problem, not the other way around.",
      ),
    );
    const buildIndex = document.querySelector(".v5-build-index small");
    if (buildIndex) buildIndex.innerHTML = bilingual("áreas de trabajo", "areas of work");

    const cards = document.querySelectorAll(".v5-build-card");
    const cardCopy = [
      ["IA aplicada", "Applied AI", "Agentes · RAG · multimodal · routing", "MotorAtlas · MollChef · PolyLLM"],
      ["Aplicaciones completas", "Full applications", "Frontend · APIs · realtime · auth", "Qivox · MollChef"],
      ["Visión y extracción", "Vision and extraction", "OCR · imágenes · documentos", "Escaneo de recetas · flujos documentales"],
      ["Interfaces 3D", "3D interfaces", "Three.js · visualización técnica · guía", "MotorAtlas 3D"],
      ["Automatización", "Automation", "Agentes · workflows · colas · orquestación", "MattMesh · AgentBridge"],
      ["Datos y estado", "Data and state", "PostgreSQL · Redis · modelos · auditoría", "Crypto Risk · MotorAtlas"],
      ["Infraestructura", "Infrastructure", "Linux · contenedores · redes · CI/CD", "AWS · Tailscale · observabilidad"],
      ["Mobile y PWA", "Mobile and PWA", "Touch · responsive · offline cuando hace falta", "MollChef · Qivox"],
    ];
    cards.forEach((card, index) => {
      const copy = cardCopy[index];
      if (!copy) return;
      const [esTitle, enTitle, detail, projects] = copy;
      const title = card.querySelector("h3");
      const paragraph = card.querySelector("p");
      const small = card.querySelector("small");
      if (title) title.innerHTML = bilingual(esTitle, enTitle);
      if (paragraph) paragraph.textContent = detail;
      if (small) small.textContent = projects;
    });

    // Principle: specific enough that it could only belong to this portfolio.
    setText(".v5-statement .overline", "ALLFICTION / CÓMO TRABAJAMOS");
    setHTML(
      ".v5-statement h2",
      bilingual(
        "No usamos la misma receta<br><em>para todo.</em>",
        "We do not use the same recipe<br><em>for everything.</em>",
      ),
    );
    setHTML(
      ".v5-statement-inner > p:last-child",
      bilingual(
        "Un diagnóstico automotor, una cocina guiada y un sistema distribuido no tienen por qué verse ni comportarse igual. Primero manda el problema.",
        "An automotive diagnostic tool, a guided kitchen and a distributed system should not look or behave the same. The problem comes first.",
      ),
    );

    // Technical section and contact.
    setHTML(
      "#capacidades .section-heading h2 [data-lang='es']",
      "Del navegador<br><em>al servidor.</em>",
    );
    setHTML(
      "#capacidades .section-heading h2 [data-lang='en']",
      "From the browser<br><em>to the server.</em>",
    );

    setHTML(
      "#contacto h2 [data-lang='es']",
      "Contame qué querés<br><em>hacer.</em>",
    );
    setHTML(
      "#contacto h2 [data-lang='en']",
      "Tell me what you want<br><em>to make.</em>",
    );
    setText(
      "#contacto .contact-side > p [data-lang='es']",
      "Con el objetivo, quién lo va a usar y qué restricción importa, alcanza para empezar. El resto se diseña.",
    );
    setText(
      "#contacto .contact-side > p [data-lang='en']",
      "The goal, who will use it and the constraint that matters are enough to start. The rest can be designed.",
    );
  });
})();
