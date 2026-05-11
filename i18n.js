(function (global) {
  var LS_LANG = "calc_lang";

  var STRINGS = {
    ko: {
      pageTitle: "계산기",
      metaDesc: "이용권 기반 계산기",
      appTitle: "계산기",
      calcAria: "계산기",
      keyAria_clear: "전체 지우기",
      keyAria_sign: "부호",
      keyAria_percent: "퍼센트",
      keyAria_div: "나누기",
      keyAria_mul: "곱하기",
      keyAria_sub: "빼기",
      keyAria_add: "더하기",
      keyAria_equals: "계산",
      themeDockAria: "계산기 테마 선택",
      themeDockLabel: "테마",
      themeMinimal: "기본",
      themePink: "핑크 냥이",
      themeSpace: "우주",
      themeParents: "엄빠사랑",
      themeJesus: "예수님",
      theme_tip_minimal: "기본 (배경 없음)",
      theme_tip_pink_cat: "핑크 냥이",
      theme_tip_space: "우주",
      theme_tip_parents: "엄마아빠의 사랑",
      theme_tip_jesus: "예수님",
      pricingHookText: "돈 벌기 1일차",
      pricingHookSub: "· 여기만 레인보우 플렉스",
      pricingTitle: "이용권이 필요해요 ✨",
      pricingLeadHtml: "<strong>=</strong> 로 결과를 볼 때마다 1회가 차감돼요. 월 구독이면 무제한!",
      pricingPackLabel: "10회 이용권 · ₩5,000",
      pricingSubLabel: "월 무제한 · ₩50,000",
      pricingNoteHtml:
        "결제는 Stripe Checkout으로 진행돼요. Netlify에 <code>STRIPE_SECRET_KEY</code> 넣고 배포하면 돼요.",
      btnClose: "닫기",
      resultKicker: "결과가 나왔어요",
      resultTitle: "결과",
      langAria: "언어",
      entUnlimited: "월 구독 이용 중 · 무제한 (~{{date}})",
      entCredits: "남은 횟수: {{n}}회 (= 결과 볼 때마다 1회 차감)",
      alertNoPriceId: "stripe-config.js 에 Price ID가 설정돼 있는지 확인해 주세요.",
      alertCheckoutFail: "결제 페이지를 열 수 없습니다. Netlify 배포와 STRIPE_SECRET_KEY 를 확인해 주세요.",
      alertNetwork: "서버에 연결할 수 없습니다. Netlify에 배포했는지, 같은 주소에서 열고 있는지 확인해 주세요.",
      successTitle: "결제 완료",
      successChecking: "확인 중…",
      successBack: "계산기로 돌아가기",
      successNoSession: "세션 정보가 없습니다. 계산기에서 다시 결제를 시도해 주세요.",
      successPack: "{{n}}회 이용권이 적용되었습니다. 계산기로 돌아가서 = 를 눌러 보세요.",
      successSub: "월 구독이 적용되었습니다. 결제 기간 동안 무제한으로 이용할 수 있어요.",
      successUnpaid: "결제가 완료되지 않았습니다.",
      successGeneric: "이용권을 적용할 수 없습니다. 잠시 후 다시 시도하거나 관리자에게 문의하세요.",
      successNetwork:
        "서버와 통신하지 못했습니다. Netlify에 사이트와 Functions를 배포했는지, STRIPE_SECRET_KEY가 설정됐는지 확인해 주세요.",
    },
    en: {
      pageTitle: "Calculator",
      metaDesc: "Pass-based calculator",
      appTitle: "Calculator",
      calcAria: "Calculator",
      keyAria_clear: "Clear all",
      keyAria_sign: "Sign",
      keyAria_percent: "Percent",
      keyAria_div: "Divide",
      keyAria_mul: "Multiply",
      keyAria_sub: "Subtract",
      keyAria_add: "Add",
      keyAria_equals: "Calculate",
      themeDockAria: "Theme",
      themeDockLabel: "Themes",
      themeMinimal: "Default",
      themePink: "Pink cats",
      themeSpace: "Space",
      themeParents: "Family love",
      themeJesus: "Jesus",
      theme_tip_minimal: "Default (no background art)",
      theme_tip_pink_cat: "Pink cute theme",
      theme_tip_space: "Space theme",
      theme_tip_parents: "Mom & Dad love",
      theme_tip_jesus: "Jesus theme",
      pricingHookText: "Day 1 of making money",
      pricingHookSub: "· rainbow flex zone",
      pricingTitle: "You need a pass ✨",
      pricingLeadHtml:
        "Each time you press <strong>=</strong> to see a result, 1 credit is used. Monthly plan: unlimited!",
      pricingPackLabel: "10 uses · ₩5,000",
      pricingSubLabel: "Monthly unlimited · ₩50,000",
      pricingNoteHtml:
        "Checkout runs on Stripe. Deploy to Netlify and set <code>STRIPE_SECRET_KEY</code>.",
      btnClose: "Close",
      resultKicker: "Here’s your result",
      resultTitle: "Result",
      langAria: "Language",
      entUnlimited: "Monthly plan · unlimited (until {{date}})",
      entCredits: "Credits left: {{n}} (1 credit each time you press = for a result)",
      alertNoPriceId: "Check that Price IDs are set in stripe-config.js.",
      alertCheckoutFail: "Could not open checkout. Verify Netlify deploy and STRIPE_SECRET_KEY.",
      alertNetwork: "Could not reach the server. Deploy to Netlify and open the site from the same origin.",
      successTitle: "Payment complete",
      successChecking: "Verifying…",
      successBack: "Back to calculator",
      successNoSession: "No session. Try checkout again from the calculator.",
      successPack: "{{n}} credits applied. Go back and press = to try.",
      successSub: "Monthly subscription applied. Unlimited for the paid period.",
      successUnpaid: "Payment not completed.",
      successGeneric: "Could not apply entitlement. Retry later or contact support.",
      successNetwork: "Server unreachable. Deploy Functions to Netlify and set STRIPE_SECRET_KEY.",
    },
    zh: {
      pageTitle: "计算器",
      metaDesc: "按次计费的计算器",
      appTitle: "计算器",
      calcAria: "计算器",
      keyAria_clear: "全部清除",
      keyAria_sign: "正负号",
      keyAria_percent: "百分比",
      keyAria_div: "除",
      keyAria_mul: "乘",
      keyAria_sub: "减",
      keyAria_add: "加",
      keyAria_equals: "等于",
      themeDockAria: "主题",
      themeDockLabel: "主题",
      themeMinimal: "默认",
      themePink: "粉色猫咪",
      themeSpace: "宇宙",
      themeParents: "爸妈的爱",
      themeJesus: "耶稣",
      theme_tip_minimal: "默认（无背景图）",
      theme_tip_pink_cat: "粉色可爱风",
      theme_tip_space: "宇宙主题",
      theme_tip_parents: "爸爸妈妈的爱",
      theme_tip_jesus: "耶稣主题",
      pricingHookText: "赚钱第 1 天",
      pricingHookSub: "· 这里专属彩虹炫彩",
      pricingTitle: "需要通行证 ✨",
      pricingLeadHtml: "每次按 <strong>=</strong> 查看结果会消耗 1 次。月订阅：无限次！",
      pricingPackLabel: "10 次 · ₩5,000",
      pricingSubLabel: "月无限 · ₩50,000",
      pricingNoteHtml: "结账使用 Stripe Checkout。部署到 Netlify 并设置 <code>STRIPE_SECRET_KEY</code>。",
      btnClose: "关闭",
      resultKicker: "结果出来了",
      resultTitle: "结果",
      langAria: "语言",
      entUnlimited: "月订阅中 · 无限次（至 {{date}}）",
      entCredits: "剩余次数：{{n}}（每次按 = 看结果扣 1 次）",
      alertNoPriceId: "请在 stripe-config.js 中设置 Price ID。",
      alertCheckoutFail: "无法打开结账页。请检查 Netlify 部署与 STRIPE_SECRET_KEY。",
      alertNetwork: "无法连接服务器。请确认已部署 Netlify 并在同一域名打开。",
      successTitle: "支付完成",
      successChecking: "验证中…",
      successBack: "返回计算器",
      successNoSession: "缺少会话信息。请从计算器重新发起支付。",
      successPack: "已添加 {{n}} 次额度。返回后按 = 试试。",
      successSub: "月订阅已生效。付费期内无限使用。",
      successUnpaid: "支付未完成。",
      successGeneric: "无法应用权益。请稍后重试或联系管理员。",
      successNetwork: "无法连接服务器。请确认 Netlify Functions 已部署且已设置 STRIPE_SECRET_KEY。",
    },
  };

  var current = "ko";

  function normalizeLang(x) {
    if (x === "en" || x === "zh" || x === "ko") return x;
    return "ko";
  }

  function getLang() {
    try {
      return normalizeLang(localStorage.getItem(LS_LANG) || "ko");
    } catch (e) {
      return "ko";
    }
  }

  function setLang(lang) {
    current = normalizeLang(lang || getLang());
    try {
      localStorage.setItem(LS_LANG, current);
    } catch (e) {}
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.setAttribute("data-lang", current);
      document.documentElement.lang = current === "zh" ? "zh-Hans" : current;
    }
  }

  function t(key, vars) {
    var bag = STRINGS[current] || STRINGS.ko;
    var s = bag[key] != null ? bag[key] : STRINGS.ko[key] != null ? STRINGS.ko[key] : key;
    s = String(s);
    if (vars && typeof vars === "object") {
      s = s.replace(/\{\{(\w+)\}\}/g, function (_, k) {
        return vars[k] != null ? String(vars[k]) : "";
      });
    }
    return s;
  }

  function themeTipKey(themeId) {
    return "theme_tip_" + String(themeId || "").replace(/-/g, "_");
  }

  function apply(root) {
    root = root || document;
    setLang(getLang());

    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var attr = el.getAttribute("data-i18n-attr");
      var val = t(key);
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });

    root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    root.querySelectorAll(".theme-chip[data-theme-id]").forEach(function (btn) {
      var tid = btn.getAttribute("data-theme-id");
      btn.setAttribute("title", t(themeTipKey(tid)));
    });

    root.querySelectorAll(".lang-switch__btn[data-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === current;
      btn.classList.toggle("lang-switch__btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    if (typeof document !== "undefined") {
      document.title = t("pageTitle");
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", t("metaDesc"));
    }
  }

  global.CalcI18n = {
    LS_LANG: LS_LANG,
    getLang: function () {
      return current;
    },
    setLang: setLang,
    t: t,
    apply: apply,
    themeTipKey: themeTipKey,
    localeForDates: function () {
      if (current === "zh") return "zh-CN";
      if (current === "en") return "en-US";
      return "ko-KR";
    },
  };
})(typeof window !== "undefined" ? window : this);
