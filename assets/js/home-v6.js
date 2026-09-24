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
    const trustCopy = [
      ["Apps en producción", "Production apps"],
      ["IA con un propósito", "AI with a purpose"],
      ["Infraestructura propia", "Owned infrastructure"],
    ];
    trustItems.forEach((item, index) => {
      if (trustCopy[index]) {
        item.innerHTML = bilingual(trustCopy[index][0], trustCopy[index][1]);
      }
    });

    setHTML(
      ".stage-topbar > span:first-child",
      bilingual("ALLFICTION / PROYECTOS", "ALLFICTION / PROJECTS"),
    );
    setHTML(
      ".stage-label small",
      bilingual("SOFTWARE EN FUNCIONAMIENTO", "WORKING SOFTWARE"),
    );
    setText(".stage-label strong [data-lang='es']", "Producto · IA · Sistemas");
    setText(".stage-label strong [data-lang='en']", "Product · AI · Systems");

    const modules = document.querySelectorAll(".stage-modules > div");
    const moduleCopy = [
      ["01 / MOTORATLAS 3D", "Diagnóstico automotor · 2D/3D", "Automotive diagnostics · 2D/3D"],
      ["02 / MOLLCHEF", "Recetas · escaneo · cocina guiada", "Recipes · scanning · guided cooking"],
      ["03 / MATTMESH", "Nodos · voz · automatización", "Nodes · voice · automation"],
    ];
    modules.forEach((module, index) => {
      if (!moduleCopy[index]) return;
      const small = module.querySelector("small");
      const strong = module.querySelector("strong");
      if (small) small.textContent = moduleCopy[index][0];
      if (strong) strong.innerHTML = bilingual(moduleCopy[index][1], moduleCopy[index][2]);
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
    setHTML(".v5-browser-bar b", bilingual("PRODUCTO REAL", "REAL PRODUCT"));
    setHTML(
      ".v5-cinema-badge span",
      bilingual("WEB + MÓVIL / MISMO SISTEMA", "WEB + MOBILE / SAME SYSTEM"),
    );
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
      {
        esTitle: "IA aplicada",
        enTitle: "Applied AI",
        esDetail: "Agentes · RAG · multimodal · routing",
        enDetail: "Agents · RAG · multimodal · routing",
        esProjects: "MotorAtlas · MollChef · PolyLLM",
        enProjects: "MotorAtlas · MollChef · PolyLLM",
      },
      {
        esTitle: "Aplicaciones completas",
        enTitle: "Full applications",
        esDetail: "Frontend · APIs · realtime · auth",
        enDetail: "Frontend · APIs · realtime · auth",
        esProjects: "Qivox · MollChef",
        enProjects: "Qivox · MollChef",
      },
      {
        esTitle: "Visión y extracción",
        enTitle: "Vision and extraction",
        esDetail: "OCR · imágenes · documentos",
        enDetail: "OCR · images · documents",
        esProjects: "Escaneo de recetas · flujos documentales",
        enProjects: "Recipe scanning · document workflows",
      },
      {
        esTitle: "Interfaces 3D",
        enTitle: "3D interfaces",
        esDetail: "Three.js · visualización técnica · guía",
        enDetail: "Three.js · technical visualization · guidance",
        esProjects: "MotorAtlas 3D",
        enProjects: "MotorAtlas 3D",
      },
      {
        esTitle: "Automatización",
        enTitle: "Automation",
        esDetail: "Agentes · workflows · colas · orquestación",
        enDetail: "Agents · workflows · queues · orchestration",
        esProjects: "MattMesh · AgentBridge",
        enProjects: "MattMesh · AgentBridge",
      },
      {
        esTitle: "Datos y estado",
        enTitle: "Data and state",
        esDetail: "PostgreSQL · Redis · modelos · auditoría",
        enDetail: "PostgreSQL · Redis · models · audit",
        esProjects: "Crypto Risk · MotorAtlas",
        enProjects: "Crypto Risk · MotorAtlas",
      },
      {
        esTitle: "Infraestructura",
        enTitle: "Infrastructure",
        esDetail: "Linux · contenedores · redes · CI/CD",
        enDetail: "Linux · containers · networks · CI/CD",
        esProjects: "AWS · Tailscale · observabilidad",
        enProjects: "AWS · Tailscale · observability",
      },
      {
        esTitle: "Mobile y PWA",
        enTitle: "Mobile and PWA",
        esDetail: "Touch · responsive · offline cuando hace falta",
        enDetail: "Touch · responsive · offline when needed",
        esProjects: "MollChef · Qivox",
        enProjects: "MollChef · Qivox",
      },
    ];
    cards.forEach((card, index) => {
      const copy = cardCopy[index];
      if (!copy) return;
      const title = card.querySelector("h3");
      const paragraph = card.querySelector("p");
      const small = card.querySelector("small");
      if (title) title.innerHTML = bilingual(copy.esTitle, copy.enTitle);
      if (paragraph) paragraph.innerHTML = bilingual(copy.esDetail, copy.enDetail);
      if (small) {
        small.innerHTML = copy.esProjects === copy.enProjects
          ? copy.esProjects
          : bilingual(copy.esProjects, copy.enProjects);
      }
    });

    // Principle: specific enough that it could only belong to this portfolio.
    setHTML(
      ".v5-statement .overline",
      bilingual("ALLFICTION / CÓMO TRABAJAMOS", "ALLFICTION / HOW WE WORK"),
    );
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
