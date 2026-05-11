(function () {
  const display = document.getElementById("display");
  const keys = document.getElementById("keys");

  let current = "0";
  let stored = null;
  let pendingOp = null;
  let freshEntry = true;

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
    current = formatForDisplay(result);
    stored = null;
    pendingOp = null;
    freshEntry = true;
    updateDisplay();
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

  keys.addEventListener("click", (e) => {
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

  document.addEventListener("keydown", (e) => {
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
})();
