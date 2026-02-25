const revealNodes = document.querySelectorAll(".reveal");
const statNodes = document.querySelectorAll(".stat-value");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector("#main-nav");
const copyBtn = document.querySelector("#copy-email");
const copyHint = document.querySelector("#copy-hint");
const yearNode = document.querySelector("#year");

function animateStat(node) {
  const target = Number.parseInt(node.dataset.count || "0", 10);
  const suffix = node.dataset.suffix || "";
  const duration = 850;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    node.textContent = `${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      if (entry.target.classList.contains("stat-value")) {
        animateStat(entry.target);
      }
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

revealNodes.forEach((node) => observer.observe(node));
statNodes.forEach((node) => observer.observe(node));

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (copyBtn && copyHint) {
  copyBtn.addEventListener("click", async () => {
    const email = "razzer.howa@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      copyHint.textContent = "Email copiado al portapapeles.";
    } catch {
      copyHint.textContent = `No se pudo copiar. Escribe a: ${email}`;
    }

    setTimeout(() => {
      copyHint.textContent = "";
    }, 2200);
  });
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
