function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ACTION_TERMS = [
  "necesito", "quiero", "quisiera", "busco", "armar", "crear", "hacer",
  "desarrollar", "construir", "automatizar", "integrar", "implementar",
  "need", "want", "looking for", "build", "create", "develop", "automate",
  "integrate", "implement",
];

const PROJECT_TERMS = [
  "pagina web", "sitio web", "website", "web app", "aplicacion", "app",
  "sistema", "software", "plataforma", "ecommerce", "e-commerce",
  "tienda online", "dashboard", "chatbot", "automatizacion", "automation",
  "workflow", "proceso", "process", "integracion", "integration", "api",
  "backend", "frontend", "mobile", "pwa", "producto digital", "digital product",
];

const DIRECT_PROJECT_PHRASES = [
  "tengo una idea", "evaluar una idea", "tengo un proceso manual",
  "quiero una pagina web", "necesito una pagina web", "quiero un sitio web",
  "necesito un sitio web", "quiero una app", "necesito una app",
  "i have an idea", "evaluate an idea", "i have a manual process",
  "i need a website", "i want a website", "i need an app", "i want an app",
];

export function detectProjectIntent(message) {
  const text = normalize(message);
  if (!text) return { matched: false, score: 0, reason: "empty" };

  const direct = DIRECT_PROJECT_PHRASES.find((phrase) => text.includes(phrase));
  if (direct) {
    return {
      matched: true,
      score: 3,
      reason: "direct-project-intent",
      phrase: direct,
    };
  }

  const action = ACTION_TERMS.find((term) => text.includes(term));
  const target = PROJECT_TERMS.find((term) => text.includes(term));

  if (action && target) {
    return {
      matched: true,
      score: 2,
      reason: "action-plus-project-target",
      action,
      target,
    };
  }

  return { matched: false, score: 0, reason: "informational-or-unknown" };
}

export function projectHandoffCopy(locale) {
  const english = String(locale || "").toLowerCase().startsWith("en");
  return english
    ? "This sounds like a project need rather than a portfolio question. I’ll route it to AF Agent so it can turn the idea into a concrete brief with human approval before any form change."
    : "Esto parece una necesidad de proyecto, no una consulta informativa del portfolio. La voy a derivar a AF Agent para convertirla en un brief concreto, con aprobación humana antes de cualquier cambio en el formulario.";
}
