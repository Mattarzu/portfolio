(() => {
  const fmt = new Intl.NumberFormat("es-AR");

  function statusLabel(status) {
    if (status === "ok") return "OK";
    if (status === "attention") return "Atención";
    return status || "Sin datos";
  }

  function setText(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  async function loadData(root) {
    const source = root.dataset.redwatchSource || "./assets/data/redwatch-public.json";
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar redwatch-public.json");
    return response.json();
  }

  function render(root, data) {
    const summary = data.summary || {};
    const scans = Array.isArray(data.recent_scans) ? data.recent_scans : [];
    const last = scans[0];
    const privacy = data.privacy || {};

    root.dataset.redwatchStatus = data.status || "unknown";

    setText(root, "[data-rw-status]", `${statusLabel(data.status)} · ${data.os || "Linux"} · ${data.engine || "ClamAV"}`);
    setText(root, "[data-rw-files]", fmt.format(summary.total_files_scanned || 0));
    setText(root, "[data-rw-infected]", fmt.format(summary.total_infected_count || 0));
    setText(root, "[data-rw-quarantined]", fmt.format(summary.total_quarantined_count || 0));
    setText(root, "[data-rw-scans]", fmt.format(summary.total_scans_exported || 0));

    setText(
      root,
      "[data-rw-last]",
      last
        ? `Último scan: ${statusLabel(last.status)} · perfil ${last.profile} · ${fmt.format(last.files_scanned || 0)} archivos · ${fmt.format(last.infected_count || 0)} detecciones · iniciado ${formatDate(last.started_at)}.`
        : "Todavía no hay escaneos exportados."
    );

    setText(
      root,
      "[data-rw-privacy]",
      `Privacidad: rutas sanitizadas ${privacy.paths_sanitized ? "sí" : "no"} · hashes incluidos ${privacy.hashes_included ? "sí" : "no"} · nombres originales incluidos ${privacy.original_file_names_included ? "sí" : "no"} · rutas de cuarentena incluidas ${privacy.quarantine_paths_included ? "sí" : "no"}.`
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-redwatch-panel]").forEach(async (root) => {
      try {
        render(root, await loadData(root));
      } catch (error) {
        root.dataset.redwatchStatus = "error";
        setText(root, "[data-rw-status]", "Error cargando Redwatch");
        setText(root, "[data-rw-last]", error.message);
      }
    });
  });
})();
