(() => {
  const root = document.documentElement;
  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn();

  ready(async () => {
    if (document.querySelector("[data-af15-root]")) return;
    const lab = document.querySelector("#automation-lab .shell");
    if (!lab) return;

    const bi = (es, en) => `<span data-lang="es">${es}</span><span data-lang="en">${en}</span>`;
    const section = document.createElement("section");
    section.className = "af15-reliability";
    section.dataset.af15Root = "reliability";
    section.innerHTML = `
      <header class="af15-head">
        <div><p class="overline">06 / RELIABILITY</p><h3>${bi(
          "No alcanza con que el agente responda.<br><em>Tiene que seguir pasando sus gates.</em>",
          "It is not enough for the agent to respond.<br><em>It has to keep passing its gates.</em>"
        )}</h3></div>
        <p>${bi(
          "Suite determinística sobre routing, safety, retrieval, tools y aprobación humana.",
          "Deterministic suite covering routing, safety, retrieval, tools and human approval."
        )}</p>
      </header>
      <div class="af15-panel" data-af15-panel><div class="af15-loading">LOADING VERIFIED EVALS…</div></div>
      <footer class="af15-note">
        <span>${bi(
          "No es «accuracy del LLM»: son regresiones determinísticas del sistema alrededor del modelo.",
          "This is not «LLM accuracy»: these are deterministic regressions for the system around the model."
        )}</span>
        <a href="./assets/data/af-reliability.json" target="_blank" rel="noopener noreferrer">RAW JSON ↗</a>
      </footer>`;
    lab.appendChild(section);

    const panel = section.querySelector("[data-af15-panel]");
    const english = () => String(root.lang || "").toLowerCase().startsWith("en");

    function render(data) {
      panel.textContent = "";
      const hero = document.createElement("article");
      hero.className = "af15-score";
      hero.innerHTML = `<div><span>AF / EVAL SUITE</span><strong>${data.passed}<small> / ${data.total}</small></strong><b class="${data.failed === 0 ? "is-pass" : "is-fail"}">${data.failed === 0 ? "PASS" : "REGRESSION"}</b></div>
        <dl><div><dt>FINGERPRINT</dt><dd>${data.fingerprint}</dd></div><div><dt>SCOPE</dt><dd>${data.scope}</dd></div><div><dt>SUITE</dt><dd>v${data.suiteVersion}</dd></div></dl>`;
      panel.appendChild(hero);

      const categories = document.createElement("div");
      categories.className = "af15-categories";
      Object.values(data.categories || {}).forEach((value) => {
        const card = document.createElement("article");
        card.innerHTML = `<span>${value.label}</span><strong>${value.passed}/${value.total}</strong><small>${value.failed === 0 ? "PASS" : `${value.failed} FAIL`}</small>`;
        if (value.failed === 0) card.classList.add("is-pass");
        categories.appendChild(card);
      });
      panel.appendChild(categories);

      const gates = document.createElement("div");
      gates.className = "af15-gates";
      const rows = [
        ["APPROVAL BYPASS", data.gates?.approvalBypass ?? "—"],
        ["TOOL POLICY VIOLATIONS", data.gates?.toolPolicyViolations ?? "—"],
        ["SAFETY REGRESSIONS", data.gates?.safetyRegressions ?? "—"],
        [english() ? "LIVE USER PROMPTS IN DATASET" : "PROMPTS REALES EN DATASET", data.claims?.liveUserPromptsInDataset ? "YES" : "NO"],
      ];
      for (const [label, value] of rows) {
        const row = document.createElement("div");
        const key = document.createElement("span");
        const val = document.createElement("b");
        key.textContent = label;
        val.textContent = String(value);
        row.append(key, val);
        gates.appendChild(row);
      }
      panel.appendChild(gates);
    }

    try {
      const response = await fetch("./assets/data/af-reliability.json?v=20260813-v15", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || typeof data?.total !== "number") throw new Error("invalid");
      render(data);
      root.classList.add("design-v15");
    } catch {
      panel.innerHTML = `<p class="af15-unavailable">${bi(
        "El artefacto de reliability no está disponible. El panel no inventa métricas.",
        "The reliability artifact is unavailable. This panel does not fabricate metrics."
      )}</p>`;
    }
  });
})();
