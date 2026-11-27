// Local illustration of the Crypto Risk fast path.
// health factor = (collateral × liquidation threshold) / debt
// Bands: >= 1.50 safe, >= 1.00 watch, below 1.00 liquidate.
// Same inputs always return the same decision. No network.

(() => {
  const SAFE = "safe";
  const WATCH = "watch";
  const LIQUIDATE = "liquidate";
  const NO_DEBT = "no-debt";
  const INVALID = "invalid";

  function parseAmount(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const text = String(value ?? "")
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(text)) return null;

    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function evaluatePosition({ collateral, debt, threshold }) {
    const collateralUsd = parseAmount(collateral);
    const debtUsd = parseAmount(debt);
    const thresholdValue = parseAmount(threshold);
    const invalid = {
      state: INVALID,
      factor: null,
      factorText: "—",
    };

    if (
      collateralUsd === null ||
      debtUsd === null ||
      thresholdValue === null ||
      collateralUsd < 0 ||
      debtUsd < 0 ||
      collateralUsd > 1_000_000_000 ||
      debtUsd > 1_000_000_000 ||
      thresholdValue < 0.01 ||
      thresholdValue > 1
    ) {
      return invalid;
    }

    const thresholdHundredths = Math.round(thresholdValue * 100);
    if (thresholdHundredths < 1 || thresholdHundredths > 100) return invalid;

    const collateralCents = Math.round(collateralUsd * 100);
    const debtCents = Math.round(debtUsd * 100);

    if (debtCents === 0) {
      if (collateralCents === 0) return invalid;
      return {
        state: NO_DEBT,
        factor: Number.POSITIVE_INFINITY,
        factorText: "∞",
        collateralCents,
        debtCents,
        thresholdHundredths,
      };
    }

    const factorTimes100 = Math.round((collateralCents * thresholdHundredths) / debtCents);
    let state = LIQUIDATE;
    if (factorTimes100 >= 150) state = SAFE;
    else if (factorTimes100 >= 100) state = WATCH;

    return {
      state,
      factor: factorTimes100 / 100,
      factorText: (factorTimes100 / 100).toFixed(2),
      collateralCents,
      debtCents,
      thresholdHundredths,
      factorTimes100,
    };
  }

  const api = { evaluatePosition, parseAmount, SAFE, WATCH, LIQUIDATE, NO_DEBT, INVALID };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  const demo = typeof document === "undefined" ? null : document.getElementById("risk-factor-demo");
  if (!demo) return;

  const collateralInput = demo.querySelector("#risk-demo-collateral");
  const debtInput = demo.querySelector("#risk-demo-debt");
  const thresholdInput = demo.querySelector("#risk-demo-threshold");
  const factorValue = demo.querySelector("[data-factor-value]");
  const decisionNode = demo.querySelector("[data-decision]");
  const expressionNode = demo.querySelector("[data-expression]");
  const replayNode = demo.querySelector("[data-replay]");
  const presets = [...demo.querySelectorAll("[data-preset]")];

  const copy = {
    "es-AR": {
      safe: "SAFE · por encima del margen de vigilancia (1,50).",
      watch: "VIGILANCIA · entre 1,00 y 1,50, todavía sin liquidar.",
      liquidate: "LIQUIDAR · health factor bajo 1,00.",
      "no-debt": "SAFE · no hay deuda que liquidar.",
      invalid: "Entrada inválida. Colateral y deuda entre 0 y 1.000.000.000; umbral entre 0,01 y 1.",
      replay: "Misma decisión al repetir el tick.",
      expression(result, format) {
        if (result.state === INVALID) return "";
        const threshold = (result.thresholdHundredths / 100).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const collateral = format(result.collateralCents / 100);
        const debt = format(result.debtCents / 100);
        if (result.state === NO_DEBT) return `${collateral} × ${threshold} / ${debt} = ∞`;
        return `${collateral} × ${threshold} / ${debt} = ${result.factorText.replace(".", ",")}`;
      },
    },
    "en-GB": {
      safe: "SAFE · above the watch margin (1.50).",
      watch: "WATCH · between 1.00 and 1.50, not yet liquidatable.",
      liquidate: "LIQUIDATE · health factor below 1.00.",
      "no-debt": "SAFE · there is no debt to liquidate.",
      invalid: "Invalid input. Collateral and debt from 0 to 1,000,000,000; threshold from 0.01 to 1.",
      replay: "Same decision when the tick is repeated.",
      expression(result, format) {
        if (result.state === INVALID) return "";
        const threshold = (result.thresholdHundredths / 100).toLocaleString("en-GB", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const collateral = format(result.collateralCents / 100);
        const debt = format(result.debtCents / 100);
        if (result.state === NO_DEBT) return `${collateral} × ${threshold} / ${debt} = ∞`;
        return `${collateral} × ${threshold} / ${debt} = ${result.factorText}`;
      },
    },
  };

  function language() {
    return String(document.documentElement.lang || "").toLowerCase().startsWith("en")
      ? "en-GB"
      : "es-AR";
  }

  function formatMoney(languageCode, amount) {
    return new Intl.NumberFormat(languageCode, {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  let showReplay = false;

  function readResult() {
    return evaluatePosition({
      collateral: collateralInput.value,
      debt: debtInput.value,
      threshold: thresholdInput.value,
    });
  }

  function render() {
    const lang = language();
    const text = copy[lang];
    const result = readResult();
    const invalid = result.state === INVALID;

    factorValue.textContent = formatFactor(lang, result);
    decisionNode.dataset.state = result.state;
    decisionNode.textContent = text[result.state];
    expressionNode.textContent = text.expression(result, (amount) => formatMoney(lang, amount));
    replayNode.hidden = !showReplay || invalid;
    replayNode.textContent = showReplay && !invalid ? text.replay : "";

    collateralInput.setAttribute(
      "aria-invalid",
      String(amountInvalid(collateralInput.value, 0, 1_000_000_000)),
    );
    debtInput.setAttribute("aria-invalid", String(amountInvalid(debtInput.value, 0, 1_000_000_000)));
    thresholdInput.setAttribute("aria-invalid", String(amountInvalid(thresholdInput.value, 0.01, 1)));

    for (const preset of presets) {
      const matches =
        sameAmount(preset.dataset.collateral, collateralInput.value) &&
        sameAmount(preset.dataset.debt, debtInput.value) &&
        sameAmount(preset.dataset.threshold, thresholdInput.value);
      preset.setAttribute("aria-pressed", String(matches));
      preset.classList.toggle("is-selected", matches);
    }
  }

  function sameAmount(left, right) {
    const a = parseAmount(left);
    const b = parseAmount(right);
    return a !== null && b !== null && Math.round(a * 100) === Math.round(b * 100);
  }

  function amountInvalid(value, minimum, maximum) {
    const parsed = parseAmount(value);
    if (parsed === null) return true;
    return parsed < minimum || parsed > maximum;
  }

  function formatFactor(languageCode, result) {
    if (result.state === INVALID) return "—";
    if (result.state === NO_DEBT) return "∞";
    return (result.factorTimes100 / 100).toLocaleString(languageCode, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  demo.addEventListener("submit", (event) => {
    event.preventDefault();
    showReplay = false;
    render();
  });

  demo.addEventListener("input", () => {
    showReplay = false;
    render();
  });

  for (const preset of presets) {
    preset.addEventListener("click", () => {
      collateralInput.value = preset.dataset.collateral;
      debtInput.value = preset.dataset.debt;
      thresholdInput.value = preset.dataset.threshold;
      showReplay = false;
      render();
    });
  }

  demo.querySelector("[data-replay-tick]").addEventListener("click", () => {
    const before = readResult();
    const again = readResult();
    showReplay =
      before.state === again.state &&
      before.factorText === again.factorText &&
      before.state !== INVALID;
    render();
  });

  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  render();
})();
