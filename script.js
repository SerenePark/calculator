(function () {
  const LS_CREDITS = "calc_ent_credits";
  const LS_SUB_UNTIL = "calc_ent_sub_until";
  const LS_THEME = "calc_theme";
  const DEFAULT_THEME = "minimal";
  const THEME_IDS = ["minimal", "pink-cat", "space", "parents", "jesus"];

  const display = document.getElementById("display");
  const keys = document.getElementById("keys");
  const entStatus = document.getElementById("ent-status");
  const pricingModal = document.getElementById("pricing-modal");
  const pricingBackdrop = document.getElementById("pricing-backdrop");
  const btnBuyPack = document.getElementById("btn-buy-pack");
  const btnBuySub = document.getElementById("btn-buy-sub");
  const btnPricingClose = document.getElementById("btn-pricing-close");
  const preCheckoutAd = document.getElementById("pre-checkout-ad");
  const preCheckoutAdImg = document.getElementById("pre-checkout-ad-img");
  const preCheckoutAdClose = document.getElementById("pre-checkout-ad-close");
  const resultModal = document.getElementById("result-modal");
  const resultBackdrop = document.getElementById("result-backdrop");
  const btnResultClose = document.getElementById("btn-result-close");
  const resultValueEl = document.getElementById("result-value");

  const pricePack = window.STRIPE_PRICE_PACK_5;
  const priceSub = window.STRIPE_PRICE_SUB_MONTHLY;
  const apiBase = typeof window.STRIPE_API_BASE === "string" ? window.STRIPE_API_BASE : "";

  function resolveAssetUrl(relPath) {
    var cur = typeof document !== "undefined" && document.currentScript && document.currentScript.src;
    if (!cur) {
      var el = document.querySelector('script[src*="script.js"]');
      cur = el && el.src;
    }
    if (cur) {
      try {
        return new URL(relPath, cur).href;
      } catch (ignore) {}
    }
    try {
      return new URL(relPath, window.location.href).href;
    } catch (e2) {
      return relPath;
    }
  }

  const AD_IMG_KO = resolveAssetUrl("assets/ad-jumping-cat-ko.png");
  const AD_IMG_EN = resolveAssetUrl("assets/ad-jumping-cat-en.png");

  let preCheckoutAdTimer = null;
  let preCheckoutPending = null;

  const themeDock = document.querySelector(".theme-dock");

  function applyTheme(themeId) {
    var id = THEME_IDS.indexOf(themeId) >= 0 ? themeId : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(LS_THEME, id);
    } catch (ignore) {}
    if (themeDock) {
      themeDock.querySelectorAll(".theme-chip").forEach(function (btn) {
        var on = btn.getAttribute("data-theme-id") === id;
        btn.classList.toggle("theme-chip--active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
  }

  function initTheme() {
    var saved = DEFAULT_THEME;
    try {
      saved = localStorage.getItem(LS_THEME) || DEFAULT_THEME;
    } catch (ignore) {}
    applyTheme(saved);
  }

  if (themeDock) {
    themeDock.addEventListener("click", function (e) {
      var chip = e.target.closest(".theme-chip[data-theme-id]");
      if (!chip) return;
      applyTheme(chip.getAttribute("data-theme-id"));
    });
  }

  initTheme();

  let current = "0";
  let stored = null;
  let pendingOp = null;
  let freshEntry = true;

  function getCredits() {
    const n = parseInt(localStorage.getItem(LS_CREDITS) || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function setCredits(n) {
    const v = Math.max(0, Math.floor(n));
    localStorage.setItem(LS_CREDITS, String(v));
  }

  function getSubUntil() {
    const n = parseInt(localStorage.getItem(LS_SUB_UNTIL) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  function hasUnlimited() {
    return Date.now() < getSubUntil();
  }

  function canUse() {
    return hasUnlimited() || getCredits() > 0;
  }

  function updateEntitlementStatus() {
    if (!entStatus) return;
    if (!hasUnlimited() && getCredits() <= 0) {
      entStatus.textContent = "";
      entStatus.hidden = true;
      return;
    }
    entStatus.hidden = false;
    if (hasUnlimited()) {
      const d = new Date(getSubUntil());
      entStatus.textContent = CalcI18n.t("entUnlimited", {
        date: d.toLocaleDateString(CalcI18n.localeForDates(), {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      });
    } else {
      entStatus.textContent = CalcI18n.t("entCredits", { n: getCredits() });
    }
  }

  function isPreCheckoutAdOpen() {
    return !!preCheckoutAd && !preCheckoutAd.classList.contains("pre-checkout-ad--hidden");
  }

  function isPreCheckoutAdCloseReady() {
    return (
      !!preCheckoutAdClose &&
      !preCheckoutAdClose.classList.contains("pre-checkout-ad__close--hidden") &&
      !preCheckoutAdClose.disabled
    );
  }

  function clearPreCheckoutAdTimer() {
    if (preCheckoutAdTimer != null) {
      clearTimeout(preCheckoutAdTimer);
      preCheckoutAdTimer = null;
    }
  }

  function dismissPreCheckoutAdAndStartCheckout() {
    var p = preCheckoutPending;
    clearPreCheckoutAdTimer();
    preCheckoutPending = null;
    if (preCheckoutAd) {
      preCheckoutAd.classList.add("pre-checkout-ad--hidden");
      preCheckoutAd.setAttribute("aria-hidden", "true");
    }
    if (preCheckoutAdClose) {
      preCheckoutAdClose.classList.add("pre-checkout-ad__close--hidden");
      preCheckoutAdClose.disabled = true;
    }
    if (p) startCheckout(p.priceId, p.mode);
  }

  function showPreCheckoutAdThenCheckout(priceId, mode) {
    if (!priceId) {
      alert(CalcI18n.t("alertNoPriceId"));
      return;
    }
    if (!preCheckoutAd || !preCheckoutAdImg) {
      startCheckout(priceId, mode);
      return;
    }
    if (isPreCheckoutAdOpen()) return;

    preCheckoutPending = { priceId: priceId, mode: mode };
    var lang = CalcI18n.getLang();
    preCheckoutAdImg.src = lang === "en" ? AD_IMG_EN : AD_IMG_KO;
    CalcI18n.apply(preCheckoutAd);

    preCheckoutAd.classList.remove("pre-checkout-ad--hidden");
    preCheckoutAd.setAttribute("aria-hidden", "false");
    if (preCheckoutAdClose) {
      preCheckoutAdClose.classList.add("pre-checkout-ad__close--hidden");
      preCheckoutAdClose.disabled = true;
    }

    clearPreCheckoutAdTimer();
    preCheckoutAdTimer = setTimeout(function () {
      preCheckoutAdTimer = null;
      if (!preCheckoutAdClose) return;
      preCheckoutAdClose.classList.remove("pre-checkout-ad__close--hidden");
      preCheckoutAdClose.disabled = false;
      preCheckoutAdClose.focus();
    }, 1000);
  }

  function isPricingOpen() {
    return !pricingModal.classList.contains("checkout-modal--hidden");
  }

  function openPricingModal() {
    pricingModal.classList.remove("checkout-modal--hidden");
    pricingModal.setAttribute("aria-hidden", "false");
    btnBuyPack.focus();
  }

  function closePricingModal() {
    pricingModal.classList.add("checkout-modal--hidden");
    pricingModal.setAttribute("aria-hidden", "true");
  }

  function isResultOpen() {
    return !!resultModal && !resultModal.classList.contains("checkout-modal--hidden");
  }

  function openResultModal(valueText) {
    if (!resultModal || !resultValueEl) return;
    resultValueEl.textContent = valueText;
    closePricingModal();
    resultModal.classList.remove("checkout-modal--hidden");
    resultModal.setAttribute("aria-hidden", "false");
    if (btnResultClose) btnResultClose.focus();
  }

  function closeResultModal() {
    if (!resultModal) return;
    resultModal.classList.add("checkout-modal--hidden");
    resultModal.setAttribute("aria-hidden", "true");
  }

  function formatForDisplay(n) {
    if (!Number.isFinite(n)) return "Error";
    const rounded = Math.round(n * 1e12) / 1e12;
    let s = String(rounded);
    if (s.length > 14) return rounded.toExponential(6);
    return s;
  }

  function updateDisplay() {
    display.textContent = current;
  }

  function resetAll() {
    current = "0";
    stored = null;
    pendingOp = null;
    freshEntry = true;
    closePricingModal();
    closeResultModal();
    updateDisplay();
  }

  function inputDigit(d) {
    if (freshEntry) {
      current = d === "0" ? "0" : d;
      freshEntry = false;
    } else {
      if (current === "0" && d !== "0") current = d;
      else if (current !== "0" && current.replace(".", "").length < 12) current += d;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (freshEntry) {
      current = "0.";
      freshEntry = false;
    } else if (!current.includes(".")) {
      current += ".";
    }
    updateDisplay();
  }

  function applyOp(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function flushPending() {
    if (stored === null || pendingOp === null) return;
    const a = stored;
    const b = parseFloat(current);
    const result = applyOp(a, b, pendingOp);
    const formatted = formatForDisplay(result);

    if (formatted === "Error") {
      current = formatted;
      stored = null;
      pendingOp = null;
      freshEntry = true;
      updateDisplay();
      return;
    }

    if (!canUse()) {
      openPricingModal();
      return;
    }

    current = formatted;
    stored = null;
    pendingOp = null;
    freshEntry = true;
    if (!hasUnlimited()) {
      setCredits(getCredits() - 1);
    }
    updateDisplay();
    updateEntitlementStatus();
    openResultModal(formatted);
  }

  function setOperator(op) {
    const n = parseFloat(current);
    if (stored !== null && pendingOp && !freshEntry) {
      const result = applyOp(stored, n, pendingOp);
      if (!Number.isFinite(result)) {
        current = "Error";
        stored = null;
        pendingOp = null;
        freshEntry = true;
        updateDisplay();
        return;
      }
      stored = result;
      current = formatForDisplay(result);
    } else {
      stored = n;
    }
    pendingOp = op;
    freshEntry = true;
    updateDisplay();
  }

  function equals() {
    if (pendingOp === null) return;
    flushPending();
  }

  function toggleSign() {
    if (current === "Error") return;
    if (current === "0") return;
    if (current.startsWith("-")) current = current.slice(1);
    else current = "-" + current;
    updateDisplay();
  }

  function percent() {
    if (current === "Error") return;
    const n = parseFloat(current);
    current = formatForDisplay(n / 100);
    updateDisplay();
  }

  function startCheckout(priceId, mode) {
    if (!priceId) {
      alert(CalcI18n.t("alertNoPriceId"));
      return;
    }
    const url = apiBase + "/.netlify/functions/create-checkout-session";
    btnBuyPack.disabled = true;
    btnBuySub.disabled = true;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (_ref) {
        var ok = _ref.ok;
        var data = _ref.data;
        if (ok && data.url) {
          window.location.href = data.url;
          return;
        }
        var msg = (data && data.error) || CalcI18n.t("alertCheckoutFail");
        alert(msg);
      })
      .catch(function () {
        alert(CalcI18n.t("alertNetwork"));
      })
      .finally(function () {
        btnBuyPack.disabled = false;
        btnBuySub.disabled = false;
      });
  }

  btnBuyPack.addEventListener("click", function () {
    showPreCheckoutAdThenCheckout(pricePack, "payment");
  });

  btnBuySub.addEventListener("click", function () {
    showPreCheckoutAdThenCheckout(priceSub, "subscription");
  });

  if (preCheckoutAdClose) {
    preCheckoutAdClose.addEventListener("click", function () {
      if (!isPreCheckoutAdCloseReady()) return;
      dismissPreCheckoutAdAndStartCheckout();
    });
  }

  btnPricingClose.addEventListener("click", closePricingModal);
  pricingBackdrop.addEventListener("click", closePricingModal);
  if (btnResultClose) btnResultClose.addEventListener("click", closeResultModal);
  if (resultBackdrop) resultBackdrop.addEventListener("click", closeResultModal);

  var langBar = document.querySelector(".lang-switch");
  if (langBar) {
    langBar.addEventListener("click", function (e) {
      var b = e.target.closest(".lang-switch__btn[data-lang]");
      if (!b) return;
      CalcI18n.setLang(b.getAttribute("data-lang"));
      CalcI18n.apply(document);
      updateEntitlementStatus();
    });
  }

  keys.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (isResultOpen() && action !== "equals") {
      closeResultModal();
    }

    if (current === "Error" && action !== "clear") {
      return;
    }

    switch (action) {
      case "digit":
        inputDigit(btn.dataset.value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        setOperator(btn.dataset.value);
        break;
      case "equals":
        equals();
        break;
      case "clear":
        resetAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      default:
        break;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (isPreCheckoutAdOpen()) {
      if (isPreCheckoutAdCloseReady() && e.key === "Escape") {
        e.preventDefault();
        dismissPreCheckoutAdAndStartCheckout();
        return;
      }
      return;
    }

    if (isPricingOpen()) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePricingModal();
        return;
      }
      return;
    }

    if (isResultOpen()) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeResultModal();
        return;
      }
      closeResultModal();
    }

    if (current === "Error" && e.key !== "Escape") return;

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      inputDigit(e.key);
      return;
    }
    if (e.key === ".") {
      e.preventDefault();
      inputDecimal();
      return;
    }
    const opMap = { "+": "+", "-": "-", "*": "*", "/": "/" };
    if (opMap[e.key]) {
      e.preventDefault();
      setOperator(opMap[e.key]);
      return;
    }
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      equals();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      resetAll();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (freshEntry || current === "Error") return;
      current = current.length <= 1 ? "0" : current.slice(0, -1);
      if (current === "-" || current === "") current = "0";
      updateDisplay();
    }
  });

  CalcI18n.apply(document);
  updateDisplay();
  updateEntitlementStatus();
})();
