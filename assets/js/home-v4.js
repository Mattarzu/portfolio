(() => {
  const root = document.documentElement;
  root.classList.add("design-v4");

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setHTML = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = value;
  };

  // Hero: brand-led positioning rather than a conventional personal-portfolio intro.
  setText(".hero .overline [data-lang='es']", "ALLFICTION SOFTWARE · AI / PRODUCT / SYSTEMS");
  setText(".hero .overline [data-lang='en']", "ALLFICTION SOFTWARE · AI / PRODUCT / SYSTEMS");

  setHTML(
    ".hero h1 [data-lang='es']",
    "Construimos software<br><em>que piensa.</em>",
  );
  setHTML(
    ".hero h1 [data-lang='en']",
    "We build software<br><em>that thinks.</em>",
  );

  setText(
    ".hero-lead [data-lang='es']",
    "Diseñamos productos digitales, sistemas de IA e infraestructura que resuelven problemas reales: desde la arquitectura hasta producción.",
  );
  setText(
    ".hero-lead [data-lang='en']",
    "We design digital products, AI systems and infrastructure that solve real problems — from architecture through production.",
  );

  setText(".hero-actions .button-primary [data-lang='es']", "Explorar sistemas");
  setText(".hero-actions .button-primary [data-lang='en']", "Explore systems");
  setText(".hero-actions .button-ghost [data-lang='es']", "Hablar con AF Intelligence");
  setText(".hero-actions .button-ghost [data-lang='en']", "Talk to AF Intelligence");

  const trustItems = document.querySelectorAll(".hero-trust li");
  const trustCopy = ["AI Systems", "Full Stack Products", "Infrastructure"];
  trustItems.forEach((item, index) => {
    if (trustCopy[index]) item.textContent = trustCopy[index];
  });

  // Floating product signals inside the hero stage.
  setText(".stage-topbar > span:first-child", "ALLFICTION / LIVE SYSTEMS");
  setText(".stage-label small", "ENGINEERING STUDIO");
  setText(".stage-label strong [data-lang='es']", "Engineering × AI × Product");
  setText(".stage-label strong [data-lang='en']", "Engineering × AI × Product");

  const stageModules = document.querySelectorAll(".stage-modules > div");
  const modules = [
    ["01 / MOTORATLAS 3D", "Diagnostic engine · 2D/3D"],
    ["02 / MOLLCHEF", "Multimodal AI · Guided cooking"],
    ["03 / MATTMESH", "Distributed AI · Infrastructure"],
  ];

  stageModules.forEach((module, index) => {
    if (!modules[index]) return;
    const [label, description] = modules[index];
    const small = module.querySelector("small");
    const strong = module.querySelector("strong");
    if (small) small.textContent = label;
    if (strong) strong.textContent = description;
  });

  setText(".stage-ai-card small", "AF INTELLIGENCE / LIVE");
  setText(
    ".stage-ai-card strong [data-lang='es']",
    "Preguntá por arquitectura, proyectos o experiencia",
  );
  setText(
    ".stage-ai-card strong [data-lang='en']",
    "Ask about architecture, projects or experience",
  );

  // First portfolio section: frame projects as selected systems.
  const recentHeading = document.querySelector("#ingenieria-reciente .section-heading");
  if (recentHeading) {
    setHTML(
      "#ingenieria-reciente .overline",
      "01 / <span data-lang='es'>Sistemas seleccionados</span><span data-lang='en'>Selected systems</span>",
    );
    setHTML(
      "#ingenieria-reciente .section-heading h2 [data-lang='es']",
      "Productos reales.<br>Ingeniería visible.",
    );
    setHTML(
      "#ingenieria-reciente .section-heading h2 [data-lang='en']",
      "Real products.<br>Visible engineering.",
    );
    setText(
      "#ingenieria-reciente .section-intro [data-lang='es']",
      "Una selección de sistemas construidos para uso real. Producto, IA, modelado técnico e infraestructura en una misma disciplina.",
    );
    setText(
      "#ingenieria-reciente .section-intro [data-lang='en']",
      "A selection of systems built for real use. Product, AI, technical modelling and infrastructure as one discipline.",
    );
  }

  function syncV4Accessibility() {
    const english = String(root.lang || "").toLowerCase().startsWith("en");
    const stage = document.querySelector(".hero-stage");
    if (stage) {
      stage.setAttribute(
        "aria-label",
        english ? "ALLFICTION live systems canvas" : "Canvas de sistemas activos de ALLFICTION",
      );
    }
  }

  syncV4Accessibility();
  document.addEventListener("allfiction:language", syncV4Accessibility);
})();
