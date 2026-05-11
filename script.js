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

  const pricePack = window.STRIPE_PRICE_PACK_5;
  const priceSub = window.STRIPE_PRICE_SUB_MONTHLY;
  const apiBase = typeof window.STRIPE_API_BASE === "string" ? window.STRIPE_API_BASE : "";
  // 릴스 촬영 중에는 캐시/로드 순서 때문에 플래그가 안 잡혀도 동작하게 기본값을 true로 둠.
  // (릴스 끝나면 stripe-config.js 에서 window.REELS_DEMO_CHECKOUT = false 로 확실히 꺼주세요.)
  const reelsDemoCheckout = window.REELS_DEMO_CHECKOUT !== false;

  const reelsLoadingModal = document.getElementById("reels-loading-modal");
  const reelsDoneModal = document.getElementById("reels-done-modal");
  const reelsResultModal = document.getElementById("reels-result-modal");
  const reelsDoneDetail = document.getElementById("reels-done-detail");
  const reelsResultValue = document.getElementById("reels-result-value");
  const reelsDoneBackdrop = document.getElementById("reels-done-backdrop");
  const reelsResultBackdrop = document.getElementById("reels-result-backdrop");
  const btnReelsDoneOk = document.getElementById("btn-reels-done-ok");
  const btnReelsResultClose = document.getElementById("btn-reels-result-close");

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
    return reelsDemoCheckout || hasUnlimited() || getCredits() > 0;
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
      entStatus.textContent =
        "월 구독 이용 중 · 무제한 (~" +
        d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" }) +
        ")";
    } else {
      const c = getCredits();
      entStatus.textContent = "남은 횟수: " + c + "회 (= 결과를 볼 때마다 1회 차감)";
    }
  }

  function isPricingOpen() {
    return !pricingModal.classList.contains("checkout-modal--hidden");
  }

  function openReelsOverlay(el) {
    if (!el) return;
    el.classList.remove("checkout-modal--hidden");
    el.setAttribute("aria-hidden", "false");
  }

  function closeReelsOverlay(el) {
    if (!el) return;
    el.classList.add("checkout-modal--hidden");
    el.setAttribute("aria-hidden", "true");
  }

  function isReelsFlowActive() {
    if (!reelsLoadingModal || !reelsDoneModal || !reelsResultModal) return false;
    return (
      !reelsLoadingModal.classList.contains("checkout-modal--hidden") ||
      !reelsDoneModal.classList.contains("checkout-modal--hidden") ||
      !reelsResultModal.classList.contains("checkout-modal--hidden")
    );
  }

  function runReelsDemoPurchase(kind) {
    if (!reelsLoadingModal || !reelsDoneModal || !reelsResultModal || !reelsDoneDetail) return;
    closePricingModal();
    openReelsOverlay(reelsLoadingModal);
    btnBuyPack.disabled = true;
    btnBuySub.disabled = true;
    window.setTimeout(function () {
      closeReelsOverlay(reelsLoadingModal);
      reelsDoneDetail.textContent =
        kind === "sub"
          ? "월 무제한 · 결제가 완료됐어요 ✨"
          : "10회 이용권 · 결제가 완료됐어요 ✨";
      openReelsOverlay(reelsDoneModal);
      if (btnReelsDoneOk) btnReelsDoneOk.focus();
      btnBuyPack.disabled = false;
      btnBuySub.disabled = false;
    }, 1000);
  }

  if (btnReelsDoneOk) {
    btnReelsDoneOk.addEventListener("click", function () {
      closeReelsOverlay(reelsDoneModal);
      if (reelsResultValue) reelsResultValue.textContent = display ? display.textContent : "0";
      openReelsOverlay(reelsResultModal);
      if (btnReelsResultClose) btnReelsResultClose.focus();
    });
  }

  if (btnReelsResultClose) {
    btnReelsResultClose.addEventListener("click", function () {
      closeReelsOverlay(reelsResultModal);
    });
  }

  if (reelsResultBackdrop) {
    reelsResultBackdrop.addEventListener("click", function () {
      closeReelsOverlay(reelsResultModal);
    });
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
    if (!reelsDemoCheckout && !hasUnlimited()) {
      setCredits(getCredits() - 1);
    }
    updateDisplay();
    updateEntitlementStatus();
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
    if (reelsDemoCheckout) {
      runReelsDemoPurchase(mode === "subscription" ? "sub" : "pack");
      return;
    }
    if (!priceId) {
      alert("stripe-config.js 에 Price ID가 설정돼 있는지 확인해 주세요.");
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
        var msg =
          (data && data.error) ||
          "결제 페이지를 열 수 없습니다. Netlify 배포와 STRIPE_SECRET_KEY 를 확인해 주세요.";
        alert(msg);
      })
      .catch(function () {
        alert(
          "서버에 연결할 수 없습니다. Netlify에 배포했는지, 같은 주소에서 열고 있는지 확인해 주세요."
        );
      })
      .finally(function () {
        btnBuyPack.disabled = false;
        btnBuySub.disabled = false;
      });
  }

  btnBuyPack.addEventListener("click", function () {
    startCheckout(pricePack, "payment");
  });

  btnBuySub.addEventListener("click", function () {
    startCheckout(priceSub, "subscription");
  });

  btnPricingClose.addEventListener("click", closePricingModal);
  pricingBackdrop.addEventListener("click", closePricingModal);

  keys.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

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
    if (isReelsFlowActive()) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (reelsResultModal && !reelsResultModal.classList.contains("checkout-modal--hidden")) {
          closeReelsOverlay(reelsResultModal);
        } else if (reelsDoneModal && !reelsDoneModal.classList.contains("checkout-modal--hidden")) {
          closeReelsOverlay(reelsDoneModal);
        }
        return;
      }
      e.preventDefault();
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

  updateDisplay();
  updateEntitlementStatus();
})();
