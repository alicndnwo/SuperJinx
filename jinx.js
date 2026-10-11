/* ⚡ Super JinX dashboard helper
   1) first visit opens in Persian; language menu still works and is remembered
   2) adds "تغییر نام کاربری و رمز عبور" to the panel's main menu (☰), styled with the panel's own theme
      (same classes, same icon set, same dialog look, light & dark). Asks for the CURRENT username + password,
      then sets a NEW username + password. Any password works, you stay logged in. */
(function () {
  var LNG = "i18nextLng";
  try { if (!localStorage.getItem(LNG)) localStorage.setItem(LNG, "fa"); } catch (e) {}
  function lang() { try { return (localStorage.getItem(LNG) || "fa").slice(0, 2); } catch (e) { return "fa"; } }
  function L4(fa, en, ru, zh) { var l = lang(); return l === "fa" ? fa : l === "ru" ? (ru || en) : l === "zh" ? (zh || en) : en; }
  function dirOf() { return lang() === "fa" ? "rtl" : "ltr"; }
  function loc() { return L4("fa-IR-u-nu-latn", "en-GB", "ru-RU", "zh-CN"); }
  // every request of ours has a time limit: a hung connection never leaves a dialog stuck on "loading"
  function tfetch(url, opts, ms) {
    opts = opts || {}; var c = null, tm = null;
    try { if (window.AbortController) { c = new AbortController(); opts.signal = c.signal; } } catch (e) {}
    var p = fetch(url, opts);
    var lim = new Promise(function (_, rej) { tm = setTimeout(function () { try { c && c.abort(); } catch (e) {} rej(new Error("timeout")); }, ms || 20000); });
    return Promise.race([p, lim]).then(function (r) { clearTimeout(tm); return r; }, function (e) { clearTimeout(tm); throw e; });
  }
  function syncLang() { var l = lang(); if (document.documentElement.getAttribute("lang") !== l) document.documentElement.setAttribute("lang", l); }
  syncLang(); setInterval(syncLang, 1000);

  var T = {
    fa: { item: "تغییر رمز عبور", title: "تغییر رمز عبور",
          cu: "نام کاربری فعلی", cp: "رمز عبور فعلی", nu: "نام کاربری جدید", pw: "رمز عبور جدید", pw2: "تکرار رمز عبور جدید",
          save: "ذخیره", cancel: "انصراف", show: "نمایش رمز", hide: "پنهان کردن رمز", ok: "رمز عبور عوض شد و با رمز جدید وارد شدید", match: "رمزها یکسان هستند", gen: "ساخت رمز قوی", caps: "Caps Lock روشن است", genOk: "رمز قوی ساخته شد؛ حتماً جایی یادداشتش کنید", done: "انجام شد", st: ["خیلی ضعیف", "ضعیف", "متوسط", "قوی", "خیلی قوی"],
          hint: "نام کاربری: 3 تا 32 حرف انگلیسی، عدد یا _ . - @ · رمز عبور: هر چیزی",
          e: { current_required: "نام کاربری و رمز عبور فعلی را وارد کنید", wrong_current: "نام کاربری یا رمز عبور فعلی اشتباه است",
               bad_username: "نام کاربری جدید باید 3 تا 32 کاراکتر از حروف انگلیسی، عدد یا _ . - @ باشد",
               password_required: "رمز عبور جدید را وارد کنید", nomatch: "رمز عبور جدید و تکرارش یکسان نیستند",
               password_too_long: "رمز عبور جدید خیلی طولانی است", username_taken: "این نام کاربری قبلاً استفاده شده",
               reserved: "این نام کاربری رزرو شده است", too_many: "تلاش ناموفق زیاد بود، 5 دقیقه دیگر دوباره امتحان کنید",
               not_found: "این ادمین پیدا نشد", network: "ارتباط با سرور برقرار نشد", other: "خطای غیرمنتظره، دوباره امتحان کنید" } },
    en: { item: "Change password", title: "Change password",
          cu: "Current username", cp: "Current password", nu: "New username", pw: "New password", pw2: "Confirm new password",
          save: "Save", cancel: "Cancel", show: "Show password", hide: "Hide password", ok: "Password changed, you are signed in with the new one", match: "Passwords match", gen: "Generate a strong password", caps: "Caps Lock is on", genOk: "Strong password generated; save it somewhere safe", done: "Done", st: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
          hint: "Username: 3-32 letters, digits or _ . - @ · Password: anything",
          e: { current_required: "Enter your current username and password", wrong_current: "Current username or password is wrong",
               bad_username: "New username must be 3-32 characters: letters, digits or _ . - @",
               password_required: "Enter a new password", nomatch: "New passwords do not match",
               password_too_long: "New password is too long", username_taken: "This username is already taken",
               reserved: "This username is reserved", too_many: "Too many failed attempts, try again in 5 minutes",
               not_found: "Admin not found", network: "Could not reach the server", other: "Unexpected error, please try again" } }
  };
  T.ru = {"item":"Сменить пароль","title":"Смена пароля","cu":"Текущее имя пользователя","cp":"Текущий пароль","nu":"Новое имя пользователя","pw":"Новый пароль","pw2":"Повторите новый пароль","save":"Сохранить","cancel":"Отмена","show":"Показать пароль","hide":"Скрыть пароль","ok":"Пароль изменён, вы вошли с новым паролем","match":"Пароли совпадают","gen":"Создать надёжный пароль","caps":"Включён Caps Lock","genOk":"Надёжный пароль создан; обязательно сохраните его","done":"Готово","st":["Очень слабый","Слабый","Средний","Надёжный","Очень надёжный"],"hint":"Имя: 3-32 латинских буквы, цифры или _ . - @ · Пароль: любой","e":{"current_required":"Введите текущее имя пользователя и пароль","wrong_current":"Неверное текущее имя пользователя или пароль","bad_username":"Новое имя должно содержать 3-32 символа: латинские буквы, цифры или _ . - @","password_required":"Введите новый пароль","nomatch":"Новые пароли не совпадают","password_too_long":"Новый пароль слишком длинный","username_taken":"Это имя пользователя уже занято","reserved":"Это имя пользователя зарезервировано","too_many":"Слишком много неудачных попыток, повторите через 5 минут","not_found":"Администратор не найден","network":"Нет связи с сервером","other":"Непредвиденная ошибка, попробуйте ещё раз"}};
  T.zh = {"item":"修改密码","title":"修改密码","cu":"当前用户名","cp":"当前密码","nu":"新用户名","pw":"新密码","pw2":"确认新密码","save":"保存","cancel":"取消","show":"显示密码","hide":"隐藏密码","ok":"密码已修改，已使用新密码登录","match":"两次密码一致","gen":"生成强密码","caps":"大写锁定已开启","genOk":"已生成强密码，请务必妥善保存","done":"完成","st":["非常弱","弱","一般","强","非常强"],"hint":"用户名：3-32 个英文字母、数字或 _ . - @ · 密码：任意","e":{"current_required":"请输入当前用户名和密码","wrong_current":"当前用户名或密码错误","bad_username":"新用户名须为 3-32 个字符：英文字母、数字或 _ . - @","password_required":"请输入新密码","nomatch":"两次输入的新密码不一致","password_too_long":"新密码过长","username_taken":"该用户名已被使用","reserved":"该用户名为保留名称","too_many":"失败次数过多，请 5 分钟后再试","not_found":"未找到该管理员","network":"无法连接服务器","other":"发生意外错误，请重试"}};
  function t(k) { return (T[lang()] || T.en)[k]; }
  function token() { try { return localStorage.getItem("token") || ""; } catch (e) { return ""; } }
  var EYE_PATH = "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z";
  var EYE_OFF_PATH = "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88";
  var SPARK_PATH = "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z";
  var WARN_PATH = "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z";
  var KEY_PATH = "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z";
  var X_PATH = "M6 18 18 6M6 6l12 12";
  function svg(d, size) {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" ' +
      'width="' + size + '" height="' + size + '" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="' + d + '"/></svg>';
  }

  function api(method, path, body, form) {
    var h = { "Authorization": "Bearer " + token() };
    var b;
    if (form) { h["Content-Type"] = "application/x-www-form-urlencoded"; b = new URLSearchParams(body).toString(); }
    else if (body) { h["Content-Type"] = "application/json"; b = JSON.stringify(body); }
    return tfetch(path, { method: method, headers: h, body: b }).then(function (r) {
      return r.text().then(function (x) {
        var j = null; try { j = JSON.parse(x); } catch (e) {}
        if (!r.ok) throw new Error((j && (j.detail && (j.detail.msg || j.detail))) || ("HTTP " + r.status));
        return j;
      });
    });
  }

  // ---------------------------------------------------------------------------------------------
  // NATIVE LOOK ENGINE
  // Every time the panel opens one of ITS OWN dialogs (create user, hosts, core...), we remember the
  // exact theme classes it used. Our dialog then reuses those same classes, so it is rendered by the
  // panel's own theme engine: same colors, radius, shadow, fonts, spacing, dark/light mode.
  // Before the panel has opened any dialog, a hand-tuned copy of the Marzban/Chakra theme is used.
  // ---------------------------------------------------------------------------------------------
  var CAP_KEY = "jinx-ui-cap-v1";
  function capLoad() { try { return JSON.parse(localStorage.getItem(CAP_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function emo(el) { return el ? Array.prototype.filter.call(el.classList, function (c) { return /^css-/.test(c); }).join(" ") : ""; }
  function solid(el) {
    var c = getComputedStyle(el).backgroundColor;
    return !!c && c !== "transparent" && c.indexOf("rgba(0, 0, 0, 0)") < 0;
  }
  function capture() {
    var c = capLoad(), changed = false;
    function put(k, v) { if (v && c[k] !== v) { c[k] = v; changed = true; } }
    var content = null, all = document.querySelectorAll(".chakra-modal__content");
    for (var i = 0; i < all.length; i++) if (!all[i].closest("#jinx-pw, .jinx-rs")) { content = all[i]; break; }
    if (content) {
      var root = content.closest(".chakra-portal") || document;
      put("overlay", emo(root.querySelector(".chakra-modal__overlay")));
      put("container", emo(content.closest(".chakra-modal__content-container")));
      put("content", emo(content));
      var hd = content.querySelector(".chakra-modal__header");
      put("header", emo(hd));
      if (hd) {
        var p = hd.querySelector("p, h2, h3"); put("title", emo(p));
        var ic = null, kids = hd.querySelectorAll("div, span");
        for (var k = 0; k < kids.length; k++) {
          if (kids[k].querySelector("svg") && parseFloat(getComputedStyle(kids[k]).borderRadius) > 8) { ic = kids[k]; break; }
        }
        put("icon", emo(ic));
        if (hd.parentNode && hd.parentNode.querySelector(".chakra-stack")) put("hstack", emo(hd.querySelector(".chakra-stack")));
      }
      put("close", emo(content.querySelector(".chakra-modal__close-btn")));
      put("body", emo(content.querySelector(".chakra-modal__body")));
      put("footer", emo(content.querySelector(".chakra-modal__footer")));
      put("label", emo(content.querySelector(".chakra-form__label")));
      put("fc", emo(content.querySelector(".chakra-form-control")));
      put("input", emo(content.querySelector("input.chakra-input")));
      put("cb", emo(content.querySelector("label.chakra-checkbox")));
      put("cbControl", emo(content.querySelector(".chakra-checkbox__control")));
      put("cbLabel", emo(content.querySelector(".chakra-checkbox__label")));
      var fb = content.querySelectorAll(".chakra-modal__footer button.chakra-button");
      for (var b = 0; b < fb.length; b++) put(solid(fb[b]) ? "btnPrimary" : "btnSecondary", emo(fb[b]));
    }
    if (!c.input) put("inputPage", emo(document.querySelector("input.chakra-input")));
    if (!c.btnPrimary) {
      var bs = document.querySelectorAll("button.chakra-button");
      for (var j = 0; j < bs.length; j++) if (bs[j].offsetParent && solid(bs[j])) { put("btnPage", emo(bs[j])); break; }
    }
    if (changed) { try { localStorage.setItem(CAP_KEY, JSON.stringify(c)); } catch (e) {} }
  }
  var ruleCache = {};
  function hasRule(cls) {
    if (!cls) return false;
    var first = cls.split(" ")[0];
    if (ruleCache[first] === true) return true;
    var sel = "." + first, sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var rules; try { rules = sheets[i].cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var st = rules[j].selectorText;
        if (st && st.indexOf(sel) >= 0) { ruleCache[first] = true; return true; }
      }
    }
    return false;
  }
  // class for part k: panel's own class if its CSS is loaded, otherwise our hand-tuned twin ("jp-own")
  function K(k, alt) {
    var c = capLoad(), v = c[k] || (alt && c[alt]) || "";
    return hasRule(v) ? v : "jp-own";
  }

  function css() {
    if (document.getElementById("jinx-pw-css")) return;
    var s = document.createElement("style"); s.id = "jinx-pw-css";
    var B = "var(--chakra-colors-chakra-border-color,#e2e8f0)", P = "var(--chakra-colors-primary-500,var(--chakra-colors-blue-500,#3182ce))";
    s.textContent =
      // 👁 password fields with their own show/hide button + strength meter
      "#jinx-pw *,#jinx-pw *::before,#jinx-pw *::after,.jinx-rs *,.jinx-rs *::before,.jinx-rs *::after{box-sizing:border-box}" +
      "#jinx-pw .jp-pwf{position:relative;direction:ltr}#jinx-pw .jp-pwf input{padding-right:2.6rem!important}" +
      "#jinx-pw .jp-eye{position:absolute;top:50%;right:.3rem;transform:translateY(-50%);z-index:2;width:2rem;height:2rem;display:grid;place-items:center;border:0;background:transparent;color:inherit;opacity:.55;border-radius:var(--chakra-radii-md,.375rem);cursor:pointer;transition:opacity .2s,background .2s,color .2s}" +
      "#jinx-pw .jp-eye:hover{opacity:1;background:var(--chakra-colors-blackAlpha-100,rgba(0,0,0,.06))}.chakra-ui-dark #jinx-pw .jp-eye:hover{background:var(--chakra-colors-whiteAlpha-100,rgba(255,255,255,.08))}" +
      "#jinx-pw .jp-eye.on{opacity:1;color:" + P + "}#jinx-pw .jp-eye svg{width:18px;height:18px}" +
      "#jinx-pw .jp-str{display:flex;align-items:center;gap:.6rem;min-height:1.1rem;font-size:var(--chakra-fontSizes-xs,.75rem);margin-top:-.25rem}" +
      "#jinx-pw .jp-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;width:6rem;flex:none}#jinx-pw .jp-bar i{height:4px;border-radius:4px;background:var(--chakra-colors-gray-200,#e2e8f0);transition:background .25s}" +
      ".chakra-ui-dark #jinx-pw .jp-bar i{background:var(--chakra-colors-whiteAlpha-300,rgba(255,255,255,.16))}#jinx-pw .jp-str:not([data-s]) .jp-bar,#jinx-pw .jp-str[data-s='0'] .jp-bar{opacity:.5}" +
      "#jinx-pw .jp-str[data-s='1'] i:nth-child(-n+1){background:var(--chakra-colors-red-400,#f56565)}#jinx-pw .jp-str[data-s='2'] i:nth-child(-n+2){background:var(--chakra-colors-orange-400,#ed8936)}" +
      "#jinx-pw .jp-str[data-s='3'] i:nth-child(-n+3){background:var(--chakra-colors-green-400,#48bb78)}#jinx-pw .jp-str[data-s='4'] i{background:var(--chakra-colors-green-500,#38a169)}" +
      "#jinx-pw .jp-tools{display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;margin-top:-.25rem}" +
      "#jinx-pw .jp-gen{display:inline-flex;align-items:center;gap:.4rem;height:1.9rem;padding:0 .7rem;border-radius:999px;border:1px solid " + B + ";background:transparent;color:" + P + ";font:inherit;font-size:var(--chakra-fontSizes-xs,.75rem);font-weight:700;cursor:pointer;transition:background .2s,transform .15s}" +
      "#jinx-pw .jp-gen:hover{background:rgba(66,153,225,.1);transform:translateY(-1px)}#jinx-pw .jp-gen svg{animation:jpspark 2.6s ease-in-out infinite}@keyframes jpspark{50%{transform:rotate(18deg) scale(1.15)}}" +
      "#jinx-pw .jp-caps{display:inline-flex;align-items:center;gap:.3rem;font-size:var(--chakra-fontSizes-xs,.75rem);color:var(--chakra-colors-orange-400,#ed8936);font-weight:600}#jinx-pw .jp-caps[hidden]{display:none}" +
      "#jinx-pw .jp-okv{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.4rem 0 .6rem;text-align:center}#jinx-pw .jp-okv i{width:3.6rem;height:3.6rem;border-radius:50%;display:grid;place-items:center;color:#fff;background:var(--chakra-colors-green-500,#38a169);animation:jcpop2 .5s cubic-bezier(.2,1.4,.4,1);box-shadow:0 0 0 8px rgba(72,187,120,.15)}" +
      "@keyframes jcpop2{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}#jinx-pw .jp-okv b{font-size:var(--chakra-fontSizes-md,1rem)}" +
      "#jinx-pw .jp-str span{opacity:.75}#jinx-pw .jp-str.mm span{color:var(--chakra-colors-red-400,#f56565);opacity:1}" +
      // ✦ our ☰ menu items: native size, plus a refined accent so they feel special
      "[role=menu] .jinx-item{position:relative}[role=menu] .jinx-item svg{color:" + P + ";transition:transform .25s}" +
      "[role=menu] .jinx-item[data-focus] svg{transform:scale(1.12) rotate(-6deg)}" +
      "[role=menu] .jinx-item::after{content:'';position:absolute;inset-inline-start:0;top:20%;bottom:20%;width:2px;border-radius:2px;background:linear-gradient(" + P + ",var(--chakra-colors-purple-400,#9f7aea));opacity:0;transition:opacity .2s}" +
      "[role=menu] .jinx-item[data-focus]::after{opacity:1}" +
      "[role=menu] .jinx-item{white-space:nowrap}" +
      // twins of the Chakra/Marzban modal parts (used only until the panel's own classes are known)
      ".chakra-modal__overlay.jp-own{position:fixed;inset:0;z-index:var(--chakra-zIndices-modal,1400);background:var(--chakra-colors-blackAlpha-300,rgba(0,0,0,.16));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}" +
      ".chakra-modal__content-container.jp-own{position:fixed;inset:0;z-index:var(--chakra-zIndices-modal,1400);display:flex;justify-content:center;align-items:flex-start;overflow:auto;overscroll-behavior-y:none}" +
      ".chakra-modal__content.jp-own{position:relative;display:flex;flex-direction:column;width:100%;outline:0;max-width:var(--chakra-sizes-sm,24rem);margin:3.75rem 1rem;" +
        "border-radius:var(--chakra-radii-md,.375rem);background:var(--chakra-colors-white,#fff);color:inherit;box-shadow:var(--chakra-shadows-lg)}" +
      ".chakra-ui-dark .chakra-modal__content.jp-own,[data-theme=dark] .chakra-modal__content.jp-own{background:var(--chakra-colors-gray-700,#2d3748);box-shadow:var(--chakra-shadows-dark-lg)}" +
      ".chakra-modal__header.jp-own{flex:0 1 0%;padding:1.5rem 1.5rem 1rem;font-size:var(--chakra-fontSizes-xl,1.25rem);font-weight:var(--chakra-fontWeights-semibold,600)}" +
      ".chakra-modal__close-btn.jp-own{position:absolute;top:.5rem;inset-inline-end:.75rem;width:2rem;height:2rem;display:inline-flex;align-items:center;justify-content:center;" +
        "border:0;background:transparent;color:inherit;border-radius:var(--chakra-radii-md,.375rem);cursor:pointer;transition:background .2s}" +
      ".chakra-modal__close-btn.jp-own:hover{background:var(--chakra-colors-blackAlpha-100,rgba(0,0,0,.06))}" +
      ".chakra-ui-dark .chakra-modal__close-btn.jp-own:hover{background:var(--chakra-colors-whiteAlpha-100,rgba(255,255,255,.06))}" +
      ".chakra-modal__body.jp-own{flex:1 1 0%;padding:.5rem 1.5rem}" +
      ".chakra-modal__footer.jp-own{display:flex;align-items:center;justify-content:flex-end;gap:.75rem;padding:1rem 1.5rem}" +
      ".chakra-form__label.jp-own{display:block;text-align:start;font-size:var(--chakra-fontSizes-sm,.875rem);font-weight:var(--chakra-fontWeights-medium,500);margin-inline-end:.75rem;margin-bottom:.5rem;opacity:1}" +
      ".chakra-form-control.jp-own{width:100%;position:relative}" +
      "input.chakra-input.jp-own{width:100%;min-width:0;outline:2px solid transparent;position:relative;appearance:none;transition:all .2s;font-size:var(--chakra-fontSizes-sm,.875rem);" +
        "padding-inline:.75rem;height:2rem;border-radius:var(--chakra-radii-md,.375rem);border:1px solid " + B + ";background:inherit;color:inherit}" +
      "input.chakra-input.jp-own:hover{border-color:var(--chakra-colors-gray-300,#cbd5e0)}" +
      ".chakra-ui-dark input.chakra-input.jp-own:hover{border-color:var(--chakra-colors-whiteAlpha-400,rgba(255,255,255,.24))}" +
      "input.chakra-input.jp-own:focus{z-index:1;border-color:" + P + ";box-shadow:0 0 0 1px " + P + "}" +
      "input.chakra-input:disabled{opacity:.4;cursor:not-allowed}" +
      "button.chakra-button.jp-own{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;user-select:none;outline:0;cursor:pointer;" +
        "height:2rem;min-width:2rem;padding-inline:.75rem;font-size:var(--chakra-fontSizes-sm,.875rem);font-weight:var(--chakra-fontWeights-semibold,600);" +
        "border-radius:var(--chakra-radii-md,.375rem);transition:all .25s;border:0}" +
      "button.chakra-button.jp-own.jp-primary{background:" + P + ";color:#fff}" +
      "button.chakra-button.jp-own.jp-primary:hover{background:var(--chakra-colors-primary-600,var(--chakra-colors-blue-600,#2b6cb0))}" +
      "button.chakra-button.jp-own.jp-secondary{background:transparent;color:inherit;border:1px solid " + B + "}" +
      "button.chakra-button.jp-own.jp-secondary:hover{background:var(--chakra-colors-gray-100,#edf2f7)}" +
      ".chakra-ui-dark button.chakra-button.jp-own.jp-secondary:hover{background:var(--chakra-colors-whiteAlpha-200,rgba(255,255,255,.08))}" +
      "button.chakra-button:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}" +
      ".jp-icon.jp-own{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;padding:.25rem;border-radius:9999px;box-sizing:content-box;" +
        "background:var(--chakra-colors-primary-400,var(--chakra-colors-blue-400,#4299e1));color:#fff;border:6px solid var(--chakra-colors-primary-100,var(--chakra-colors-blue-100,#bee3f8))}" +
      ".chakra-ui-dark .jp-icon.jp-own,[data-theme=dark] .jp-icon.jp-own{border-color:var(--chakra-colors-gray-600,#4a5568)}" +
      ".jp-head{display:flex;align-items:center;gap:.5rem}" +
      ".jp-title.jp-own{font-weight:var(--chakra-fontWeights-semibold,600);font-size:var(--chakra-fontSizes-lg,1.125rem)}" +
      // Chakra checkbox twin
      "label.chakra-checkbox.jp-own{display:inline-flex;align-items:center;vertical-align:top;cursor:pointer;position:relative;gap:.5rem}" +
      ".chakra-checkbox__control.jp-own{display:inline-flex;align-items:center;justify-content:center;width:.875rem;height:.875rem;flex-shrink:0;" +
        "border:2px solid " + B + ";border-radius:var(--chakra-radii-sm,.125rem);transition:all .15s;color:#fff}" +
      ".chakra-checkbox__control.jp-own[data-checked]{background:" + P + ";border-color:" + P + "}" +
      ".chakra-checkbox__control.jp-own svg{width:.6rem;opacity:0}.chakra-checkbox__control[data-checked] svg{opacity:1}" +
      ".chakra-checkbox__label.jp-own{font-size:var(--chakra-fontSizes-sm,.875rem);user-select:none}" +
      // layout bits that are ours in both modes
      "#jinx-pw .jp-fields{display:flex;flex-direction:column;gap:1rem}" +
      "#jinx-pw .jp-sep{height:1px;background:" + B + ";margin:.25rem 0}" +
      "#jinx-pw .jp-hint{font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6;line-height:1.7}" +
      "#jinx-pw .jp-m{font-size:var(--chakra-fontSizes-sm,.875rem);line-height:1.6}#jinx-pw .jp-m:empty{display:none}" +
      "#jinx-pw .jp-m.e{color:var(--chakra-colors-red-400,#f56565)}#jinx-pw .jp-m.s{color:var(--chakra-colors-green-400,#48bb78)}" +
      "#jinx-pw input.chakra-input{direction:ltr;text-align:start;unicode-bidi:plaintext}" +
      "#jinx-pw .chakra-modal__footer{gap:.75rem}" +
      "#jinx-pw .jp-cbh{position:absolute;width:1px;height:1px;opacity:0;margin:0;pointer-events:none}" +
      "@keyframes jpf{from{opacity:0}to{opacity:1}}@keyframes jps{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}" +
      "#jinx-pw .chakra-modal__overlay{animation:jpf .15s ease-out}#jinx-pw .chakra-modal__content{animation:jps .2s cubic-bezier(0,0,.2,1)}";
    document.head.appendChild(s);
  }

  var CHECK = '<svg viewBox="0 0 12 10" aria-hidden="true" style="fill:none;stroke-width:2;stroke:currentColor;stroke-dasharray:16px"><polyline points="1.5 6 4.5 9 10.5 1"></polyline></svg>';

  function openModal() {
    capture(); css();
    var old = document.getElementById("jinx-pw"); if (old) { if (old.__dispose) old.__dispose(); else old.remove(); }
    var inC = K("input", "inputPage"), pC = K("btnPrimary", "btnPage"), sC = K("btnSecondary");
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var field = function (id, lbl, type, ac) {
      return '<div class="chakra-form-control ' + K("fc") + '"><label for="' + id + '" class="chakra-form__label ' + K("label") + '">' + lbl + '</label>' +
        (type === "password" ? '<div class="jp-pwf">' : "") + '<input id="' + id + '" class="chakra-input ' + inC + '" type="' + type + '" autocomplete="' + ac + '" autocapitalize="off" spellcheck="false" dir="ltr">' +
        (type === "password" ? '<button type="button" class="jp-eye" data-for="' + id + '" aria-label="' + esc(t("show")) + '" title="' + esc(t("show")) + '">' + svg(EYE_PATH, 18) + '</button></div>' : "") + '</div>';
    };
    var w = document.createElement("div"); w.id = "jinx-pw"; w.className = "chakra-portal";
    w.setAttribute("dir", dirOf());
    w.innerHTML =
      '<div class="chakra-modal__overlay ' + K("overlay") + '"></div>' +
      '<div class="chakra-modal__content-container ' + K("container") + '">' +
        '<section class="chakra-modal__content ' + K("content") + '" role="dialog" aria-modal="true" tabindex="-1">' +
          '<header class="chakra-modal__header ' + K("header") + '"><div class="jp-head">' +
            '<div class="jp-icon ' + K("icon") + '">' + svg(KEY_PATH, 20) + '</div>' +
            '<p class="jp-title ' + K("title") + '">' + esc(t("title")) + '</p></div></header>' +
          '<button type="button" aria-label="' + esc(L4("بستن", "Close", "Закрыть", "关闭")) + '" class="chakra-modal__close-btn ' + K("close") + '">' +
            '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="12" height="12"><path fill="currentColor" d="M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z"></path></svg></button>' +
          '<div class="chakra-modal__body ' + K("body") + '"><div class="jp-fields">' +
            field("jcu", esc(t("cu")), "text", "username") +
            field("jcp", esc(t("cp")), "password", "current-password") +
            '<div class="jp-sep"></div>' +
            field("jnu", esc(t("nu")), "text", "off") +
            field("jp1", esc(t("pw")), "password", "new-password") +
            field("jp2", esc(t("pw2")), "password", "new-password") +
            '<div class="jp-str" aria-live="polite"><div class="jp-bar"><i></i><i></i><i></i><i></i></div><span></span></div>' +
            '<div class="jp-tools"><button type="button" class="jp-gen">' + svg(SPARK_PATH, 15) + '<span>' + esc(t("gen")) + '</span></button><span class="jp-caps" hidden>' + svg(WARN_PATH, 14) + '<span>' + esc(t("caps")) + '</span></span></div>' +
            '<div class="jp-hint">' + esc(t("hint")) + '</div>' +
            '<div class="jp-m" role="status"></div>' +
          '</div></div>' +
          '<footer class="chakra-modal__footer ' + K("footer") + '">' +
            '<button type="button" class="chakra-button jp-cancel jp-secondary ' + sC + '">' + esc(t("cancel")) + '</button>' +
            '<button type="button" class="chakra-button jp-save jp-primary ' + pC + '">' + esc(t("save")) + '</button>' +
          '</footer>' +
        '</section></div>';
    document.body.appendChild(w);
    var q = function (sel) { return w.querySelector(sel); };
    var save = q(".jp-save"), cancel = q(".jp-cancel"), msg = q(".jp-m");
    var cu = q("#jcu"), cp = q("#jcp"), nu = q("#jnu"), p1 = q("#jp1"), p2 = q("#jp2");
    var busy = false;
    var onKey = function (e) { if (e.key === "Escape") close(); };
    var close = function () { if (busy) return; w.__dispose(); };
    w.__dispose = function () { w.remove(); document.removeEventListener("keydown", onKey); document.body.style.overflow = bodyOverflow; };
    var bodyOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    q(".chakra-modal__content-container").addEventListener("mousedown", function (e) { if (e.target === e.currentTarget) close(); });
    q(".chakra-modal__close-btn").onclick = close; cancel.onclick = close;
    // 👁 every password field can be shown / hidden on its own (the value is never changed)
    Array.prototype.forEach.call(w.querySelectorAll(".jp-eye"), function (b) {
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });          // keep the caret in the field
      b.onclick = function () { var inp = q("#" + b.getAttribute("data-for")), show = inp.type === "password";
        inp.type = show ? "text" : "password"; b.innerHTML = svg(show ? EYE_OFF_PATH : EYE_PATH, 18); b.classList.toggle("on", show);
        b.setAttribute("aria-label", show ? t("hide") : t("show")); b.title = b.getAttribute("aria-label"); inp.focus(); };
    });
    var strEl = q(".jp-str"), meter = function () {
      var v = p1.value, cls = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(function (r) { return r.test(v); }).length, sc = 0;
      if (v.length >= 8) sc++; if (v.length >= 12) sc++; if (cls >= 3) sc++; if (cls === 4 && v.length >= 10) sc++;
      sc = v ? (v.length < 6 ? 1 : Math.max(1, Math.min(4, sc))) : 0; strEl.setAttribute("data-s", sc);
      var lab = v ? t("st")[sc] : ""; if (v && p2.value) lab += " · " + (p1.value === p2.value ? "✓ " + t("match") : "✕ " + t("e").nomatch);
      strEl.lastChild.textContent = lab; strEl.classList.toggle("mm", !!(v && p2.value && p1.value !== p2.value));
    };
    p1.addEventListener("input", meter); p2.addEventListener("input", meter);
    q(".jp-gen").onclick = function () {      // strong random password, shown so it can be written down
      var a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", sy = "!@#$%*-_+", r = new Uint32Array(16), out = "";
      do {                                     // always upper + lower + digit + 2 symbols = always "strong"
        (window.crypto || window.msCrypto).getRandomValues(r); out = "";
        for (var i = 0; i < 14; i++) out += a[r[i] % a.length]; out = out.slice(0, 5) + sy[r[14] % sy.length] + out.slice(5) + sy[r[15] % sy.length];
      } while (!(/[A-Z]/.test(out) && /[a-z]/.test(out) && /[0-9]/.test(out)));
      p1.value = p2.value = out; [p1, p2].forEach(function (x) { x.type = "text"; }); Array.prototype.forEach.call(w.querySelectorAll('.jp-eye[data-for="jp1"],.jp-eye[data-for="jp2"]'), function (b) { b.innerHTML = svg(EYE_OFF_PATH, 18); b.classList.add("on"); });
      meter(); say(t("genOk"), true); p1.focus(); p1.select();
    };
    var capsEl = q(".jp-caps"), caps = function (e) { try { capsEl.hidden = !(e.getModifierState && e.getModifierState("CapsLock")); } catch (x) {} };
    [cp, p1, p2].forEach(function (el) { el.addEventListener("keydown", caps); el.addEventListener("keyup", caps); el.addEventListener("blur", function () { capsEl.hidden = true; }); });
    api("GET", "/api/admin").then(function (a) { if (a && a.username) { cu.value = a.username; nu.value = a.username; cp.focus(); } })
      .catch(function () {});
    setTimeout(function () { (cu.value ? cp : cu).focus(); }, 80);
    var err = function (code) { var E = t("e"); return E[code] || E.other; };
    var say = function (txt, ok) { msg.className = "jp-m " + (ok ? "s" : "e"); msg.textContent = txt; };
    var submit = function () {
      if (busy) return;
      var U = cu.value.trim(), N = nu.value.trim() || U;
      if (!U || !cp.value) { say(err("current_required")); (U ? cp : cu).focus(); return; }
      if (!/^[A-Za-z0-9_.@-]{3,32}$/.test(N)) { say(err("bad_username")); nu.focus(); return; }
      if (!p1.value) { say(err("password_required")); p1.focus(); return; }
      if (p1.value !== p2.value) { say(err("nomatch")); p2.focus(); return; }
      if (new TextEncoder().encode(p1.value).length > 72) { say(err("password_too_long")); p1.focus(); return; }
      busy = true; save.disabled = cancel.disabled = true; save.setAttribute("data-loading", ""); say("");
      tfetch("/jinx-api/account", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ current_username: U, current_password: cp.value, new_username: N, new_password: p1.value }) })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: "other" }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw { code: (res && res.error) || "other" };
          var done = function (tok) {
            if (tok) { try { localStorage.setItem("token", tok); } catch (e) {} }
            say(t("ok"), true);
            try { var fl = q(".jp-fields"); fl.innerHTML = '<div class="jp-okv"><i>' + svg("m4.5 12.75 6 6 9-13.5", 30) + '</i><b></b><span></span></div>'; fl.querySelector("b").textContent = t("done"); fl.querySelector("span").textContent = t("ok"); q(".chakra-modal__footer").style.display = "none"; } catch (x) {}
            setTimeout(function () { location.reload(); }, 900);
          };
          if (res.access_token) return done(res.access_token);
          // saved already; if auto-login fails for any reason, just reload -> panel shows its normal login page
          return api("POST", "/api/admin/token", { username: res.username, password: p1.value, grant_type: "password" }, true)
            .then(function (r) { done(r && r.access_token); })
            .catch(function () { done(null); });
        })
        .catch(function (e) {
          busy = false; save.disabled = cancel.disabled = false; save.removeAttribute("data-loading");
          say(err(e && e.code ? e.code : "network"));
        });
    };
    save.onclick = submit;
    [cu, cp, nu, p1, p2].forEach(function (el) { el.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); }); });
  }

  // learn the panel's theme whenever it opens its own dialogs
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      for (var j = 0; j < muts[i].addedNodes.length; j++) {
        var n = muts[i].addedNodes[j];
        if (n.nodeType === 1 && !n.closest("#jinx-pw, .jinx-rs") && (n.matches(".chakra-portal, .chakra-modal__content") || n.querySelector && n.querySelector(".chakra-modal__content"))) {
          setTimeout(capture, 400); return;
        }
      }
    }
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });



  // =============================================================================================
  // 🤝 RESELLER PANELS (پنل‌های نمایندگی)  -  same dialog engine as above, so it looks native
  // =============================================================================================
  var RT = {
    fa: { item: "پنل‌های نمایندگی", title: "پنل‌های نمایندگی", meItem: "اعتبار پنل نمایندگی", meTitle: "اعتبار پنل نمایندگی",
          add: "ساخت پنل نمایندگی", refresh: "بروزرسانی", empty: "هنوز پنل نمایندگی نساخته‌اید. با «ساخت پنل نمایندگی» اولین نماینده را بسازید.",
          intro: "هر نماینده با نام کاربری و رمز خودش وارد همین پنل می‌شود و فقط کاربران خودش را می‌بیند.",
          name: "نام کاربری", pass: "رمز عبور", gen: "ساخت رمز", users: "کاربران", volume: "حجم", expire: "انقضا", status: "وضعیت", note: "توضیحات (اختیاری)",
          maxUsers: "حداکثر تعداد کاربر", quota: "حجم کل قابل فروش", days: "مدت اعتبار (روز)", zero: "0 یعنی نامحدود",
          passEdit: "رمز عبور جدید (خالی = بدون تغییر)", enabled: "پنل فعال باشد", unlimited: "نامحدود", never: "بدون انقضا",
          st: { active: "فعال", disabled: "غیرفعال", expired: "منقضی" }, left: "روز مانده", ended: "تمام شده",
          save: "ذخیره", create: "ساخت پنل", cancel: "انصراف", back: "بازگشت", edit: "ویرایش", del: "حذف", copy: "کپی اطلاعات ورود",
          on: "فعال کردن", off: "غیرفعال کردن", close: "بستن",
          dom: "دامنه‌ی پنل", domOther: "دامنه‌ی دیگر…", domThis: "همین پنل", domHelp: "پنل نماینده و ساب‌لینک کاربرهاش با این دامنه ساخته میشن. دامنه‌ی دیگه باید توی Railway به همین سرویس وصل شده باشه (Settings ← Networking ← Custom Domain).", created: "پنل نمایندگی ساخته شد. این اطلاعات را برای نماینده بفرستید:", panelUrl: "آدرس پنل", copied: "کپی شد",
          delQ: "پنل نمایندگی «{n}» حذف شود؟", delD: "کاربران این نماینده ({u} کاربر) حذف نمی‌شوند و به حساب شما منتقل می‌شوند.",
          saved: "ذخیره شد", deleted: "حذف شد", loading: "در حال بارگذاری…",
          meD: "محدودیت‌های پنل شما که مدیر تعیین کرده است.", meUsers: "کاربران ساخته‌شده", meVol: "حجم مصرف‌شده از اعتبار", meExp: "اعتبار پنل تا",
          cr: { pk: { bronze: "برنزی", silver: "نقره‌ای", gold: "طلایی", diamond: "الماس", custom: "سفارشی" }, pkCustom: "مقادیر دلخواه", acc: "حساب نماینده", lim: "محدودیت‌های پنل",
                uHelp: "3 تا 32 حرف انگلیسی، عدد یا _ . - @", uFree: "این نام کاربری آزاد است", gb: "حجم کل", days: "مدت (روز)", dayW: "روز", newP: "پنل نمایندگی جدید",
                okT: "پنل نمایندگی آماده است", okD: "این اطلاعات را برای نماینده بفرستید. با همین لینک وارد پنل خودش می‌شود.", okU: "اطلاعات ورود جدید آماده است", copyAll: "کپی همه", share: "ارسال", one: "کپی" },
          st2: ["", "ضعیف", "متوسط", "خوب", "خیلی قوی"],
          sumP: "پنل‌های فعال", sumU: "کاربران نماینده‌ها", sumG: "حجم فروخته‌شده", titleL: "نام نمایشی (اختیاری)", search: "جستجوی نام، نام نمایشی یا توضیحات", fAll: "همه", noMatch: "موردی با این جستجو پیدا نشد.",
          charge: "شارژ و تمدید", chargeD: "مقدار را اضافه کنید؛ عدد منفی یعنی کم کردن. پنل منقضی‌شده از امروز تمدید می‌شود.", addGb: "افزودن حجم", addDays: "افزودن روز", addUsers: "افزودن ظرفیت کاربر", doCharge: "اعمال شارژ", charged: "شارژ اعمال شد",
          now: "الان", hist: "تاریخچه", histEmpty: "هنوز فعالیتی ثبت نشده است.", renameH: "برای تغییر نام، نام کاربری را ویرایش کنید (نماینده باید دوباره وارد شود)",
          newCred: "تغییرات ذخیره شد. اطلاعات ورود جدید را برای نماینده بفرستید:", minUsers: "حداقل 10 کاربر · 0 یعنی نامحدود",
          hx: { domain: "دامنه", create: "ساخت پنل", update: "ویرایش", charge: "شارژ", password: "تغییر رمز", rename: "تغییر نام", max_users: "ظرفیت کاربر", quota: "حجم", expire: "انقضا", enabled: "وضعیت", title: "نام نمایشی", note: "توضیحات",
                "user+": "ساخت کاربر", "user-": "حذف کاربر", "user~": "ویرایش کاربر", "user:reset": "ریست مصرف کاربر", "user:revoke_sub": "تعویض ساب کاربر" },
          e: { bad_domain: "دامنه معتبر نیست؛ مثلاً panel.example.com بنویس", min_capacity: "ظرفیت کاربر باید حداقل 10 باشد (یا 0 برای نامحدود)", min_quota: "حجم باید حداقل 1 مگ باشد (یا 0 برای نامحدود)",
               unlimited_quota: "حجم این پنل نامحدود است؛ برای شارژ حجم، ابتدا در ویرایش سقف حجم تعیین کنید", unlimited_time: "این پنل بدون انقضاست؛ برای افزودن روز، ابتدا در ویرایش مدت تعیین کنید",
               unlimited_users: "ظرفیت کاربر این پنل نامحدود است؛ ابتدا در ویرایش سقف تعیین کنید", nothing: "هیچ مقداری برای شارژ وارد نشده است", busy: "اطلاعات نمایندگی موقتاً در دسترس نیست؛ چند لحظه دیگر دوباره امتحان کنید",
               bad_username: "نام کاربری باید 3 تا 32 کاراکتر از حروف انگلیسی، عدد یا _ . - @ باشد", password_required: "رمز عبور را وارد کنید",
               password_too_long: "رمز عبور خیلی طولانی است", username_taken: "این نام کاربری قبلاً استفاده شده", reserved: "این نام کاربری رزرو شده است",
               bad_number: "عددها را درست وارد کنید", not_found: "این نماینده پیدا نشد", sudo_only: "فقط مدیر اصلی به این بخش دسترسی دارد",
               login_required: "دوباره وارد پنل شوید", network: "ارتباط با سرور برقرار نشد", other: "خطای غیرمنتظره، دوباره امتحان کنید" } },
    en: { item: "Reseller panels", title: "Reseller panels", meItem: "Reseller credit", meTitle: "Reseller credit",
          add: "New reseller panel", refresh: "Refresh", empty: "No reseller panels yet. Create the first one with “New reseller panel”.",
          intro: "Each reseller logs in to this same panel with its own username and password and only sees its own users.",
          name: "Username", pass: "Password", gen: "Generate", users: "Users", volume: "Data", expire: "Expires", status: "Status", note: "Note (optional)",
          maxUsers: "Max users", quota: "Total data to sell", days: "Valid for (days)", zero: "0 = unlimited",
          passEdit: "New password (empty = unchanged)", enabled: "Panel is enabled", unlimited: "Unlimited", never: "Never",
          st: { active: "Active", disabled: "Disabled", expired: "Expired" }, left: "days left", ended: "Ended",
          save: "Save", create: "Create panel", cancel: "Cancel", back: "Back", edit: "Edit", del: "Delete", copy: "Copy login info",
          on: "Enable", off: "Disable", close: "Close",
          dom: "Panel domain", domOther: "Another domain…", domThis: "this panel", domHelp: "The reseller panel and its users' subscription links use this domain. Another domain must already be attached to this service in Railway (Settings → Networking → Custom Domain).", created: "Reseller panel created. Send this to the reseller:", panelUrl: "Panel URL", copied: "Copied",
          delQ: "Delete reseller panel “{n}”?", delD: "Its users ({u}) are not deleted, they are moved to your account.",
          saved: "Saved", deleted: "Deleted", loading: "Loading…",
          meD: "Limits of your panel, set by the administrator.", meUsers: "Users created", meVol: "Data used from credit", meExp: "Panel valid until",
          cr: { pk: { bronze: "Bronze", silver: "Silver", gold: "Gold", diamond: "Diamond", custom: "Custom" }, pkCustom: "Your own values", acc: "Reseller account", lim: "Panel limits",
                uHelp: "3-32 letters, digits or _ . - @", uFree: "This username is available", gb: "Total data", days: "Duration (days)", dayW: "days", newP: "New reseller panel",
                okT: "The reseller panel is ready", okD: "Send this to the reseller. This link opens its own panel.", okU: "New login info is ready", copyAll: "Copy all", share: "Share", one: "Copy" },
          st2: ["", "Weak", "Fair", "Good", "Very strong"],
          sumP: "Active panels", sumU: "Users of all resellers", sumG: "Data sold", titleL: "Display name (optional)", search: "Search name, display name or note", fAll: "All", noMatch: "Nothing matches this search.",
          charge: "Charge & renew", chargeD: "Add amounts; a negative number subtracts. An expired panel is renewed from today.", addGb: "Add data", addDays: "Add days", addUsers: "Add user capacity", doCharge: "Apply charge", charged: "Charge applied",
          now: "now", hist: "History", histEmpty: "No activity yet.", renameH: "Edit the username to rename (the reseller must log in again)",
          newCred: "Saved. Send the new login info to the reseller:", minUsers: "At least 10 users · 0 = unlimited",
          hx: { domain: "domain", create: "Panel created", update: "Edited", charge: "Charged", password: "Password changed", rename: "Renamed", max_users: "user capacity", quota: "data", expire: "expiry", enabled: "status", title: "display name", note: "note",
                "user+": "User created", "user-": "User deleted", "user~": "User edited", "user:reset": "User usage reset", "user:revoke_sub": "User sub revoked" },
          e: { bad_domain: "Not a valid domain; write it like panel.example.com", min_capacity: "User capacity must be at least 10 (or 0 for unlimited)", min_quota: "Data must be at least 1 MB (or 0 for unlimited)",
               unlimited_quota: "This panel has unlimited data; set a data limit in Edit first", unlimited_time: "This panel never expires; set a duration in Edit first",
               unlimited_users: "This panel has unlimited users; set a limit in Edit first", nothing: "Enter at least one amount to charge", busy: "Reseller data is temporarily unavailable; try again in a moment",
               bad_username: "Username must be 3-32 characters: letters, digits or _ . - @", password_required: "Enter a password",
               password_too_long: "Password is too long", username_taken: "This username is already taken", reserved: "This username is reserved",
               bad_number: "Check the numbers", not_found: "Reseller not found", sudo_only: "Only the main administrator can open this",
               login_required: "Please log in again", network: "Could not reach the server", other: "Unexpected error, please try again" } }
  };
  RT.ru = {"dom":"Домен панели","domOther":"Другой домен…","domThis":"эта панель","domHelp":"Панель реселлера и ссылки подписки его пользователей используют этот домен. Другой домен должен быть подключён к этому сервису в Railway (Settings → Networking → Custom Domain).","item":"Панели реселлеров","title":"Панели реселлеров","meItem":"Баланс реселлера","meTitle":"Баланс реселлера","add":"Новая панель реселлера","refresh":"Обновить","empty":"Панелей реселлеров пока нет. Создайте первую кнопкой «Новая панель реселлера».","intro":"Каждый реселлер входит в эту же панель под своим именем и паролем и видит только своих пользователей.","name":"Имя пользователя","pass":"Пароль","gen":"Создать","users":"Пользователи","volume":"Трафик","expire":"Срок","status":"Статус","note":"Заметка (необязательно)","maxUsers":"Макс. пользователей","quota":"Трафик на продажу","days":"Срок (дней)","zero":"0 = без ограничений","passEdit":"Новый пароль (пусто = без изменений)","enabled":"Панель включена","unlimited":"Без ограничений","never":"Бессрочно","st":{"active":"Активна","disabled":"Отключена","expired":"Истекла"},"left":"дн. осталось","ended":"Истёк","save":"Сохранить","create":"Создать панель","cancel":"Отмена","back":"Назад","edit":"Изменить","del":"Удалить","copy":"Копировать данные входа","on":"Включить","off":"Отключить","close":"Закрыть","created":"Панель реселлера создана. Отправьте это реселлеру:","panelUrl":"Адрес панели","copied":"Скопировано","delQ":"Удалить панель реселлера «{n}»?","delD":"Его пользователи ({u}) не удаляются, а переходят на ваш аккаунт.","saved":"Сохранено","deleted":"Удалено","loading":"Загрузка…","meD":"Лимиты вашей панели, установленные администратором.","meUsers":"Создано пользователей","meVol":"Использовано трафика","meExp":"Панель действует до","cr":{"pk":{"bronze":"Бронза","silver":"Серебро","gold":"Золото","diamond":"Бриллиант","custom":"Свой"},"pkCustom":"Свои значения","acc":"Аккаунт реселлера","lim":"Лимиты панели","uHelp":"3-32 латинских буквы, цифры или _ . - @","uFree":"Это имя свободно","gb":"Весь трафик","days":"Срок (дней)","dayW":"дн.","newP":"Новая панель реселлера","okT":"Панель реселлера готова","okD":"Отправьте это реселлеру. По этой ссылке открывается его панель.","okU":"Новые данные входа готовы","copyAll":"Копировать всё","share":"Поделиться","one":"Копировать"},"st2":["","Слабый","Средний","Хороший","Очень надёжный"],"sumP":"Активные панели","sumU":"Пользователи всех реселлеров","sumG":"Продано трафика","titleL":"Отображаемое имя (необязательно)","search":"Поиск по имени, отображаемому имени или заметке","fAll":"Все","noMatch":"Ничего не найдено.","charge":"Пополнить и продлить","chargeD":"Добавьте значения; отрицательное число вычитает. Истёкшая панель продлевается с сегодняшнего дня.","addGb":"Добавить трафик","addDays":"Добавить дни","addUsers":"Добавить пользователей","doCharge":"Пополнить","charged":"Пополнение применено","now":"сейчас","hist":"История","histEmpty":"Пока нет действий.","renameH":"Измените имя, чтобы переименовать (реселлеру нужно войти заново)","newCred":"Сохранено. Отправьте реселлеру новые данные входа:","minUsers":"Минимум 10 пользователей · 0 = без ограничений","hx":{"domain":"домен","create":"Панель создана","update":"Изменено","charge":"Пополнено","password":"Пароль изменён","rename":"Переименовано","max_users":"лимит пользователей","quota":"трафик","expire":"срок","enabled":"статус","title":"отображаемое имя","note":"заметка","user+":"Пользователь создан","user-":"Пользователь удалён","user~":"Пользователь изменён","user:reset":"Трафик пользователя сброшен","user:revoke_sub":"Подписка пользователя отозвана"},"e":{"bad_domain":"Неверный домен; укажите, например, panel.example.com","min_capacity":"Лимит пользователей — минимум 10 (или 0 без ограничений)","min_quota":"Трафик — минимум 1 МБ (или 0 без ограничений)","unlimited_quota":"У панели безлимитный трафик; сначала задайте лимит в «Изменить»","unlimited_time":"Панель бессрочная; сначала задайте срок в «Изменить»","unlimited_users":"У панели безлимит пользователей; сначала задайте лимит в «Изменить»","nothing":"Введите хотя бы одно значение","busy":"Данные реселлеров временно недоступны; попробуйте чуть позже","bad_username":"Имя должно содержать 3-32 символа: латинские буквы, цифры или _ . - @","password_required":"Введите пароль","password_too_long":"Пароль слишком длинный","username_taken":"Это имя пользователя уже занято","reserved":"Это имя пользователя зарезервировано","bad_number":"Проверьте числа","not_found":"Реселлер не найден","sudo_only":"Это доступно только главному администратору","login_required":"Войдите заново","network":"Нет связи с сервером","other":"Непредвиденная ошибка, попробуйте ещё раз"}};
  RT.zh = {"dom":"面板域名","domOther":"其他域名…","domThis":"当前面板","domHelp":"代理面板及其用户的订阅链接都使用此域名。其他域名必须已在 Railway 中绑定到此服务（Settings → Networking → Custom Domain）。","item":"代理面板","title":"代理面板","meItem":"代理额度","meTitle":"代理额度","add":"新建代理面板","refresh":"刷新","empty":"还没有代理面板。点击“新建代理面板”创建第一个。","intro":"每个代理使用自己的用户名和密码登录同一个面板，只能看到自己的用户。","name":"用户名","pass":"密码","gen":"生成","users":"用户","volume":"流量","expire":"到期","status":"状态","note":"备注（可选）","maxUsers":"最大用户数","quota":"可售总流量","days":"有效期（天）","zero":"0 = 不限","passEdit":"新密码（留空 = 不修改）","enabled":"面板已启用","unlimited":"不限","never":"永不","st":{"active":"正常","disabled":"已停用","expired":"已过期"},"left":"天剩余","ended":"已结束","save":"保存","create":"创建面板","cancel":"取消","back":"返回","edit":"编辑","del":"删除","copy":"复制登录信息","on":"启用","off":"停用","close":"关闭","created":"代理面板已创建。请把以下信息发给代理：","panelUrl":"面板地址","copied":"已复制","delQ":"删除代理面板“{n}”？","delD":"其用户（{u}）不会被删除，而是转到你的账户下。","saved":"已保存","deleted":"已删除","loading":"加载中…","meD":"管理员为你的面板设置的限额。","meUsers":"已创建用户","meVol":"已用流量额度","meExp":"面板有效期至","cr":{"pk":{"bronze":"青铜","silver":"白银","gold":"黄金","diamond":"钻石","custom":"自定义"},"pkCustom":"自定义数值","acc":"代理账户","lim":"面板限额","uHelp":"3-32 个英文字母、数字或 _ . - @","uFree":"该用户名可用","gb":"总流量","days":"时长（天）","dayW":"天","newP":"新代理面板","okT":"代理面板已就绪","okD":"把这些信息发给代理，通过此链接即可进入其面板。","okU":"新的登录信息已就绪","copyAll":"全部复制","share":"分享","one":"复制"},"st2":["","弱","一般","良好","非常强"],"sumP":"活跃面板","sumU":"所有代理的用户","sumG":"已售流量","titleL":"显示名称（可选）","search":"搜索用户名、显示名称或备注","fAll":"全部","noMatch":"没有匹配的结果。","charge":"充值与续期","chargeD":"填写增加的数值，负数表示扣减。已过期的面板从今天起续期。","addGb":"增加流量","addDays":"增加天数","addUsers":"增加用户名额","doCharge":"确认充值","charged":"充值成功","now":"刚刚","hist":"历史记录","histEmpty":"暂无操作记录。","renameH":"修改用户名即可重命名（代理需要重新登录）","newCred":"已保存。请把新的登录信息发给代理：","minUsers":"至少 10 个用户 · 0 = 不限","hx":{"domain":"域名","create":"创建面板","update":"已编辑","charge":"已充值","password":"已修改密码","rename":"已重命名","max_users":"用户名额","quota":"流量","expire":"到期时间","enabled":"状态","title":"显示名称","note":"备注","user+":"创建用户","user-":"删除用户","user~":"编辑用户","user:reset":"重置用户流量","user:revoke_sub":"撤销用户订阅"},"e":{"bad_domain":"域名无效，例如 panel.example.com","min_capacity":"用户名额至少为 10（或 0 表示不限）","min_quota":"流量至少为 1 MB（或 0 表示不限）","unlimited_quota":"该面板流量不限，请先在“编辑”中设置流量上限","unlimited_time":"该面板永不过期，请先在“编辑”中设置时长","unlimited_users":"该面板用户不限，请先在“编辑”中设置上限","nothing":"请至少填写一项充值数值","busy":"代理数据暂时不可用，请稍后再试","bad_username":"用户名须为 3-32 个字符：英文字母、数字或 _ . - @","password_required":"请输入密码","password_too_long":"密码过长","username_taken":"该用户名已被使用","reserved":"该用户名为保留名称","bad_number":"请检查数字","not_found":"未找到该代理","sudo_only":"只有主管理员可以打开","login_required":"请重新登录","network":"无法连接服务器","other":"发生意外错误，请重试"}};
  function rt(k) { return (RT[lang()] || RT.en)[k]; }
  var GROUP_PATH = "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z";
  var PIE_PATH = "M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z";
  var PEN_PATH = "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125";
  var TRASH_PATH = "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0";
  var COPY_PATH = "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.07-7.5-8.069a8.913 8.913 0 0 0-1.5.124m7.5 10.376V9.375";
  var POWER_PATH = "M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9";
  var SYNC_PATH = "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99";
  var SHARE_PATH = "M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z";
  var PLUS_PATH = "M12 4.5v15m7.5-7.5h-15";
  var CLOCK_PATH = "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
  var BOLT_PATH = "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z";
  var GBY = 1073741824;
  function N(v) { v = Number(v); return isFinite(v) ? Math.max(0, Math.round(v)) : 0; }   // numbers only, never markup
  function H(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function gbTxt(b) { var v = (Number(b) || 0) / GBY; if (v > 0 && v < 1) return Math.max(1, Math.round(v * 1024)) + " MB"; if (v >= 1024 && Math.abs(v / 1024 * 100 - Math.round(v / 1024 * 100)) < 1e-6) return (Math.round(v / 1024 * 100) / 100) + " TB"; return (v >= 100 ? Math.round(v) : Math.round(v * 100) / 100) + " GB"; }
  // 📏 MB / GB / TB picker next to a traffic field: any amount from 1 MB up (the value is always sent in GB)
  var UNITS = [["MB", 1 / 1024], ["GB", 1], ["TB", 1024]];
  function unitField(fld, gbVal) {
    var inp = fld.querySelector("input"), row = fld.querySelector(".jr-row") || inp.parentNode;
    var sel = document.createElement("select"); sel.className = "chakra-select jr-unit " + K("input", "inputPage"); sel.setAttribute("aria-label", L4("واحد", "Unit", "Единица", "单位"));
    UNITS.forEach(function (u) { var o = document.createElement("option"); o.value = u[0]; o.textContent = u[0]; sel.appendChild(o); });
    row.classList.add("jr-urow"); row.insertBefore(sel, inp.nextSibling);
    var fac = function () { for (var i = 0; i < UNITS.length; i++) if (UNITS[i][0] === sel.value) return UNITS[i][1]; return 1; };
    var round = function (x) { return Math.round(x * 1000) / 1000; };
    var api = {
      sel: sel,
      gb: function () { var t = String(inp.value || "").trim(); return t === "" ? 0 : Number(t) * fac(); },
      set: function (g, unit) {                                   // show a GB amount in the most readable unit
        g = Number(g) || 0;
        var u = unit || (g > 0 && g < 1 ? "MB" : g >= 1024 && Math.abs(g / 1024 - Math.round(g / 1024 * 100) / 100) < 1e-9 ? "TB" : "GB");
        sel.value = u; inp.value = g ? String(round(g / fac())) : (g === 0 && inp.value !== "" ? "0" : inp.value);
      }
    };
    sel.onchange = function () { inp.dispatchEvent(new Event("input", { bubbles: true })); };
    if (gbVal != null) api.set(gbVal); else sel.value = "GB";
    inp.step = "any"; inp.inputMode = "decimal";
    fld.jxUnit = api; return api;
  }
  function dTxt(ts) {
    if (!ts) return rt("never");
    try { return new Date(ts * 1000).toLocaleDateString(loc(), { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return new Date(ts * 1000).toISOString().slice(0, 10); }
  }
  function dtTxt(ts) { try { return new Date(ts * 1000).toLocaleString(loc(), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " "); } }
  function daysLeft(ts) { return ts ? Math.ceil((ts * 1000 - Date.now()) / 86400000) : 0; }
  function jx(method, path, body) {
    var h = { "Authorization": "Bearer " + token() }; if (body) h["Content-Type"] = "application/json";
    return tfetch(path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: "other" }; }).then(function (j) { if (!r.ok || !j || j.ok === false) throw { code: (j && j.error) || (r.status === 401 ? "login_required" : r.status === 503 ? "busy" : "other") }; return j; }); },
            function () { throw { code: "network" }; });
  }
  function rerr(e) { var E = rt("e"); return E[e && e.code] || E.other; }
  // copy engine: synchronous inside the click (instant, iOS-safe) -> Clipboard API with a time limit -> manual box
  var IOS = /iP(hone|od|ad)/.test(navigator.platform || "") || (/Mac/.test(navigator.platform || "") && navigator.maxTouchPoints > 1);
  function legacyCopy(text) {
    var act = document.activeElement, sel = window.getSelection ? window.getSelection() : null, ok = false;
    var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("aria-hidden", "true"); ta.setAttribute("tabindex", "-1");
    ta.style.cssText = "position:fixed;top:0;left:0;width:2px;height:2px;padding:0;border:0;margin:0;opacity:0;font-size:16px;pointer-events:none";
    (document.querySelector(".chakra-modal__content-container") || document.body).appendChild(ta);   // inside an open dialog: focus traps can't block it
    try {
      if (IOS) { ta.contentEditable = "true"; ta.readOnly = false; var r = document.createRange(); r.selectNodeContents(ta); if (sel) { sel.removeAllRanges(); sel.addRange(r); } ta.setSelectionRange(0, text.length); }
      else { ta.readOnly = true; try { ta.focus({ preventScroll: true }); } catch (x) { ta.focus(); } ta.select(); ta.setSelectionRange(0, text.length); }
      ok = !!document.execCommand("copy");
    } catch (e) { ok = false; }
    ta.remove(); try { if (sel) sel.removeAllRanges(); } catch (e) {}
    try { if (act && act.focus && act !== document.body) act.focus({ preventScroll: true }); } catch (e) {}
    return ok;
  }
  function copyText(txt) {
    txt = String(txt == null ? "" : txt);
    if (legacyCopy(txt)) return Promise.resolve();
    return new Promise(function (ok, no) {
      if (!(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext)) { manualCopy(txt); return no(); }
      var done = false, fin = function (v) { if (done) return; done = true; if (v) ok(); else { manualCopy(txt); no(); } };
      setTimeout(function () { fin(false); }, 1200);
      try { navigator.clipboard.writeText(txt).then(function () { fin(true); }, function () { fin(false); }); } catch (e) { fin(false); }
    });
  }
  function manualCopy(txt) {          // last resort: a small native-looking box with the text selected
    var old = document.getElementById("jinx-manual"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "jinx-manual";
    d.style.cssText = "position:fixed;inset:0;z-index:6000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);padding:16px";
    var box = document.createElement("div");
    box.style.cssText = "width:min(30rem,100%);background:var(--chakra-colors-gray-700,#2d3748);color:#fff;border-radius:var(--chakra-radii-md,.375rem);padding:1rem;box-shadow:var(--chakra-shadows-lg,0 10px 25px rgba(0,0,0,.3));font:inherit";
    var tt = document.createElement("div"); tt.style.cssText = "font-weight:700;margin-bottom:.5rem"; tt.textContent = L4("کپی دستی: متن را نگه دارید و Copy را بزنید", "Copy manually: select the text and choose Copy", "Скопируйте вручную: выделите текст и выберите «Копировать»", "请手动复制：选中文本后选择“复制”");
    var ta = document.createElement("textarea"); ta.readOnly = true; ta.value = txt; ta.dir = "ltr";
    ta.style.cssText = "width:100%;min-height:7rem;box-sizing:border-box;border-radius:.375rem;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.25);color:inherit;padding:.6rem;font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;resize:vertical";
    var cl = document.createElement("button"); cl.type = "button"; cl.textContent = L4("بستن", "Close", "Закрыть", "关闭");
    cl.style.cssText = "margin-top:.6rem;height:2.25rem;padding:0 1rem;border:0;border-radius:.375rem;background:var(--chakra-colors-primary-500,#3182ce);color:#fff;font-weight:600;cursor:pointer";
    box.appendChild(tt); box.appendChild(ta); box.appendChild(cl); d.appendChild(box); document.body.appendChild(d);
    var close = function () { d.remove(); }; cl.onclick = close; d.addEventListener("mousedown", function (e) { if (e.target === d) close(); });
    setTimeout(function () { try { ta.focus(); ta.select(); } catch (e) {} }, 50);
  }
  function rsCss() {
    if (document.getElementById("jinx-rs-css")) return;
    var s = document.createElement("style"); s.id = "jinx-rs-css";
    var B = "var(--chakra-colors-chakra-border-color,#e2e8f0)", P = "var(--chakra-colors-primary-500,var(--chakra-colors-blue-500,#3182ce))";
    var SUB = "var(--chakra-colors-chakra-subtle-bg,var(--chakra-colors-gray-50,#f7fafc))";
    s.textContent =
      ".jinx-rs .chakra-modal__content{max-width:min(52rem,calc(100vw - 2rem))!important}" +
      ".jinx-rs.jinx-sm .chakra-modal__content{max-width:min(28rem,calc(100vw - 2rem))!important}" +
      ".jinx-rs .jr-bar{display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem}" +
      ".jinx-rs .jr-intro{font-size:var(--chakra-fontSizes-sm,.875rem);opacity:.7;line-height:1.7;flex:1;min-width:12rem}" +
      ".jinx-rs .jr-acts{display:flex;gap:.5rem;flex-shrink:0}" +
      ".jinx-rs .jr-tbl{width:100%;border-collapse:collapse;font-size:var(--chakra-fontSizes-sm,.875rem)}" +
      ".jinx-rs .jr-tbl th{font-size:var(--chakra-fontSizes-xs,.75rem);font-weight:var(--chakra-fontWeights-bold,700);text-transform:uppercase;letter-spacing:.05em;opacity:.65;text-align:start;padding:.6rem .75rem;border-bottom:1px solid " + B + ";white-space:nowrap}" +
      ".jinx-rs .jr-tbl td{padding:.75rem;border-bottom:1px solid " + B + ";vertical-align:middle}" +
      ".jinx-rs .jr-tbl tr:last-child td{border-bottom:0}" +
      ".jinx-rs .jr-tbl tbody tr{transition:background .15s}.jinx-rs .jr-tbl tbody tr:hover{background:" + SUB + "}" +
      ".chakra-ui-dark .jinx-rs .jr-tbl tbody tr:hover{background:var(--chakra-colors-whiteAlpha-50,rgba(255,255,255,.04))}" +
      ".jinx-rs .jr-wrap{border:1px solid " + B + ";border-radius:var(--chakra-radii-md,.375rem);overflow:hidden}" +
      ".jinx-rs .jr-n{font-weight:600;direction:ltr;unicode-bidi:isolate}.jinx-rs .jr-note{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6;max-width:12rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".jinx-rs .jr-ltr{direction:ltr;unicode-bidi:isolate;white-space:nowrap}" +
      ".jinx-rs .jr-badge{display:inline-block;padding:0 .4rem;border-radius:var(--chakra-radii-sm,.125rem);font-size:var(--chakra-fontSizes-xs,.75rem);font-weight:700;text-transform:uppercase;line-height:1.5;white-space:nowrap}" +
      ".jinx-rs .jr-b-active{background:var(--chakra-colors-green-100,#c6f6d5);color:var(--chakra-colors-green-800,#22543d)}" +
      ".jinx-rs .jr-b-disabled{background:var(--chakra-colors-gray-100,#edf2f7);color:var(--chakra-colors-gray-800,#1a202c)}" +
      ".jinx-rs .jr-b-expired{background:var(--chakra-colors-red-100,#fed7d7);color:var(--chakra-colors-red-800,#822727)}" +
      ".chakra-ui-dark .jinx-rs .jr-b-active{background:rgba(154,230,180,.16);color:var(--chakra-colors-green-200,#9ae6b4)}" +
      ".chakra-ui-dark .jinx-rs .jr-b-disabled{background:rgba(226,232,240,.16);color:var(--chakra-colors-gray-200,#e2e8f0)}" +
      ".chakra-ui-dark .jinx-rs .jr-b-expired{background:rgba(254,178,178,.16);color:var(--chakra-colors-red-200,#feb2b2)}" +
      ".jinx-rs .jr-prog{height:.375rem;border-radius:9999px;background:var(--chakra-colors-gray-100,#edf2f7);overflow:hidden;margin-top:.35rem;min-width:5rem}" +
      ".chakra-ui-dark .jinx-rs .jr-prog{background:var(--chakra-colors-whiteAlpha-300,rgba(255,255,255,.16))}" +
      ".jinx-rs .jr-prog i{display:block;height:100%;border-radius:inherit;background:" + P + ";transition:width .4s}" +
      ".jinx-rs .jr-prog.w i{background:var(--chakra-colors-orange-400,#ed8936)}.jinx-rs .jr-prog.f i{background:var(--chakra-colors-red-400,#f56565)}" +
      ".jinx-rs .jr-sm{font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.65}" +
      ".jinx-rs .jr-ib{display:inline-grid;grid-template-columns:repeat(3,auto);gap:.25rem;justify-content:end}" +
      ".jinx-rs button.jr-icon{width:2rem;height:2rem;min-width:2rem;padding:0!important}" +
      ".jinx-rs button.jr-icon.jr-danger:hover{color:var(--chakra-colors-red-400,#f56565)}" +
      ".jinx-rs button.chakra-button.jp-own.jp-danger{background:var(--chakra-colors-red-500,#e53e3e);color:#fff}.jinx-rs button.chakra-button.jp-own.jp-danger:hover{background:var(--chakra-colors-red-600,#c53030)}" +
      ".jinx-rs .jr-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.jinx-rs .jr-full{grid-column:1/-1}" +
      ".jinx-rs .jr-help{font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6;margin-top:.35rem}" +
      ".jinx-rs .jr-dom,.jinx-rs .jr-row.jr-dom{display:flex;gap:.5rem;flex-wrap:wrap!important}@media (max-width:640px){.jinx-rs .jr-dom select,.jinx-rs .jr-dom input{flex:1 1 100%!important}}.jinx-rs .jr-dom select{flex:1 1 12rem;min-width:0;direction:ltr;cursor:pointer;background-color:transparent;color:inherit;height:var(--chakra-sizes-10,2.5rem);border-radius:var(--chakra-radii-md,.375rem)}" +
      ".jinx-rs .jr-help[hidden]{display:none!important}.jinx-rs .jr-dom input{flex:1 1 12rem;min-width:0;direction:ltr}.chakra-ui-dark .jinx-rs .jr-dom option{background:#2d3748}.jinx-rs .jr-help.jc-bad{color:#e53e3e;opacity:1}" +
      ".jinx-rs .jr-row{display:flex;gap:.5rem}.jinx-rs .jr-row input{flex:1}" +
      ".jinx-rs .jr-chips{display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.5rem}" +
      ".jinx-rs .jr-chip{height:1.6rem!important;font-size:var(--chakra-fontSizes-xs,.75rem)!important;padding-inline:.6rem!important}" +
      ".jinx-rs .jr-cred{border:1px dashed " + B + ";border-radius:var(--chakra-radii-md,.375rem);padding:.75rem 1rem;display:flex;flex-direction:column;gap:.5rem;font-size:var(--chakra-fontSizes-sm,.875rem)}" +
      ".jinx-rs .jr-cred div{display:flex;justify-content:space-between;gap:1rem}.jinx-rs .jr-cred b{direction:ltr;unicode-bidi:isolate;word-break:break-all;text-align:end}" +
      ".jinx-rs .jr-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1rem}" +
      ".jinx-rs .jr-card{border:1px solid " + B + ";border-radius:var(--chakra-radii-md,.375rem);padding:.75rem 1rem}" +
      ".jinx-rs .jr-card>span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.65}.jinx-rs .jr-card b{display:block;font-size:var(--chakra-fontSizes-lg,1.125rem);margin-top:.15rem}" +
      ".jinx-rs .jr-empty{text-align:center;padding:2rem 1rem;opacity:.7;font-size:var(--chakra-fontSizes-sm,.875rem);line-height:1.8}" +
      ".jinx-rs .jr-sp{display:inline-block;width:1rem;height:1rem;border:2px solid currentColor;border-bottom-color:transparent;border-radius:50%;animation:jrs .6s linear infinite;vertical-align:-3px}@keyframes jrs{to{transform:rotate(360deg)}}" +
      ".jinx-rs .jr-spin svg{animation:jrs .7s linear infinite}" +
      ".jinx-rs input.chakra-input{direction:ltr;text-align:start}" +
      ".jinx-rs .jr-find{display:flex;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap}.jinx-rs .jr-find input{flex:1 1 14rem;min-width:0;direction:auto!important}.jinx-rs .jr-find select{flex:0 0 auto;width:auto;min-width:8rem;padding-inline:.75rem}" +
      "#jinx-welcome{position:fixed;top:14px;left:50%;transform:translate(-50%,-150%);opacity:0;z-index:1300;width:min(560px,calc(100vw - 24px));transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .4s;pointer-events:auto}" +
      "#jinx-welcome.on{transform:translate(-50%,0);opacity:1}" +
      "#jinx-welcome .jw-card{margin:0!important;max-width:none!important;width:100%!important;padding:1rem 1.1rem 1.05rem;position:relative;overflow:hidden;border-radius:var(--chakra-radii-lg,.5rem)}" +
      "#jinx-welcome .jw-glow{position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg," + P + ",var(--chakra-colors-purple-400,#9f7aea)," + P + ");background-size:200% 100%;animation:jwg 3s linear infinite}@keyframes jwg{to{background-position:200% 0}}" +
      "#jinx-welcome .jw-head{display:flex;align-items:center;gap:.75rem}#jinx-welcome .jw-t{flex:1;min-width:0}" +
      "#jinx-welcome .jw-t b{display:block;font-size:var(--chakra-fontSizes-md,1rem);font-weight:700}#jinx-welcome .jw-t span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.7;line-height:1.6}" +
      "#jinx-welcome .jw-x{position:static!important;flex:none}" +
      "#jinx-welcome .jw-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin-top:.85rem}" +
      "#jinx-welcome .jw-stats>div{border:1px solid " + B + ";border-radius:var(--chakra-radii-md,.375rem);padding:.45rem .65rem;min-width:0}" +
      "#jinx-welcome .jw-stats span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6}#jinx-welcome .jw-stats b{display:block;font-size:var(--chakra-fontSizes-sm,.875rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "@media (max-width:440px){#jinx-welcome .jw-stats{grid-template-columns:1fr 1fr}#jinx-welcome .jw-stats>div:last-child{grid-column:1/-1}}" +
      // ✨ create wizard
      ".jinx-rs .jc-pk{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.5rem;margin-bottom:1rem}" +
      ".jinx-rs .jc-p{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;padding:.65rem .75rem;border-radius:var(--chakra-radii-md,.375rem);border:1px solid " + B + ";background:transparent;color:inherit;cursor:pointer;text-align:start;transition:border-color .2s,box-shadow .2s,transform .15s,background .2s;font:inherit;overflow:hidden}" +
      ".jinx-rs .jc-p:hover{transform:translateY(-1px)}.jinx-rs .jc-p b{font-size:var(--chakra-fontSizes-sm,.875rem);font-weight:700}.jinx-rs .jc-p small{font-size:.7rem;opacity:.65;white-space:nowrap}" +
      ".jinx-rs .jc-p::before{content:'';position:absolute;inset:0 0 auto 0;height:3px;background:var(--jc-c,#a0aec0)}" +
      ".jinx-rs .jc-bronze{--jc-c:linear-gradient(90deg,#c97b48,#e8a87c)}.jinx-rs .jc-silver{--jc-c:linear-gradient(90deg,#a0aec0,#e2e8f0)}.jinx-rs .jc-gold{--jc-c:linear-gradient(90deg,#d69e2e,#f6e05e)}.jinx-rs .jc-diamond{--jc-c:linear-gradient(90deg,#4fd1c5,#9f7aea)}.jinx-rs .jc-custom{--jc-c:linear-gradient(90deg," + P + "," + P + ")}" +
      ".jinx-rs .jc-p.on{border-color:" + P + ";box-shadow:0 0 0 1px " + P + ";background:rgba(66,153,225,.08)}" +
      ".jinx-rs .jc-grid{display:grid;grid-template-columns:minmax(0,1fr) 15.5rem;gap:1.1rem;align-items:start}.jinx-rs .jc-form{display:flex;flex-direction:column;gap:.85rem;min-width:0}" +
      ".jinx-rs .jc-sec{font-size:var(--chakra-fontSizes-xs,.75rem);font-weight:700;letter-spacing:.04em;opacity:.6;text-transform:uppercase;display:flex;align-items:center;gap:.5rem}.jinx-rs .jc-sec::after{content:'';flex:1;height:1px;background:" + B + "}" +
      ".jinx-rs .jc-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}" +
      ".jinx-rs .jc-ok{color:var(--chakra-colors-green-400,#48bb78);opacity:1}.jinx-rs .jc-bad{color:var(--chakra-colors-red-400,#f56565);opacity:1}" +
      ".jinx-rs .jc-bar{display:inline-grid;grid-template-columns:repeat(4,1fr);gap:3px;width:5rem;vertical-align:middle;margin-inline-end:.5rem}.jinx-rs .jc-bar i{height:4px;border-radius:4px;background:var(--chakra-colors-gray-200,#e2e8f0)}.chakra-ui-dark .jinx-rs .jc-bar i{background:rgba(255,255,255,.14)}" +
      ".jinx-rs .jc-bar[data-s='1'] i:nth-child(1){background:#f56565}.jinx-rs .jc-bar[data-s='2'] i:nth-child(-n+2){background:#ed8936}.jinx-rs .jc-bar[data-s='3'] i:nth-child(-n+3){background:#48bb78}.jinx-rs .jc-bar[data-s='4'] i{background:#38a169}" +
      ".jinx-rs .jc-prev{position:sticky;top:0}.jinx-rs .jc-pc{position:relative;overflow:hidden;border-radius:var(--chakra-radii-lg,.5rem);padding:1rem;color:#fff;background:linear-gradient(145deg,#2b6cb0 0%,#553c9a 60%,#1a202c 100%);box-shadow:0 18px 40px -18px rgba(66,153,225,.8)}" +
      ".jinx-rs .jc-glow{position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(255,255,255,.18),transparent 30%);animation:jcspin 8s linear infinite;pointer-events:none}@keyframes jcspin{to{transform:rotate(1turn)}}" +
      ".jinx-rs .jc-pc>*{position:relative}.jinx-rs .jc-tag{display:inline-block;font-size:.65rem;font-weight:700;padding:.1rem .5rem;border-radius:999px;background:rgba(255,255,255,.18);margin-bottom:.6rem}" +
      ".jinx-rs .jc-nm{display:block;font-size:1.05rem;font-weight:700;line-height:1.35;overflow-wrap:anywhere}.jinx-rs .jc-un{display:block;font-size:.75rem;opacity:.75;margin-bottom:.8rem;overflow-wrap:anywhere}" +
      ".jinx-rs .jc-kv{display:grid;grid-template-columns:1fr;gap:.35rem}.jinx-rs .jc-kv div,.jinx-rs .jc-url{display:flex;justify-content:space-between;gap:.5rem;font-size:.78rem;padding:.35rem .55rem;border-radius:.35rem;background:rgba(0,0,0,.18)}" +
      ".jinx-rs .jc-kv span,.jinx-rs .jc-url span{opacity:.75}.jinx-rs .jc-url{margin-top:.5rem;flex-direction:column;gap:.1rem}.jinx-rs .jc-url b{font-size:.75rem;word-break:break-all}" +
      ".jinx-rs .jc-ok-h{display:flex;align-items:center;gap:.85rem;margin-bottom:1rem;padding:.85rem 1rem;border-radius:var(--chakra-radii-md,.375rem);background:rgba(72,187,120,.12);border:1px solid rgba(72,187,120,.35)}" +
      ".jinx-rs .jc-ok-i{flex:none;width:2.6rem;height:2.6rem;border-radius:50%;display:grid;place-items:center;color:#fff;background:var(--chakra-colors-green-500,#38a169);animation:jcpop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes jcpop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}" +
      ".jinx-rs .jc-ok-h b{display:block;font-weight:700}.jc-ok-h>div{flex:1 1 auto;min-width:0;display:block}.jc-ok-h>div>span{white-space:normal;line-height:1.7}.jc-cred>div>span{flex:none;opacity:.75;white-space:nowrap}.jc-cred b{min-width:0}.jinx-rs .jc-ok-h div span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.75}" +
      ".jinx-rs .jc-cred div{align-items:center}.jinx-rs .jc-cred b{flex:1}.jinx-rs .jc-c1{width:1.8rem!important;height:1.8rem!important;min-width:1.8rem!important;flex:none}.jinx-rs .jc-c1.jc-done{color:var(--chakra-colors-green-400,#48bb78)}" +
      "@media (max-width:700px){.jinx-rs .jc-grid{grid-template-columns:1fr;gap:.9rem}.jinx-rs .jc-prev{position:static;order:-1}.jinx-rs .jc-pk{display:flex;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;gap:.5rem;margin:0 -.25rem .9rem;padding:.25rem .25rem .35rem}.jinx-rs .jc-pk::-webkit-scrollbar{display:none}.jinx-rs .jc-p{flex:0 0 7.6rem;scroll-snap-align:start}.jinx-rs .jc-p:hover{transform:none}.jinx-rs .jc-pc{padding:.8rem .9rem}.jinx-rs .jc-glow{display:none}.jinx-rs .jc-tag{margin-bottom:.35rem}.jinx-rs .jc-nm{font-size:.95rem}.jinx-rs .jc-un{margin-bottom:.55rem}.jinx-rs .jc-kv{grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem}.jinx-rs .jc-kv div{flex-direction:column;align-items:flex-start;gap:.1rem;padding:.4rem .5rem;min-width:0}.jinx-rs .jc-kv b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.jinx-rs .jc-url{flex-direction:row;align-items:center;justify-content:space-between}.jinx-rs .jc-url span{flex:none}.jinx-rs .jc-url b{text-align:end}.jinx-rs .chakra-modal__footer.jc-foot{position:sticky;bottom:0;z-index:2;background:inherit}.jinx-rs .jc-foot>button{flex:1 1 0;min-width:0}.jinx-rs .jc-foot>button:last-child{flex-grow:1.6}}" +
      "@media (max-width:420px){.jinx-rs .jc-3{grid-template-columns:1fr 1fr}.jinx-rs .jc-3>div:last-child{grid-column:1/-1}}" +
      ".jinx-rs .jr-sum .jr-card{position:relative;overflow:hidden}.jinx-rs .jr-sum .jr-card::before{content:'';position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg," + P + ",var(--chakra-colors-purple-400,#9f7aea))}" +
      ".jinx-rs .jr-sum b small{font-size:.75em;opacity:.55;font-weight:600}" +
      "@media (max-width:640px){.jinx-rs .jr-sum{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.4rem}.jinx-rs .jr-sum .jr-card{padding:.5rem .6rem}.jinx-rs .jr-sum .jr-card b{font-size:.95rem}.jinx-rs .jr-sum .jr-card>span{font-size:.68rem;line-height:1.35;white-space:normal;overflow-wrap:anywhere;min-height:1.85em}}" +
      ".jinx-rs .jr-find select{background-color:transparent;color:inherit;height:var(--chakra-sizes-10,2.5rem);border-radius:var(--chakra-radii-md,.375rem);cursor:pointer}.chakra-ui-dark .jinx-rs .jr-find select option{background:var(--chakra-colors-gray-700,#2d3748);color:#fff}" +
      ".jinx-rs .jr-cellv>span:first-child{white-space:nowrap}" +
      ".jinx-rs .jr-ttl{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);font-weight:600;opacity:.85;line-height:1.5;margin-bottom:2px}.jinx-rs .jr-ttl+.jr-n{display:block;line-height:1.4}" +
      ".jinx-rs .jr-hist{display:flex;flex-direction:column;border:1px solid " + B + ";border-radius:var(--chakra-radii-md,.375rem);max-height:22rem;overflow:auto}" +
      ".jinx-rs .jr-hist div{display:flex;justify-content:space-between;gap:1rem;padding:.55rem .85rem;border-bottom:1px solid " + B + ";font-size:var(--chakra-fontSizes-sm,.875rem)}.jinx-rs .jr-hist div:last-child{border-bottom:0}" +
      ".jinx-rs .jr-hist b{font-weight:600}.jinx-rs .jr-hist i{font-style:normal;opacity:.6;font-size:var(--chakra-fontSizes-xs,.75rem);white-space:nowrap;direction:ltr;unicode-bidi:isolate}" +
      ".jinx-rs .jr-hist span.jr-ltr{white-space:normal;word-break:break-all}" +
      "@media (max-width:640px){.jinx-rs .jr-tbl *{box-sizing:border-box}.jinx-rs .jr-wrap{overflow:visible}.jinx-rs .jr-tbl thead{display:none}.jinx-rs .jr-tbl,.jinx-rs .jr-tbl tbody,.jinx-rs .jr-tbl tr,.jinx-rs .jr-tbl td{display:block;width:100%}" +
        ".jinx-rs .jr-tbl tr{padding:.75rem;border-bottom:1px solid " + B + "}.jinx-rs .jr-tbl tr:last-child{border-bottom:0}" +
        ".jinx-rs .jr-tbl td{border:0;padding:.2rem 0;display:flex;min-width:0;justify-content:space-between;align-items:center;gap:1rem}" +
        ".jinx-rs .jr-tbl td[data-l]::before{content:attr(data-l);font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6;flex-shrink:0}" +
        ".jinx-rs .jr-tbl td.jr-first{padding-bottom:.4rem}.jinx-rs .jr-tbl td .jr-ib{display:flex;flex-wrap:wrap;width:100%;justify-content:flex-end;padding-top:.4rem}"+".jinx-rs .jr-tbl td .jr-cellv{text-align:end;min-width:0}.jinx-rs .jr-prog{min-width:6rem}" +
        ".jinx-rs .jr-grid{grid-template-columns:1fr}.jinx-rs .jr-stat{grid-template-columns:1fr}.jinx-rs .jr-acts{width:100%}.jinx-rs .jr-acts button{flex:1;min-width:0;white-space:normal;height:auto!important;min-height:2.5rem;padding-block:.4rem;line-height:1.25;text-align:center}}";
    document.head.appendChild(s);
  }

  // one dialog frame, identical to the panel's own dialogs
  function frame(id, icon, title, small) {
    capture(); css(); rsCss();
    var old = document.getElementById(id); if (old) { if (old.__dispose) old.__dispose(); else old.remove(); }
    var w = document.createElement("div"); w.id = id; w.className = "chakra-portal jinx-rs" + (small ? " jinx-sm" : "");
    w.setAttribute("dir", dirOf());
    w.innerHTML =
      '<div class="chakra-modal__overlay ' + K("overlay") + '"></div>' +
      '<div class="chakra-modal__content-container ' + K("container") + '">' +
        '<section class="chakra-modal__content ' + K("content") + '" role="dialog" aria-modal="true" tabindex="-1">' +
          '<header class="chakra-modal__header ' + K("header") + '"><div class="jp-head"><div class="jp-icon ' + K("icon") + '">' + svg(icon, 20) + '</div>' +
            '<p class="jp-title ' + K("title") + '"></p></div></header>' +
          '<button type="button" aria-label="' + H(L4("بستن", "Close", "Закрыть", "关闭")) + '" class="chakra-modal__close-btn ' + K("close") + '"><svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="12" height="12"><path fill="currentColor" d="M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z"></path></svg></button>' +
          '<div class="chakra-modal__body ' + K("body") + '"></div>' +
          '<footer class="chakra-modal__footer ' + K("footer") + '"></footer>' +
        '</section></div>';
    document.body.appendChild(w);
    var q = function (s) { return w.querySelector(s); };
    q(".jp-title").textContent = title;
    var bo = document.body.style.overflow; document.body.style.overflow = "hidden";
    var f = { w: w, q: q, body: q(".chakra-modal__body"), foot: q(".chakra-modal__footer"), busy: false };
    var onKey = function (e) { if (e.key === "Escape") f.close(); };
    f.close = function () { if (f.busy) return; w.__dispose(); };
    w.__dispose = function () { w.remove(); document.removeEventListener("keydown", onKey); document.body.style.overflow = bo; };
    document.addEventListener("keydown", onKey);
    q(".chakra-modal__content-container").addEventListener("mousedown", function (e) { if (e.target === e.currentTarget) f.close(); });
    q(".chakra-modal__close-btn").onclick = function () { f.close(); };
    f.btn = function (label, kind, icon) {   // kind: primary | secondary | danger
      var cls = kind === "primary" ? K("btnPrimary", "btnPage") : kind === "danger" ? "jp-own" : K("btnSecondary");
      var b = document.createElement("button"); b.type = "button";
      b.className = "chakra-button jp-" + kind + " " + cls;
      if (kind === "danger" && cls === "jp-own") b.className += " jp-danger";
      b.innerHTML = (icon ? svg(icon, 16) + '<span style="margin-inline-start:.4rem"></span>' : "<span></span>");
      b.lastChild.textContent = label;
      if (kind === "danger" && cls !== "jp-own") b.style.cssText = "background:var(--chakra-colors-red-500,#e53e3e);color:#fff";
      return b;
    };
    f.iconBtn = function (icon, label, danger) {
      var b = document.createElement("button"); b.type = "button"; b.title = label; b.setAttribute("aria-label", label);
      b.className = "chakra-button jp-secondary jr-icon " + K("btnSecondary") + (danger ? " jr-danger" : ""); b.innerHTML = svg(icon, 16); return b;
    };
    f.msg = function (txt, ok) {
      var m = q(".jp-m"); if (!m) { m = document.createElement("div"); m.className = "jp-m"; m.setAttribute("role", "status"); m.style.marginTop = ".75rem"; f.body.appendChild(m); }
      m.className = "jp-m " + (ok ? "s" : "e"); m.textContent = txt || "";
    };
    f.load = function (b, on) { b.disabled = !!on; if (on) { b._h = b.innerHTML; b.innerHTML = '<span class="jr-sp"></span>'; } else if (b._h) b.innerHTML = b._h; };
    return f;
  }
  // 🌐 reseller panel address: this panel's own domain, another domain of this service, or one you type
  function agentUrl(dom) { return (dom ? "https://" + dom : location.origin) + "/agent/"; }
  function cleanDom(v) { v = String(v || "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[\/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, ""); return v; }
  function domOk(v) { return !v || /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(v); }
  function domField(id, cur, doms, onchange) {
    var here = cleanDom(location.host), list = [];
    [here].concat(doms || []).forEach(function (d) { d = cleanDom(d); if (d && list.indexOf(d) < 0) list.push(d); });
    cur = cleanDom(cur); if (cur === here) cur = "";
    var d = document.createElement("div"); d.className = "chakra-form-control jr-full " + K("fc");
    d.innerHTML = '<label for="' + id + '" class="chakra-form__label ' + K("label") + '"></label><div class="jr-row jr-dom"><select id="' + id + '" class="chakra-select ' + K("input", "inputPage") + '"></select>' +
      '<input class="chakra-input ' + K("input", "inputPage") + '" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="url" placeholder="panel.example.com"></div><div class="jr-help"></div>';
    d.querySelector("label").textContent = rt("dom");
    var sel = d.querySelector("select"), inp = d.querySelector("input"), help = d.querySelector(".jr-help");
    list.forEach(function (x) { var o = document.createElement("option"); o.value = x === here ? "" : x; o.textContent = x + (x === here ? " · " + rt("domThis") : ""); sel.appendChild(o); });
    var oo = document.createElement("option"); oo.value = "*"; oo.textContent = rt("domOther"); sel.appendChild(oo);
    var known = !cur || list.indexOf(cur) >= 0;
    sel.value = known ? cur : "*"; inp.value = known ? "" : cur;
    var paint = function () { inp.style.display = sel.value === "*" ? "" : "none"; var v = api.value(); help.textContent = v === null ? rt("e").bad_domain : sel.value === "*" ? rt("domHelp") : ""; help.hidden = !help.textContent; help.classList.toggle("jc-bad", v === null); if (onchange) onchange(); };
    var api = { el: d, value: function () { var v = sel.value === "*" ? cleanDom(inp.value) : sel.value; if (sel.value === "*" && !v) return null; return domOk(v) ? (v === here ? "" : v) : null; },
                host: function () { var v = api.value(); return v || here; } };
    sel.onchange = function () { paint(); if (sel.value === "*") inp.focus(); }; inp.oninput = paint;
    paint();
    return api;
  }
  function fieldEl(id, label, value, type, help, extra) {
    var d = document.createElement("div"); d.className = "chakra-form-control " + K("fc") + (extra || "");
    d.innerHTML = '<label for="' + id + '" class="chakra-form__label ' + K("label") + '"></label><div class="jr-row"><input id="' + id + '" class="chakra-input ' + K("input", "inputPage") + '" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' + (help != null ? '<div class="jr-help"></div>' : "");
    d.querySelector("label").textContent = label; var i = d.querySelector("input"); i.type = type || "text"; i.value = value == null ? "" : value;
    if (help != null) d.querySelector(".jr-help").textContent = help;
    return d;
  }
  function genPass() {   // 14 chars, always upper + lower + digit + one easy symbol (safe to type on phones)
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZ", b = "abcdefghijkmnpqrstuvwxyz", d = "23456789", sy = "@#_-", all = A + b + d, r = new Uint32Array(16), out = [];
    (window.crypto || window.msCrypto).getRandomValues(r);
    for (var i = 0; i < 10; i++) out.push(all[r[i] % all.length]);
    out.push(A[r[10] % A.length], b[r[11] % b.length], d[r[12] % d.length], sy[r[13] % sy.length]);
    for (var j = out.length - 1; j > 0; j--) { var k = r[(j + 14) % 16] % (j + 1), t = out[j]; out[j] = out[k]; out[k] = t; }
    if (!/[A-Za-z0-9]/.test(out[0])) { var z = out[0]; out[0] = out[1]; out[1] = z; }
    return out.join("");
  }

  function openResellers() {
    var f = frame("jinx-rs", GROUP_PATH, rt("title"));
    var list = [], DOMS = [], qText = "", qState = "";
    function toolbar() {
      var bar = document.createElement("div"); bar.className = "jr-bar";
      bar.innerHTML = '<div class="jr-intro"></div><div class="jr-acts"></div>'; bar.firstChild.textContent = rt("intro");
      var rf = f.btn(rt("refresh"), "secondary", SYNC_PATH), add = f.btn(rt("add"), "primary", PLUS_PATH);
      rf.onclick = function () { rf.classList.add("jr-spin"); load(function () { rf.classList.remove("jr-spin"); }); };
      add.onclick = function () { create(); };
      bar.lastChild.appendChild(rf); bar.lastChild.appendChild(add);
      return bar;
    }
    function table() {
      f.foot.classList.remove("jc-foot"); f.body.innerHTML = ""; f.foot.innerHTML = ""; f.body.appendChild(toolbar());
      var close = f.btn(rt("close"), "secondary"); close.onclick = f.close; f.foot.appendChild(close);
      if (!list.length) { var e = document.createElement("div"); e.className = "jr-empty"; e.textContent = rt("empty"); f.body.appendChild(e); return; }
      var act = list.filter(function (r) { return r.state === "active"; }).length, su = 0, sg = 0; list.forEach(function (r) { su += r.users || 0; sg += r.charge || 0; });
      var sm = document.createElement("div"); sm.className = "jr-stat jr-sum";
      sm.innerHTML = '<div class="jr-card"><span>' + H(rt("sumP")) + '</span><b class="jr-ltr">' + act + ' <small>/ ' + list.length + '</small></b></div>' +
        '<div class="jr-card"><span>' + H(rt("sumU")) + '</span><b class="jr-ltr">' + su + '</b></div>' +
        '<div class="jr-card"><span>' + H(rt("sumG")) + '</span><b class="jr-ltr">' + H(gbTxt(sg)) + '</b></div>';
      f.body.appendChild(sm);
      if (list.length > 3 || qText || qState) {              // search + status filter
        var fd = document.createElement("div"); fd.className = "jr-find";
        fd.innerHTML = '<input type="search" class="chakra-input ' + K("input", "inputPage") + '" autocomplete="off" spellcheck="false"><select class="chakra-select ' + K("input", "inputPage") + '"></select>';
        var si = fd.firstChild, ss = fd.lastChild; si.placeholder = rt("search"); si.value = qText;
        [["", rt("fAll")], ["active", rt("st").active], ["disabled", rt("st").disabled], ["expired", rt("st").expired]].forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; ss.appendChild(op); });
        ss.value = qState;
        var refilter = function () { qText = si.value; qState = ss.value; var pos = si.selectionStart; table(); var ni = f.q(".jr-find input"); if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (x) {} } };
        var tmr = 0; si.oninput = function () { clearTimeout(tmr); tmr = setTimeout(refilter, 180); }; ss.onchange = refilter;
        f.body.appendChild(fd);
      }
      var qq = qText.trim().toLowerCase();
      var rows = list.filter(function (r) { return (!qState || r.state === qState) && (!qq || (r.username + " " + (r.title || "") + " " + (r.note || "")).toLowerCase().indexOf(qq) >= 0); });
      if (!rows.length) { var e2 = document.createElement("div"); e2.className = "jr-empty"; e2.textContent = rt("noMatch"); f.body.appendChild(e2); return; }
      var wrap = document.createElement("div"); wrap.className = "jr-wrap";
      var h = '<table class="jr-tbl"><thead><tr><th>' + H(rt("name")) + '</th><th>' + H(rt("status")) + '</th><th>' + H(rt("users")) + '</th><th>' + H(rt("volume")) + '</th><th>' + H(rt("expire")) + '</th><th></th></tr></thead><tbody>';
      rows.forEach(function (r, i) {
        var pct = r.quota ? Math.min(100, r.charge / r.quota * 100) : 0, dl = daysLeft(r.expire);
        h += '<tr data-i="' + i + '"><td class="jr-first"><span>' + (r.title ? '<span class="jr-ttl">' + H(r.title) + '</span>' : "") + '<span class="jr-n">' + H(r.username) + '</span>' + (r.note ? '<span class="jr-note">' + H(r.note) + '</span>' : "") + (r.domain ? '<span class="jr-note jr-ltr">' + H(r.domain) + '</span>' : "") + '</span>' + '</td>' +
             '<td data-l="' + H(rt("status")) + '"><span class="jr-badge jr-b-' + H(r.state) + '">' + H(rt("st")[r.state] || r.state) + '</span></td>' +
             '<td data-l="' + H(rt("users")) + '"><span class="jr-ltr">' + N(r.users) + ' / ' + (N(r.max_users) || "∞") + '</span></td>' +
             '<td data-l="' + H(rt("volume")) + '"><div class="jr-cellv"><span class="jr-ltr">' + H(gbTxt(r.charge)) + ' / ' + (r.quota ? H(gbTxt(r.quota)) : "∞") + '</span>' +
               (r.quota ? '<div class="jr-prog' + (pct >= 100 ? " f" : pct >= 80 ? " w" : "") + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' : "") + '</div></td>' +
             '<td data-l="' + H(rt("expire")) + '"><div class="jr-cellv"><span>' + H(dTxt(r.expire)) + '</span>' + (r.expire ? '<span class="jr-sm" style="display:block">' + (dl > 0 ? dl + " " + H(rt("left")) : H(rt("ended"))) + '</span>' : "") + '</div></td>' +
             '<td><span class="jr-ib"></span></td></tr>';
      });
      wrap.innerHTML = h + '</tbody></table>';
      f.body.appendChild(wrap);
      Array.prototype.forEach.call(wrap.querySelectorAll("tbody tr"), function (tr) {
        var r = rows[+tr.getAttribute("data-i")], box = tr.querySelector(".jr-ib");
        var bG = f.iconBtn(BOLT_PATH, rt("charge")), bH = f.iconBtn(CLOCK_PATH, rt("hist"));
        bG.onclick = function () { charge(r); }; bH.onclick = function () { history(r); };
        var bE = f.iconBtn(PEN_PATH, rt("edit")), bC = f.iconBtn(COPY_PATH, rt("copy")), bP = f.iconBtn(POWER_PATH, r.state === "disabled" ? rt("on") : rt("off")), bD = f.iconBtn(TRASH_PATH, rt("del"), true);
        bE.onclick = function () { form(r); };
        bC.onclick = function () { copyText(credText(r.username, null, r.domain)).then(function () { f.msg(rt("copied"), true); }, function () {}); };
        bP.onclick = function () {
          f.load(bP, true);
          jx("PUT", "/jinx-api/resellers/" + encodeURIComponent(r.username), { enabled: r.state === "disabled" })
            .then(function () { load(function () { f.msg(rt("saved"), true); }); }, function (e) { f.load(bP, false); f.msg(rerr(e)); });
        };
        bD.onclick = function () { confirmDel(r); };
        [bG, bE, bH, bC, bP, bD].forEach(function (b) { box.appendChild(b); });
      });
    }
    function credText(u, p, dom) {
      var url = agentUrl(dom);
      return L4("پنل نمایندگی Super JinX\n", "Super JinX reseller panel\n", "Панель реселлера Super JinX\n", "Super JinX 代理面板\n") + rt("panelUrl") + ": " + url + "\n" + rt("name") + ": " + u + (p ? "\n" + rt("pass") + ": " + p : "");
    }
    function load(done) {
      if (!list.length) { f.body.innerHTML = '<div class="jr-empty"><span class="jr-sp"></span> ' + H(rt("loading")) + '</div>'; }
      jx("GET", "/jinx-api/resellers").then(function (r) { list = r.resellers || []; DOMS = r.domains || []; table(); if (done) done(); },
        function (e) { table(); f.msg(rerr(e)); if (done) done(); });
    }
    function form(r) {
      var edit = !!r; f.foot.classList.remove("jc-foot"); f.body.innerHTML = ""; f.foot.innerHTML = "";
      f.q(".jp-title").textContent = edit ? rt("edit") + " · " + r.username : rt("add");
      var g = document.createElement("div"); g.className = "jr-grid";
      var fu = fieldEl("jr-u", rt("name"), edit ? r.username : "", "text", null, " jr-full");
      var fp = fieldEl("jr-p", edit ? rt("passEdit") : rt("pass"), "", "text", null, " jr-full");
      var gen = f.btn(rt("gen"), "secondary"); gen.onclick = function () { fp.querySelector("input").value = genPass(); }; fp.querySelector(".jr-row").appendChild(gen);
      var ft = fieldEl("jr-t", rt("titleL"), edit ? (r.title || "") : "", "text", null, " jr-full"); ft.querySelector("input").style.direction = "auto"; ft.querySelector("input").maxLength = 40;
      if (edit) { var rh = document.createElement("div"); rh.className = "jr-help"; rh.textContent = rt("renameH"); fu.appendChild(rh); }
      var fm = fieldEl("jr-m", rt("maxUsers"), edit ? r.max_users : 10, "number", rt("minUsers"));
      var fq = fieldEl("jr-q", rt("quota"), "", "number", rt("zero"));
      var fqU = unitField(fq, edit ? r.quota / GBY : 100); if (!edit || !r.quota) fq.querySelector("input").value = edit ? "0" : "100";
      var chipRow = function (fld, vals) { var c = document.createElement("div"); c.className = "jr-chips"; var inp = fld.querySelector("input");
        vals.forEach(function (v) { var b = f.btn(v[1], "secondary"); b.classList.add("jr-chip"); b.onclick = function () { inp.value = v[0]; inp.dispatchEvent(new Event("input")); }; c.appendChild(b); }); fld.appendChild(c); };
      chipRow(fm, [[10, "10"], [50, "50"], [100, "100"], [500, "500"], [1000, "1000"], [0, "∞"]]);
      (function () { var c = document.createElement("div"); c.className = "jr-chips";
        [[500 / 1024, "500MB"], [50, "50GB"], [100, "100GB"], [500, "500GB"], [1024, "1TB"], [0, "∞"]].forEach(function (v) { var b = f.btn(v[1], "secondary"); b.classList.add("jr-chip");
          b.onclick = function () { fqU.set(v[0], v[0] ? null : "GB"); if (!v[0]) fq.querySelector("input").value = "0"; fq.querySelector("input").dispatchEvent(new Event("input")); }; c.appendChild(b); }); fq.appendChild(c); })();
      var dleft = edit ? (r.expire ? Math.max(0, daysLeft(r.expire)) : 0) : 30;
      var fd = fieldEl("jr-d", rt("days"), dleft, "number", "", " jr-full");
      var help = fd.querySelector(".jr-help"), din = fd.querySelector("input");
      var showDate = function () { var n = parseInt(din.value, 10) || 0; help.textContent = rt("zero") + " · " + (n > 0 ? rt("expire") + ": " + dTxt(Math.floor(Date.now() / 1000) + n * 86400) : rt("never")); };
      din.oninput = showDate; showDate();
      var chips = document.createElement("div"); chips.className = "jr-chips";
      [30, 60, 90, 180, 365, 0].forEach(function (n) { var c = f.btn(n ? String(n) : "∞", "secondary"); c.classList.add("jr-chip"); c.onclick = function () { din.value = n; showDate(); }; chips.appendChild(c); });
      fd.appendChild(chips);
      var fn = fieldEl("jr-n", rt("note"), edit ? r.note : "", "text", null, " jr-full"); fn.querySelector("input").style.direction = "auto";
      var fdom = domField("jr-dom", edit ? r.domain : "", DOMS);
      [fu, fp, ft, fdom.el, fm, fq, fd, fn].forEach(function (x) { g.appendChild(x); });
      var q0 = fq.querySelector("input").value + fqU.sel.value, d0 = String(dleft);
      [fm, fq, fd].forEach(function (x) { var i = x.querySelector("input"); i.min = "0"; i.inputMode = "numeric"; });
      var en = null;
      if (edit) {
        en = document.createElement("label"); en.className = "chakra-checkbox jr-full " + K("cb");
        en.innerHTML = '<input type="checkbox" class="jp-cbh"><span class="chakra-checkbox__control ' + K("cbControl") + '" aria-hidden="true">' + CHECK + '</span><span class="chakra-checkbox__label ' + K("cbLabel") + '"></span>';
        en.lastChild.textContent = rt("enabled"); var cb = en.querySelector("input"), ctl = en.querySelector(".chakra-checkbox__control");
        var paint = function () { if (cb.checked) { ctl.setAttribute("data-checked", ""); en.setAttribute("data-checked", ""); } else { ctl.removeAttribute("data-checked"); en.removeAttribute("data-checked"); } };
        cb.checked = r.state !== "disabled"; paint(); cb.onchange = paint; g.appendChild(en);
      }
      f.body.appendChild(g);
      var u = fu.querySelector("input");
      var cancel = f.btn(edit ? rt("back") : rt("cancel"), "secondary"), save = f.btn(edit ? rt("save") : rt("create"), "primary");
      cancel.onclick = function () { f.q(".jp-title").textContent = rt("title"); table(); };
      save.onclick = function () {
        var U = u.value.trim(), PW = fp.querySelector("input").value, n = function (x) { return Number(x.querySelector("input").value || 0); };
        var mu = n(fm), qg = fqU.gb(), dd = n(fd);
        if ((!edit || U !== r.username) && !/^[A-Za-z0-9_.@-]{3,32}$/.test(U)) { f.msg(rerr({ code: "bad_username" })); u.focus(); return; }
        if (!edit && !PW) { f.msg(rerr({ code: "password_required" })); fp.querySelector("input").focus(); return; }
        if ([mu, qg, dd].some(function (v) { return !isFinite(v) || v < 0; }) || mu % 1 || dd % 1) { f.msg(rerr({ code: "bad_number" })); return; }
        if (mu > 0 && mu < 10) { f.msg(rerr({ code: "min_capacity" })); fm.querySelector("input").focus(); return; }
        if (qg > 0 && qg < 1 / 1024 - 1e-12) { f.msg(rerr({ code: "min_quota" })); fq.querySelector("input").focus(); return; }
        var dom = fdom.value(); if (dom === null) { f.msg(rt("e").bad_domain); fdom.el.querySelector("select").focus(); return; }
        var exp = dd > 0 ? Math.floor(Date.now() / 1000) + dd * 86400 : 0;
        if (edit && r.expire && fd.querySelector("input").value.trim() === d0) exp = r.expire;   // days untouched -> keep the exact time (also for an expired panel)
        var body = { max_users: mu, quota_gb: edit && fq.querySelector("input").value + fqU.sel.value === q0 ? r.quota / GBY : qg, expire: exp, note: fn.querySelector("input").value.trim(), title: ft.querySelector("input").value.trim(), domain: dom };
        if (edit) { body.enabled = en.querySelector("input").checked; if (PW) body.password = PW; if (U !== r.username) body.new_username = U; } else { body.username = U; body.password = PW; }
        f.busy = true; f.load(save, true); cancel.disabled = true; f.msg("");
        jx(edit ? "PUT" : "POST", "/jinx-api/resellers" + (edit ? "/" + encodeURIComponent(r.username) : ""), body).then(function () {
          f.busy = false;
          if (edit && (PW || U !== r.username || dom !== (r.domain || ""))) done(U, PW || null, true, null, dom);       // new login info / address -> show it to copy
          else if (edit) { f.q(".jp-title").textContent = rt("title"); load(function () { f.msg(rt("saved"), true); }); }
          else done(U, PW);
        }, function (e) { f.busy = false; f.load(save, false); cancel.disabled = false; f.msg(rerr(e)); });
      };
      f.foot.appendChild(cancel); f.foot.appendChild(save);
      setTimeout(function () { (edit ? ft.querySelector("input") : u).focus(); }, 60);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT") save.click(); });
    }
    // ✨ new reseller panel: ready-made packages, live checks and a live preview of what the reseller gets
    function create() {
      var C = rt("cr"); f.body.innerHTML = ""; f.foot.innerHTML = ""; f.q(".jp-title").textContent = rt("add");
      var st = { u: 50, g: 500, d: 30, pk: "silver" };
      var PK = [["bronze", 10, 100, 30], ["silver", 50, 500, 30], ["gold", 100, 1024, 30], ["diamond", 500, 5120, 90], ["custom"]];
      var wrap = document.createElement("div"); wrap.className = "jc"; f.foot.classList.add("jc-foot");
      wrap.innerHTML = '<div class="jc-pk" role="radiogroup"></div><div class="jc-grid"><div class="jc-form"></div><aside class="jc-prev"></aside></div>';
      f.body.appendChild(wrap);
      var pkBox = wrap.querySelector(".jc-pk"), fbox = wrap.querySelector(".jc-form"), prev = wrap.querySelector(".jc-prev");
      PK.forEach(function (k) { var b = document.createElement("button"); b.type = "button"; b.className = "jc-p jc-" + k[0]; b.setAttribute("role", "radio"); b.dataset.k = k[0];
        b.innerHTML = '<b></b><small class="jr-ltr"></small>'; b.firstChild.textContent = C.pk[k[0]];
        b.lastChild.textContent = k[1] ? k[1] + " · " + (k[2] >= 1024 ? (k[2] / 1024) + "TB" : k[2] + "GB") + " · " + k[3] + "d" : C.pkCustom;
        b.onclick = function () { st.pk = k[0]; if (k[1]) { fm.querySelector("input").value = k[1]; fqU.set(k[2]); fd.querySelector("input").value = k[3]; } paint(); (k[1] ? fu.querySelector("input") : fm.querySelector("input")).focus(); };
        pkBox.appendChild(b); });
      var sec = function (t) { var h = document.createElement("div"); h.className = "jc-sec"; h.textContent = t; fbox.appendChild(h); };
      sec(C.acc);
      var fu = fieldEl("jc-u", rt("name"), "", "text", C.uHelp), fp = fieldEl("jc-p", rt("pass"), genPass(), "text", ""), ft = fieldEl("jc-t", rt("titleL"), "", "text", null);
      var gen = f.btn(rt("gen"), "secondary"); gen.onclick = function () { fp.querySelector("input").value = genPass(); paint(); }; fp.querySelector(".jr-row").appendChild(gen);
      ft.querySelector("input").style.direction = "auto"; ft.querySelector("input").maxLength = 40;
      var fdom = domField("jc-dom", "", DOMS, function () { if (typeof paint === "function" && save) paint(); });
      [fu, fp, ft, fdom.el].forEach(function (x) { fbox.appendChild(x); });
      sec(C.lim);
      var row3 = document.createElement("div"); row3.className = "jc-3"; fbox.appendChild(row3);
      var fm = fieldEl("jc-m", rt("maxUsers"), 50, "number", rt("minUsers")), fq = fieldEl("jc-q", C.gb, "", "number", rt("zero")), fd = fieldEl("jc-d", C.days, 30, "number", "");
      var fqU = unitField(fq, 500);
      [fm, fq, fd].forEach(function (x) { var i = x.querySelector("input"); i.min = "0"; i.inputMode = x === fq ? "decimal" : "numeric"; row3.appendChild(x); });
      var fn = fieldEl("jc-n", rt("note"), "", "text", null); fn.querySelector("input").style.direction = "auto"; fbox.appendChild(fn);
      var U = fu.querySelector("input"), P = fp.querySelector("input"), uh = fu.querySelector(".jr-help"), ph = fp.querySelector(".jr-help");
      U.maxLength = 32; U.placeholder = "agent_tehran";
      var taken = function (v) { v = v.toLowerCase(); return list.some(function (r) { return r.username.toLowerCase() === v; }) || v === "admin"; };
      var strength = function (v) { var c = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(function (r) { return r.test(v); }).length, s2 = 0;
        if (v.length >= 8) s2++; if (v.length >= 12) s2++; if (c >= 3) s2++; if (c === 4 && v.length >= 10) s2++; return v ? (v.length < 6 ? 1 : Math.max(1, Math.min(4, s2))) : 0; };
      var num = function (x) { return Number(x.querySelector("input").value || 0); };
      function check() {
        var v = U.value.trim(), m = num(fm), q = fqU.gb(), d = num(fd), e = null;
        if (!v) e = ["u", ""]; else if (!/^[A-Za-z0-9_.@-]{3,32}$/.test(v)) e = ["u", rt("e").bad_username]; else if (taken(v)) e = ["u", rt("e").username_taken];
        else if (!P.value) e = ["p", rt("e").password_required];
        else if (!isFinite(m) || m < 0 || m % 1 || (m > 0 && m < 10)) e = ["m", rt("e").min_capacity];
        else if (!isFinite(q) || q < 0 || (q > 0 && q < 1 / 1024 - 1e-12)) e = ["q", rt("e").min_quota];
        else if (!isFinite(d) || d < 0 || d % 1) e = ["d", rt("e").bad_number];
        else if (fdom.value() === null) e = ["o", rt("e").bad_domain];
        return e;
      }
      function paint() {
        var v = U.value.trim(), m = num(fm), q = fqU.gb(), d = num(fd), sc = strength(P.value), e = check();
        Array.prototype.forEach.call(pkBox.children, function (b) { var on = b.dataset.k === st.pk; b.setAttribute("aria-checked", on); b.classList.toggle("on", on); });
        uh.className = "jr-help" + (v ? (/^[A-Za-z0-9_.@-]{3,32}$/.test(v) && !taken(v) ? " jc-ok" : " jc-bad") : "");
        uh.textContent = !v ? C.uHelp : !/^[A-Za-z0-9_.@-]{3,32}$/.test(v) ? rt("e").bad_username : taken(v) ? rt("e").username_taken : "✓ " + C.uFree;
        ph.innerHTML = '<span class="jc-bar" data-s="' + sc + '"><i></i><i></i><i></i><i></i></span><span></span>'; ph.lastChild.textContent = P.value ? rt("st2")[sc] : "";
        fd.querySelector(".jr-help").textContent = d > 0 ? rt("expire") + ": " + dTxt(Math.floor(Date.now() / 1000) + d * 86400) : rt("never");
        var tt = ft.querySelector("input").value.trim();
        prev.innerHTML = '<div class="jc-pc"><div class="jc-glow"></div><span class="jc-tag"></span><b class="jc-nm"></b><span class="jc-un jr-ltr"></span>' +
          '<div class="jc-kv"><div><span>' + H(rt("users")) + '</span><b class="jr-ltr">' + (m ? m : "∞") + '</b></div><div><span>' + H(rt("volume")) + '</span><b class="jr-ltr">' + (q ? H(gbTxt(q * GBY)) : "∞") + '</b></div>' +
          '<div><span>' + H(rt("expire")) + '</span><b>' + H(d > 0 ? d + " " + C.dayW : rt("never")) + '</b></div></div><div class="jc-url"><span>' + H(rt("panelUrl")) + '</span><b class="jr-ltr"></b></div></div>';
        prev.querySelector(".jc-tag").textContent = C.pk[st.pk]; prev.querySelector(".jc-nm").textContent = tt || v || C.newP; prev.querySelector(".jc-un").textContent = v ? "@" + v : "@username";
        prev.querySelector(".jc-url b").textContent = fdom.host() + "/agent/";
        save.disabled = !!e; save.title = e && e[1] ? e[1] : "";
        if (e && e[1] && /[mqdo]/.test(e[0])) f.msg(e[1]); else if (f.q(".jp-m.e")) f.msg("");
      }
      [fm, fq, fd].forEach(function (x) { x.querySelector("input").addEventListener("input", function () { st.pk = "custom"; paint(); }); });
      [U, P, ft.querySelector("input")].forEach(function (i) { i.addEventListener("input", paint); });
      var cancel = f.btn(rt("cancel"), "secondary"), save = f.btn(rt("create"), "primary", PLUS_PATH);
      cancel.onclick = function () { f.q(".jp-title").textContent = rt("title"); table(); };
      save.onclick = function () {
        var e = check(); if (e) { f.msg(e[1] || rt("e").bad_username); ({ u: U, p: P, m: fm.querySelector("input"), q: fq.querySelector("input"), d: fd.querySelector("input"), o: fdom.el.querySelector("select") })[e[0]].focus(); return; }
        var d = num(fd), body = { username: U.value.trim(), password: P.value, max_users: num(fm), quota_gb: fqU.gb(), expire: d > 0 ? Math.floor(Date.now() / 1000) + d * 86400 : 0,
          title: ft.querySelector("input").value.trim(), note: fn.querySelector("input").value.trim(), domain: fdom.value() || "" };
        f.busy = true; f.load(save, true); cancel.disabled = true; f.msg("");
        jx("POST", "/jinx-api/resellers", body).then(function () { f.busy = false; list.push({ username: body.username }); done(body.username, body.password, false, body, body.domain); },
          function (er) { f.busy = false; f.load(save, false); cancel.disabled = false; f.msg(rerr(er)); paint(); });
      };
      f.foot.appendChild(cancel); f.foot.appendChild(save);
      wrap.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT" && !save.disabled) save.click(); });
      paint(); setTimeout(function () { U.focus(); }, 60);
    }
    function done(U, PW, upd, info, dom) {
      f.foot.classList.remove("jc-foot"); var C = rt("cr"); f.body.innerHTML = ""; f.foot.innerHTML = ""; f.q(".jp-title").textContent = rt("title");
      var url = agentUrl(dom);
      var hd = document.createElement("div"); hd.className = "jc-ok-h";
      hd.innerHTML = '<span class="jc-ok-i">' + svg("m4.5 12.75 6 6 9-13.5", 26) + '</span><div><b></b><span></span></div>';
      hd.querySelector("b").textContent = upd ? C.okU : C.okT; hd.querySelector(":scope > div > span").textContent = C.okD; f.body.appendChild(hd);
      var c = document.createElement("div"); c.className = "jr-cred jc-cred";
      var rows = [[rt("panelUrl"), url], [rt("name"), U]].concat(PW ? [[rt("pass"), PW]] : []);
      if (info) rows.push([rt("users") + " · " + rt("volume") + " · " + rt("expire"), (info.max_users || "∞") + " · " + (info.quota_gb ? gbTxt(info.quota_gb * GBY) : "∞") + " · " + dTxt(info.expire)]);
      rows.forEach(function (x, k) {
        var d = document.createElement("div"); d.innerHTML = "<span></span><b></b>"; d.firstChild.textContent = x[0]; d.children[1].textContent = x[1];
        if (k >= 3) { var vb = d.children[1]; vb.setAttribute("dir", dirOf()); vb.style.setProperty("direction", dirOf(), "important"); vb.innerHTML = String(x[1]).split(" · ").map(function (p) { return "<bdi>" + H(p) + "</bdi>"; }).join(" · "); }   // each part keeps its own direction   // "users · data · expiry" reads in the same order as its label
        if (k < 3) { var cb = f.iconBtn(COPY_PATH, C.one); cb.classList.add("jc-c1"); cb.onclick = function () { copyText(x[1]).then(function () { cb.classList.add("jc-done"); setTimeout(function () { cb.classList.remove("jc-done"); }, 1200); f.msg(rt("copied") + ": " + x[0], true); }, function () {}); }; d.appendChild(cb); }
        c.appendChild(d);
      });
      f.body.appendChild(c);
      var all = f.btn(C.copyAll, "secondary", COPY_PATH), back = f.btn(rt("back"), "primary");
      all.onclick = function () { copyText(credText(U, PW, dom)).then(function () { f.msg(rt("copied"), true); }, function () {}); };
      back.onclick = function () { f.q(".jp-title").textContent = rt("title"); load(); };
      if (navigator.share) { var sh = f.btn(C.share, "secondary", SHARE_PATH); sh.onclick = function () { navigator.share({ text: credText(U, PW, dom) }).catch(function () {}); }; f.foot.appendChild(sh); }
      f.foot.appendChild(all); f.foot.appendChild(back);
    }
    function charge(r) {
      f.body.innerHTML = ""; f.foot.innerHTML = ""; f.q(".jp-title").textContent = rt("charge") + " · " + (r.title || r.username);
      var d = document.createElement("p"); d.className = "jr-intro"; d.style.marginBottom = "1rem"; d.textContent = rt("chargeD"); f.body.appendChild(d);
      var st = document.createElement("div"); st.className = "jr-stat";
      st.innerHTML = '<div class="jr-card"><span>' + H(rt("volume")) + '</span><b class="jr-ltr">' + H(gbTxt(r.charge)) + " / " + (r.quota ? H(gbTxt(r.quota)) : "∞") + '</b></div>' +
        '<div class="jr-card"><span>' + H(rt("users")) + '</span><b class="jr-ltr">' + N(r.users) + " / " + (N(r.max_users) || "∞") + '</b></div>' +
        '<div class="jr-card"><span>' + H(rt("expire")) + '</span><b style="font-size:.95rem">' + H(dTxt(r.expire)) + '</b></div>';
      f.body.appendChild(st);
      var g = document.createElement("div"); g.className = "jr-grid";
      var fg = fieldEl("jr-cg", rt("addGb"), "", "number", r.quota ? "" : rt("e").unlimited_quota), fdd = fieldEl("jr-cd", rt("addDays"), "", "number", r.expire ? "" : rt("e").unlimited_time),
          fu = fieldEl("jr-cu", rt("addUsers"), "", "number", r.max_users ? "" : rt("e").unlimited_users, " jr-full");
      var chips = function (fld, vals) { var c = document.createElement("div"); c.className = "jr-chips"; var inp = fld.querySelector("input");
        vals.forEach(function (v) { var b = f.btn((v > 0 ? "+" : "") + v, "secondary"); b.classList.add("jr-chip"); b.onclick = function () { inp.value = String((Number(inp.value) || 0) + v); }; c.appendChild(b); }); fld.appendChild(c); };
      var fgU = unitField(fg, null);
      (function () { var c = document.createElement("div"); c.className = "jr-chips"; var inp = fg.querySelector("input");
        [[500 / 1024, "+500MB"], [50, "+50GB"], [100, "+100GB"], [500, "+500GB"], [1024, "+1TB"]].forEach(function (v) { var b = f.btn(v[1], "secondary"); b.classList.add("jr-chip");
          b.onclick = function () { fgU.set(fgU.gb() + v[0]); }; c.appendChild(b); }); fg.appendChild(c); })();
      chips(fdd, [30, 60, 90, 365]); chips(fu, [10, 50, 100]);
      [[fg, r.quota], [fdd, r.expire], [fu, r.max_users]].forEach(function (x) { var i = x[0].querySelector("input"); i.placeholder = "0"; i.inputMode = "decimal"; if (!x[1]) { i.disabled = true; x[0].querySelectorAll(".jr-chip, select").forEach(function (b) { b.disabled = true; }); } g.appendChild(x[0]); });
      f.body.appendChild(g);
      var back = f.btn(rt("back"), "secondary"), go = f.btn(rt("doCharge"), "primary", BOLT_PATH);
      back.onclick = function () { f.q(".jp-title").textContent = rt("title"); table(); };
      go.onclick = function () {
        var v = function (x) { var t = x.querySelector("input"); return t.disabled ? 0 : Number(t.value || 0); }, ag = fg.querySelector("input").disabled ? 0 : fgU.gb(), ad = v(fdd), au = v(fu);
        if (![ag, ad, au].every(isFinite) || ad % 1 || au % 1) { f.msg(rerr({ code: "bad_number" })); return; }
        if (!ag && !ad && !au) { f.msg(rerr({ code: "nothing" })); return; }
        if (au && r.max_users + au < 10) { f.msg(rerr({ code: "min_capacity" })); return; }
        f.busy = true; f.load(go, true); back.disabled = true; f.msg("");
        jx("POST", "/jinx-api/resellers/" + encodeURIComponent(r.username) + "/charge", { add_gb: ag, add_days: ad, add_users: au }).then(function () {
          f.busy = false; f.q(".jp-title").textContent = rt("title"); load(function () { f.msg(rt("charged"), true); });
        }, function (e) { f.busy = false; f.load(go, false); back.disabled = false; f.msg(rerr(e)); });
      };
      f.foot.appendChild(back); f.foot.appendChild(go);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName === "INPUT") go.click(); });
      setTimeout(function () { var i = g.querySelector("input:not([disabled])"); if (i) i.focus(); }, 60);
    }
    function histText(x) {
      var HX = rt("hx"), t = String(x || ""), m = t.match(/^(user\+|user-|user~|user:reset|user:revoke_sub)(.*)$/);
      if (m) return { a: HX[m[1]] || m[1], d: m[2] };
      var k = t.split(":")[0], rest = t.slice(k.length + 1);
      if (k === "update" && rest) return { a: HX.update, d: rest.split(",").map(function (p) { if (/^rename:/.test(p)) return HX.rename + " " + p.slice(7).replace(">", " → "); return HX[p] || p; }).join(L4("، ", ", ", ", ", "，")) };
      return { a: HX[k] || k, d: rest };
    }
    function history(r) {
      f.body.innerHTML = '<div class="jr-empty"><span class="jr-sp"></span> ' + H(rt("loading")) + '</div>'; f.foot.innerHTML = ""; f.q(".jp-title").textContent = rt("hist") + " · " + (r.title || r.username);
      var back = f.btn(rt("back"), "primary"); back.onclick = function () { f.q(".jp-title").textContent = rt("title"); table(); }; f.foot.appendChild(back);
      jx("GET", "/jinx-api/resellers/" + encodeURIComponent(r.username) + "/history").then(function (j) {
        var lg = (j && j.log) || []; f.body.innerHTML = "";
        if (!lg.length) { var e = document.createElement("div"); e.className = "jr-empty"; e.textContent = rt("histEmpty"); f.body.appendChild(e); return; }
        var box = document.createElement("div"); box.className = "jr-hist";
        lg.forEach(function (x) { var t = histText(x.x), row = document.createElement("div");
          row.innerHTML = "<span><b></b> <span class=\"jr-ltr\"></span></span><i></i>"; row.querySelector("b").textContent = t.a; row.querySelector(".jr-ltr").textContent = t.d || "";
          row.querySelector("i").textContent = dtTxt(x.t) + (x.by && x.by !== r.username ? " · " + x.by : ""); box.appendChild(row); });
        f.body.appendChild(box);
      }, function (e) { f.body.innerHTML = ""; f.msg(rerr(e)); });
    }
    function confirmDel(r) {
      f.body.innerHTML = ""; f.foot.innerHTML = "";
      var a = document.createElement("p"); a.style.cssText = "font-weight:600;margin-bottom:.5rem"; a.textContent = rt("delQ").replace("{n}", r.username);
      var b = document.createElement("p"); b.className = "jr-intro"; b.textContent = rt("delD").replace("{u}", r.users);
      f.body.appendChild(a); f.body.appendChild(b);
      var no = f.btn(rt("cancel"), "secondary"), yes = f.btn(rt("del"), "danger", TRASH_PATH);
      no.onclick = table;
      yes.onclick = function () {
        f.busy = true; f.load(yes, true); no.disabled = true;
        jx("DELETE", "/jinx-api/resellers/" + encodeURIComponent(r.username)).then(function () { f.busy = false; load(function () { f.msg(rt("deleted"), true); }); },
          function (e) { f.busy = false; f.load(yes, false); no.disabled = false; f.msg(rerr(e)); });
      };
      f.foot.appendChild(no); f.foot.appendChild(yes);
    }
    load();
  }

  function openCredit() {
    var f = frame("jinx-rs", PIE_PATH, rt("meTitle"), true);
    f.body.innerHTML = '<div class="jr-empty"><span class="jr-sp"></span></div>';
    var close = f.btn(rt("close"), "primary"); close.onclick = f.close; f.foot.appendChild(close);
    jx("GET", "/jinx-api/me").then(function (m) {
      var pct = m.quota ? Math.min(100, m.charge / m.quota * 100) : 0, dl = daysLeft(m.expire);
      f.body.innerHTML = '<p class="jr-intro" style="margin-bottom:1rem"></p><div class="jr-stat">' +
        '<div class="jr-card"><span>' + H(rt("status")) + '</span><b><span class="jr-badge jr-b-' + H(m.state) + '">' + H(rt("st")[m.state] || m.state) + '</span></b></div>' +
        '<div class="jr-card"><span>' + H(rt("meUsers")) + '</span><b class="jr-ltr">' + N(m.users) + ' / ' + (N(m.max_users) || "∞") + '</b></div>' +
        '<div class="jr-card"><span>' + H(rt("meExp")) + '</span><b style="font-size:.95rem">' + H(dTxt(m.expire)) + '</b>' + (m.expire ? '<span>' + (dl > 0 ? dl + " " + H(rt("left")) : H(rt("ended"))) + '</span>' : "") + '</div></div>' +
        '<div class="jr-card"><span>' + H(rt("meVol")) + '</span><b class="jr-ltr" style="text-align:start">' + H(gbTxt(m.charge)) + ' / ' + (m.quota ? H(gbTxt(m.quota)) : "∞") + '</b>' +
        (m.quota ? '<div class="jr-prog' + (pct >= 100 ? " f" : pct >= 80 ? " w" : "") + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' : "") + '</div>';
      f.body.firstChild.textContent = rt("meD");
    }, function (e) { f.body.innerHTML = ""; f.msg(rerr(e)); });
  }

  // who am I? (decides which menu items exist) - refreshed when the login changes
  var ME = { tok: null, info: null, wait: null };
  function me() {
    var tk = token();
    if (!tk) { ME.tok = null; ME.info = null; return Promise.resolve(null); }
    if (ME.tok === tk && ME.info) return Promise.resolve(ME.info);
    if (ME.tok === tk && ME.wait) return ME.wait;
    ME.tok = tk;
    ME.wait = jx("GET", "/jinx-api/me").then(function (m) { ME.info = m; ME.wait = null; subDomSave(m); return m; },
      function () { ME.wait = null; ME.info = null; return api("GET", "/api/admin").then(function (a) { ME.info = { sudo: !!(a && a.is_sudo), reseller: false }; return ME.info; }, function () { return null; }); });
    return ME.wait;
  }
  // small native-looking toast (same look as the panel's Chakra toasts)
  function jinxToast(msg, bad) {
    var old = document.getElementById("jinx-toast"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "jinx-toast"; d.setAttribute("role", "status");
    d.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;z-index:5000;max-width:calc(100vw - 32px);padding:.75rem 1rem;border-radius:var(--chakra-radii-md,.375rem);" +
      "font:600 var(--chakra-fontSizes-sm,.875rem)/1.5 inherit;color:#fff;box-shadow:var(--chakra-shadows-lg,0 10px 15px -3px rgba(0,0,0,.2));transition:all .3s;background:" + (bad ? "var(--chakra-colors-red-500,#e53e3e)" : "var(--chakra-colors-green-500,#38a169)");
    d.textContent = msg; document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = "1"; d.style.transform = "translate(-50%,0)"; });
    setTimeout(function () { d.style.opacity = "0"; setTimeout(function () { d.remove(); }, 300); }, 3200);
  }
  window.jinxToast = jinxToast;

  // 👋 a reseller sees «به پنل نمایندگی خوش آمدید» right after signing in, with its limits at a glance
  var WT = { fa: { hi: "به پنل نمایندگی خوش آمدید", sub: "{n} عزیز، این پنل مخصوص شماست. کاربران خود را بسازید و مدیریت کنید.", users: "کاربران", vol: "حجم", exp: "اعتبار تا", more: "جزئیات اعتبار", close: "بستن" },
            en: { hi: "Welcome to your reseller panel", sub: "Hi {n}, this panel is yours. Create and manage your own users.", users: "Users", vol: "Data", exp: "Valid until", more: "Credit details", close: "Close" } };
  WT.ru = {"hi":"Добро пожаловать в панель реселлера","sub":"{n}, эта панель ваша. Создавайте своих пользователей и управляйте ими.","users":"Пользователи","vol":"Трафик","exp":"Действует до","more":"Подробнее о балансе","close":"Закрыть"};
  WT.zh = {"hi":"欢迎使用代理面板","sub":"{n}，这是你的专属面板，可以创建和管理自己的用户。","users":"用户","vol":"流量","exp":"有效期至","more":"额度详情","close":"关闭"};
  function welcome(m) {
    if (!m || !m.reseller || /login/i.test(location.pathname + location.hash)) return;
    var key = "jinx-welcome:" + (token() || "").slice(-24); try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch (e) {}
    capture(); css(); rsCss();
    var L = WT[lang()] || WT.en, d = document.createElement("div"); d.id = "jinx-welcome"; d.className = "jinx-rs"; d.setAttribute("role", "status");
    d.setAttribute("dir", dirOf());
    var pct = m.quota ? Math.min(100, m.charge / m.quota * 100) : 0;
    d.innerHTML = '<div class="jw-card chakra-modal__content ' + K("content") + '"><div class="jw-glow"></div><div class="jw-head"><div class="jp-icon ' + K("icon") + '">' + svg(GROUP_PATH, 20) + '</div>' +
      '<div class="jw-t"><b></b><span></span></div><button type="button" class="chakra-modal__close-btn jw-x ' + K("close") + '" aria-label=""><svg viewBox="0 0 24 24" width="11" height="11"><path fill="currentColor" d="M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z"/></svg></button></div>' +
      '<div class="jw-stats"><div><span>' + H(L.users) + '</span><b class="jr-ltr">' + N(m.users) + " / " + (N(m.max_users) || "∞") + '</b></div>' +
      '<div><span>' + H(L.vol) + '</span><b class="jr-ltr">' + H(gbTxt(m.charge)) + " / " + (m.quota ? H(gbTxt(m.quota)) : "∞") + '</b>' + (m.quota ? '<div class="jr-prog' + (pct >= 100 ? " f" : pct >= 80 ? " w" : "") + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' : "") + '</div>' +
      '<div><span>' + H(L.exp) + '</span><b>' + H(dTxt(m.expire)) + '</b></div></div></div>';
    d.querySelector(".jw-t b").textContent = L.hi; d.querySelector(".jw-t span").textContent = L.sub.replace("{n}", m.username || "");
    var x = d.querySelector(".jw-x"); x.setAttribute("aria-label", L.close);
    var gone = false, hide = function () { if (gone) return; gone = true; d.classList.remove("on"); setTimeout(function () { d.remove(); }, 400); };
    x.onclick = hide; document.body.appendChild(d);
    var mo = new MutationObserver(function () { if (document.querySelector(".chakra-modal__content-container:not(#jinx-welcome *)")) { hide(); mo.disconnect(); } });
    mo.observe(document.body, { childList: true, subtree: true }); setTimeout(function () { mo.disconnect(); }, 9500); requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("on"); }); });
    setTimeout(hide, 9000);
  }
  window.jinxWelcome = welcome;

  // 🚪 login page of a reseller: «به پنل نمایندگی خوش آمدید» right above the username / password
  //    shown when the reseller came from its own link (/agent/) or already signed in as a reseller on this device
  function rememberAgent() { try { localStorage.setItem("jinx-agent", "1"); } catch (e) {} }
  function forgetAgent() { try { localStorage.removeItem("jinx-agent"); } catch (e) {} }
  function isAgentDevice() { try { return localStorage.getItem("jinx-agent") === "1" || /[?&#]agent=1/.test(location.href); } catch (e) { return false; } }
  var LW = { fa: { t: "به پنل نمایندگی خوش آمدید", d: "با نام کاربری و رمز عبوری که مدیر برای شما ساخته وارد شوید." },
             en: { t: "Welcome to your reseller panel", d: "Sign in with the username and password your administrator created for you." } };
  LW.ru = {"t":"Добро пожаловать в панель реселлера","d":"Войдите с именем пользователя и паролем, которые создал для вас администратор."};
  LW.zh = {"t":"欢迎使用代理面板","d":"请使用管理员为你创建的用户名和密码登录。"};
  function loginWelcome() {
    var pw = document.querySelector('input[type="password"]'), form = pw && (pw.closest("form") || pw.closest(".chakra-stack") || pw.parentElement);
    var on = !!(pw && form && isAgentDevice() && !token()), cur = document.getElementById("jinx-lw");
    if (!on) { if (cur) cur.remove(); return; }
    if (cur && document.contains(cur) && form.contains(cur)) return;
    if (cur) cur.remove();
    capture(); css();
    var L = LW[lang()] || LW.en, d = document.createElement("div"); d.id = "jinx-lw"; d.setAttribute("dir", dirOf());
    d.innerHTML = '<div class="jlw-ic">' + svg(GROUP_PATH, 22) + '</div><div class="jlw-tx"><b></b><span></span></div>';
    d.querySelector("b").textContent = L.t; d.querySelector("span").textContent = L.d;
    form.insertBefore(d, form.firstChild);
  }
  (function () { var st = document.createElement("style"); st.textContent =
      "#jinx-lw{display:flex;align-items:center;gap:.8rem;width:100%;box-sizing:border-box;margin:0 0 1rem;padding:.85rem 1rem;border-radius:var(--chakra-radii-lg,.5rem);position:relative;overflow:hidden;" +
      "border:1px solid var(--chakra-colors-chakra-border-color,rgba(127,127,127,.25));background:linear-gradient(135deg,rgba(66,153,225,.12),rgba(159,122,234,.10));animation:jlwIn .5s cubic-bezier(.2,.8,.2,1)}" +
      "#jinx-lw::after{content:'';position:absolute;inset:0 0 auto 0;height:2px;background:linear-gradient(90deg,var(--chakra-colors-primary-500,#3182ce),var(--chakra-colors-purple-400,#9f7aea),var(--chakra-colors-primary-500,#3182ce));background-size:200% 100%;animation:jwg 3s linear infinite}" +
      "#jinx-lw .jlw-ic{flex:none;width:2.6rem;height:2.6rem;border-radius:var(--chakra-radii-md,.375rem);display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--chakra-colors-primary-500,#3182ce),var(--chakra-colors-purple-500,#805ad5));box-shadow:0 8px 20px -8px var(--chakra-colors-primary-500,#3182ce)}" +
      "#jinx-lw .jlw-tx{min-width:0;text-align:start}#jinx-lw b{display:block;font-size:var(--chakra-fontSizes-md,1rem);font-weight:700;line-height:1.4}#jinx-lw span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.7;line-height:1.6}" +
      "@keyframes jlwIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}@keyframes jwg{to{background-position:200% 0}}";
    (document.head || document.documentElement).appendChild(st); })();
  setInterval(loginWelcome, 600); setTimeout(loginWelcome, 50);
  window.jinxResellers = openResellers;
  window.jinxCredit = openCredit;

  // add our items to the main ☰ menu as native-looking entries (same classes + same heroicon style)
  //   everyone      : change username & password
  //   main admin    : reseller panels
  //   reseller      : reseller credit
  var MAIN = /core|host|node|هسته|هاست|نود|ядр|хост|узл|核心|主机|节点/i;
  var OUT = /log ?out|sign ?out|خروج|выход|выйти|退出|登出|注销/i;
  function makeItem(list, ref, cls, icon, text, open) {
    var it = ref.cloneNode(true);
    it.classList.add("jinx-item", cls);
    ["id", "data-index", "href", "aria-disabled", "data-active", "data-focus", "data-hover"].forEach(function (a) { it.removeAttribute(a); });
    it.setAttribute("tabindex", "-1"); it.setAttribute("type", "button");
    var s = it.querySelector("svg");
    if (s) {
      var size = s.getAttribute("width") || "", sc = s.getAttribute("class") || "";
      var tmp = document.createElement("span"); tmp.innerHTML = svg(icon, size || 16);
      var ns = tmp.firstChild; if (sc) ns.setAttribute("class", sc);
      if (!size) { ns.removeAttribute("width"); ns.removeAttribute("height"); }
      s.parentNode.replaceChild(ns, s);
    }
    var spans = it.querySelectorAll("span"), textHost = null;
    for (var k = spans.length - 1; k >= 0; k--) { if (!spans[k].querySelector("svg") && !spans[k].classList.contains("chakra-menu__icon-wrapper")) { textHost = spans[k]; break; } }
    if (textHost) textHost.textContent = text;
    else { Array.prototype.slice.call(it.childNodes).forEach(function (n) { if (n.nodeType === 3) n.remove(); }); it.appendChild(document.createTextNode(text)); }
    // Chakra highlights menu items through data-focus (not :hover), so mirror that exactly like the native items
    it.addEventListener("mouseenter", function () {
      Array.prototype.forEach.call(list.querySelectorAll("[data-focus]"), function (x) { if (x !== it) x.removeAttribute("data-focus"); });
      it.setAttribute("data-focus", ""); it.setAttribute("data-hover", "");
    });
    it.addEventListener("mouseleave", function () { it.removeAttribute("data-focus"); it.removeAttribute("data-hover"); });
    it.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      try { list.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); } catch (x) {}
      open();
    });
    return it;
  }
  function inject(list) {
    try { css(); } catch (e) {}
    // the panel keeps its menu in the page between logins: a new login = start clean (a reseller never inherits admin items)
    var tk0 = token();
    if (list.__jtok !== tk0) { Array.prototype.forEach.call(list.querySelectorAll(".jinx-item"), function (x) { x.remove(); }); list.__jtok = tk0; }
    var items = list.querySelectorAll('[role="menuitem"]:not(.jinx-item)');
    var txt = list.textContent || "";
    if (items.length < 2 || !(MAIN.test(txt) || OUT.test(txt))) return;
    var ref = null;
    for (var i = 0; i < items.length; i++) { if (items[i].querySelector("svg")) { ref = items[i]; break; } }
    ref = ref || items[0];
    var place = function (it) {
      // right after the settings items; for resellers (no settings items) just before Logout
      var after = null, logout = null, ours = list.querySelectorAll(".jinx-item");
      for (var m = 0; m < items.length; m++) { if (MAIN.test(items[m].textContent || "")) after = items[m]; if (!logout && OUT.test(items[m].textContent || "")) logout = items[m]; }
      if (ours.length) after = ours[ours.length - 1];
      var host = (after || logout || ref).parentNode;
      if (after) host.insertBefore(it, after.nextSibling);
      else if (logout) host.insertBefore(it, logout);
      else list.appendChild(it);
    };
    var add = function (cls, icon, text, open) { if (!list.querySelector("." + cls)) place(makeItem(list, ref, cls, icon, text, open)); };
    add("jinx-pw-item", KEY_PATH, t("item"), openModal);
    var role = function (info) {
      if (!info || !document.contains(list) || list.__jtok !== token()) return;
      if (!info.sudo) Array.prototype.forEach.call(list.querySelectorAll(".jinx-rs-item"), function (x) { x.remove(); });
      if (!info.reseller) Array.prototype.forEach.call(list.querySelectorAll(".jinx-me-item"), function (x) { x.remove(); });
      if (info.sudo) add("jinx-rs-item", GROUP_PATH, rt("item"), openResellers);
      else if (info.reseller) add("jinx-me-item", PIE_PATH, rt("meItem"), openCredit);
    };
    if (ME.info && ME.tok === token()) role(ME.info); else me().then(role);
  }
  var injPend = false;
  new MutationObserver(function () {
    if (injPend) return; injPend = true;
    (window.requestAnimationFrame || setTimeout)(function () { injPend = false;
      var lists = document.querySelectorAll('[role="menu"]');
      for (var i = 0; i < lists.length; i++) inject(lists[i]);
    }, 16);
  }).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { me().then(function (m) { if (m && m.reseller) rememberAgent(); else if (m && m.sudo) forgetAgent(); welcome(m); }, function () {}); }, 900);   // warm up: menu opens with the right items at once
  var lastTok = token();
  var lastLang = lang();
  setInterval(function () {
    var tk = token(), lg = lang();
    if (lg !== lastLang) {                      // panel language switched -> our items, labels and banners follow at once
      lastLang = lg;
      Array.prototype.forEach.call(document.querySelectorAll('[role="menu"]'), function (l) { Array.prototype.forEach.call(l.querySelectorAll(".jinx-item"), function (x) { x.remove(); }); l.__jtok = null; inject(l); });
      var lw = document.getElementById("jinx-lw"); if (lw) lw.remove();
    }
    if (tk !== lastTok) {                       // logged in / out / switched account -> menu items are rebuilt for the new role
      lastTok = tk; ME.info = null; ME.tok = null;
      Array.prototype.forEach.call(document.querySelectorAll('[role="menu"]'), function (l) { Array.prototype.forEach.call(l.querySelectorAll(".jinx-item"), function (x) { x.remove(); }); l.__jtok = null; inject(l); });
      if (tk) me().then(function (m) { if (m && m.reseller) rememberAgent(); else if (m && m.sudo) forgetAgent(); welcome(m); }, function () {});
    }
  }, 700);


  // =============================================================================================
  // 🔐 LOGIN LOCK SCREEN - after 10 wrong passwords the server locks login for a while;
  //    this shows it in the panel's own theme with a live countdown (server time is the truth)
  // =============================================================================================
  var LT = {
    fa: { title: "ورود موقتاً قفل شد", desc: "برای حفاظت از پنل، به دلیل {n} بار وارد کردن رمز اشتباه، ورود برای مدتی بسته شده است.",
          until: "تا باز شدن ورود", tries: "تلاش ناموفق", opens: "زمان باز شدن", again: "تلاش دوباره", wait: "لطفاً صبر کنید",
          open: "ورود دوباره باز شد", openD: "حالا می‌توانید با نام کاربری و رمز درست وارد شوید.",
          tip1: "نام کاربری و رمز را با دقت وارد کنید (حروف بزرگ و کوچک فرق دارند).", tip2: "اگر رمز را فراموش کرده‌اید، با مدیر پنل تماس بگیرید. تلاش بیشتر، زمان قفل را تمدید نمی‌کند.",
          left: "رمز عبور اشتباه است. {n} تلاش دیگر تا قفل موقت ورود باقی مانده.", sec: "ثانیه", min: "دقیقه" },
    en: { title: "Login temporarily locked", desc: "To protect the panel, login is closed for a while after {n} wrong passwords.",
          until: "until login opens", tries: "Failed attempts", opens: "Opens at", again: "Try again", wait: "Please wait",
          open: "Login is open again", openD: "You can now sign in with the correct username and password.",
          tip1: "Type the username and password carefully (they are case sensitive).", tip2: "Forgot the password? Contact the panel administrator. Waiting does not extend the lock.",
          left: "Wrong password. {n} attempts left before login is locked for a while.", sec: "sec", min: "min" }
  };
  LT.ru = {"title":"Вход временно заблокирован","desc":"Для защиты панели вход закрыт на время после {n} неверных паролей.","until":"до открытия входа","tries":"Неудачных попыток","opens":"Откроется в","again":"Повторить","wait":"Пожалуйста, подождите","open":"Вход снова открыт","openD":"Теперь можно войти с правильным именем и паролем.","tip1":"Вводите имя и пароль внимательно (регистр букв важен).","tip2":"Забыли пароль? Свяжитесь с администратором панели. Ожидание не продлевает блокировку.","left":"Неверный пароль. Осталось попыток до временной блокировки: {n}.","sec":"сек","min":"мин"};
  LT.zh = {"title":"登录已暂时锁定","desc":"为保护面板，连续 {n} 次密码错误后登录将暂时关闭。","until":"后恢复登录","tries":"失败次数","opens":"恢复时间","again":"重试","wait":"请稍候","open":"登录已恢复","openD":"现在可以使用正确的用户名和密码登录。","tip1":"请仔细输入用户名和密码（区分大小写）。","tip2":"忘记密码？请联系面板管理员。等待不会延长锁定时间。","left":"密码错误。再错 {n} 次将暂时锁定登录。","sec":"秒","min":"分钟"};
  function lt(k) { return (LT[lang()] || LT.en)[k]; }
  var LOCK_KEY = "jinx-lock-until", LOCK_PATH = "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z";
  var OPEN_PATH = "M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z";
  var Lock = { el: null, timer: null, until: 0, total: 300, max: 10 };
  function lockCss() {
    if (document.getElementById("jinx-lock-css")) return;
    var P = "var(--chakra-colors-primary-500,var(--chakra-colors-blue-500,#3182ce))", B = "var(--chakra-colors-chakra-border-color,#e2e8f0)";
    var s = document.createElement("style"); s.id = "jinx-lock-css";
    s.textContent =
      "#jinx-lock{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:inherit;" +
        "background:var(--chakra-colors-blackAlpha-600,rgba(0,0,0,.48));backdrop-filter:blur(12px) saturate(1.2);-webkit-backdrop-filter:blur(12px) saturate(1.2);animation:jlf .25s ease-out}" +
      "#jinx-lock .jl-card{position:relative;width:100%;max-width:25rem;border-radius:var(--chakra-radii-xl,.75rem);padding:2rem 1.5rem 1.5rem;text-align:center;overflow:hidden;" +
        "background:var(--chakra-colors-white,#fff);color:var(--chakra-colors-gray-800,#1a202c);box-shadow:0 25px 60px -15px rgba(0,0,0,.45);animation:jls .35s cubic-bezier(.2,.9,.3,1.2)}" +
      ".chakra-ui-dark #jinx-lock .jl-card,#jinx-lock.dark .jl-card{background:var(--chakra-colors-gray-700,#2d3748);color:var(--chakra-colors-whiteAlpha-900,rgba(255,255,255,.92))}" +
      "#jinx-lock .jl-card::before{content:'';position:absolute;inset:0 0 auto 0;height:4px;background:linear-gradient(90deg,var(--chakra-colors-red-400,#f56565),var(--chakra-colors-orange-400,#ed8936))}" +
      "#jinx-lock.ok .jl-card::before{background:linear-gradient(90deg,var(--chakra-colors-green-400,#48bb78),var(--chakra-colors-teal-400,#38b2ac))}" +
      "#jinx-lock .jl-icon{width:3.5rem;height:3.5rem;margin:0 auto 1rem;border-radius:9999px;display:grid;place-items:center;color:#fff;" +
        "background:var(--chakra-colors-red-400,#f56565);box-shadow:0 0 0 8px var(--chakra-colors-red-100,#fed7d7);animation:jlp 2s ease-in-out infinite}" +
      ".chakra-ui-dark #jinx-lock .jl-icon,#jinx-lock.dark .jl-icon{box-shadow:0 0 0 8px rgba(245,101,101,.18)}" +
      "#jinx-lock.ok .jl-icon{background:var(--chakra-colors-green-400,#48bb78);box-shadow:0 0 0 8px var(--chakra-colors-green-100,#c6f6d5);animation:none}" +
      ".chakra-ui-dark #jinx-lock.ok .jl-icon,#jinx-lock.dark.ok .jl-icon{box-shadow:0 0 0 8px rgba(72,187,120,.2)}" +
      "#jinx-lock h2{font-size:var(--chakra-fontSizes-xl,1.25rem);font-weight:700;margin:0 0 .5rem}" +
      "#jinx-lock .jl-desc{font-size:var(--chakra-fontSizes-sm,.875rem);opacity:.75;line-height:1.8;margin:0 auto 1.25rem;max-width:21rem}" +
      "#jinx-lock .jl-ring{position:relative;width:9.5rem;height:9.5rem;margin:0 auto 1.25rem}" +
      "#jinx-lock .jl-ring svg{width:100%;height:100%;transform:rotate(-90deg)}" +
      "#jinx-lock .jl-ring .t{fill:none;stroke:var(--chakra-colors-gray-100,#edf2f7);stroke-width:8}" +
      ".chakra-ui-dark #jinx-lock .jl-ring .t,#jinx-lock.dark .jl-ring .t{stroke:var(--chakra-colors-whiteAlpha-200,rgba(255,255,255,.08))}" +
      "#jinx-lock .jl-ring .v{fill:none;stroke:" + P + ";stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset .3s linear,stroke .3s}" +
      "#jinx-lock.ok .jl-ring .v{stroke:var(--chakra-colors-green-400,#48bb78)}" +
      "#jinx-lock .jl-time{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}" +
      "#jinx-lock .jl-time b{font-size:2.25rem;font-weight:700;line-height:1;direction:ltr;font-variant-numeric:tabular-nums;letter-spacing:.5px}" +
      "#jinx-lock .jl-time small{font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6;margin-top:.4rem}" +
      "#jinx-lock .jl-info{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1rem}" +
      "#jinx-lock .jl-info div{border:1px solid " + B + ";border-radius:var(--chakra-radii-md,.375rem);padding:.6rem .5rem}" +
      "#jinx-lock .jl-info span{display:block;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.6}" +
      "#jinx-lock .jl-info b{display:block;font-size:var(--chakra-fontSizes-md,1rem);margin-top:.15rem;direction:ltr;font-variant-numeric:tabular-nums}" +
      "#jinx-lock .jl-tips{text-align:start;font-size:var(--chakra-fontSizes-xs,.75rem);opacity:.7;line-height:1.8;margin:0 0 1.25rem;padding-inline-start:1.1rem}" +
      "#jinx-lock button{width:100%;height:2.5rem;border:0;border-radius:var(--chakra-radii-md,.375rem);font:inherit;font-weight:600;font-size:var(--chakra-fontSizes-sm,.875rem);cursor:pointer;" +
        "background:" + P + ";color:#fff;transition:background .2s,opacity .2s,transform .1s}" +
      "#jinx-lock button:hover:not(:disabled){background:var(--chakra-colors-primary-600,var(--chakra-colors-blue-600,#2b6cb0))}#jinx-lock button:active:not(:disabled){transform:scale(.98)}" +
      "#jinx-lock button:disabled{opacity:.45;cursor:not-allowed}" +
      "#jinx-lock button:focus-visible{outline:2px solid " + P + ";outline-offset:2px}" +
      "#jinx-left{position:fixed;z-index:2147482000;left:50%;bottom:1.5rem;transform:translateX(-50%);max-width:calc(100vw - 2rem);display:flex;gap:.6rem;align-items:center;" +
        "padding:.75rem 1rem;border-radius:var(--chakra-radii-md,.375rem);font-size:var(--chakra-fontSizes-sm,.875rem);font-weight:500;color:#fff;" +
        "background:var(--chakra-colors-orange-500,#dd6b20);box-shadow:var(--chakra-shadows-lg,0 10px 15px -3px rgba(0,0,0,.2));animation:jls .25s ease-out}" +
      "@keyframes jlf{from{opacity:0}}@keyframes jls{from{opacity:0;transform:translateY(12px) scale(.96)}}" +
      "@keyframes jlp{50%{transform:scale(1.06)}}" +
      "#jinx-left{animation:none}" +
      "@media (prefers-reduced-motion:reduce){#jinx-lock,#jinx-lock *{animation:none!important;transition:none!important}}";
    document.head.appendChild(s);
  }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  Lock.show = function (seconds, max) {
    seconds = Math.max(1, Math.min(3600, Math.round(Number(seconds) || 0)));
    Lock.until = Date.now() + seconds * 1000; Lock.max = Number(max) || 10;
    Lock.total = Math.max(300, seconds);
    try { localStorage.setItem(LOCK_KEY, String(Lock.until)); localStorage.setItem(LOCK_KEY + "-total", String(Lock.total)); } catch (e) {}
    Lock.render();
  };
  Lock.render = function () {
    if (!document.body) { document.addEventListener("DOMContentLoaded", Lock.render); return; }
    lockCss(); var hl = document.getElementById("jinx-left"); if (hl) hl.remove();
    var w = Lock.el;
    if (!w || !document.contains(w)) {
      w = Lock.el = document.createElement("div"); w.id = "jinx-lock"; w.setAttribute("role", "alertdialog"); w.setAttribute("aria-modal", "true");
      w.setAttribute("dir", dirOf());
      w.innerHTML = '<div class="jl-card"><div class="jl-icon">' + svg(LOCK_PATH, 26) + '</div><h2></h2><p class="jl-desc"></p>' +
        '<div class="jl-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="t" cx="60" cy="60" r="52"/><circle class="v" cx="60" cy="60" r="52" stroke-dasharray="326.73" stroke-dashoffset="0"/></svg>' +
        '<div class="jl-time"><b aria-live="polite">00:00</b><small></small></div></div>' +
        '<div class="jl-info"><div><span></span><b class="jl-tr"></b></div><div><span></span><b class="jl-at"></b></div></div>' +
        '<ul class="jl-tips"><li></li><li></li></ul><button type="button" disabled></button></div>';
      document.body.appendChild(w);
      var spans = w.querySelectorAll(".jl-info span"); spans[0].textContent = lt("tries"); spans[1].textContent = lt("opens");
      var li = w.querySelectorAll(".jl-tips li"); li[0].textContent = lt("tip1"); li[1].textContent = lt("tip2");
      w.querySelector(".jl-time small").textContent = lt("until");
      w.querySelector("button").onclick = function () { if (Date.now() >= Lock.until) Lock.clear(true); };
      w.addEventListener("keydown", function (e) { if (e.key === "Tab") { e.preventDefault(); w.querySelector("button").focus(); } });
    }
    var dark = document.body.classList.contains("chakra-ui-dark") || document.documentElement.getAttribute("data-theme") === "dark";
    w.classList.toggle("dark", dark);
    w.querySelector("h2").textContent = lt("title");
    w.querySelector(".jl-desc").textContent = lt("desc").replace("{n}", Lock.max);
    w.querySelector(".jl-tr").textContent = Lock.max + " / " + Lock.max;
    var at = new Date(Lock.until); w.querySelector(".jl-at").textContent = two(at.getHours()) + ":" + two(at.getMinutes()) + ":" + two(at.getSeconds());
    clearInterval(Lock.timer); Lock.timer = setInterval(Lock.tick, 250); Lock.tick();
    setTimeout(function () { try { w.querySelector("button").focus({ preventScroll: true }); } catch (e) {} }, 50);
  };
  Lock.tick = function () {
    var w = Lock.el; if (!w) return;
    var ms = Lock.until - Date.now(), s = Math.max(0, Math.ceil(ms / 1000));
    w.querySelector(".jl-time b").textContent = two(Math.floor(s / 60)) + ":" + two(s % 60);
    var frac = Math.max(0, Math.min(1, s / Lock.total));
    w.querySelector(".jl-ring .v").setAttribute("stroke-dashoffset", (326.73 * (1 - frac)).toFixed(2));
    var btn = w.querySelector("button");
    if (s <= 0) {
      clearInterval(Lock.timer); w.classList.add("ok");
      w.querySelector(".jl-icon").innerHTML = svg(OPEN_PATH, 26);
      w.querySelector("h2").textContent = lt("open"); w.querySelector(".jl-desc").textContent = lt("openD");
      w.querySelector(".jl-time small").textContent = "";
      btn.disabled = false; btn.textContent = lt("again"); btn.focus({ preventScroll: true });
      try { localStorage.removeItem(LOCK_KEY); } catch (e) {}
    } else {
      w.classList.remove("ok"); btn.disabled = true; btn.textContent = lt("wait") + " · " + s + " " + lt("sec");
    }
  };
  Lock.clear = function (focusForm) {
    clearInterval(Lock.timer);
    if (Lock.el) { Lock.el.remove(); Lock.el = null; }
    try { localStorage.removeItem(LOCK_KEY); } catch (e) {}
    if (focusForm) { var pw = document.querySelector('input[type="password"]'); if (pw) pw.focus(); }
  };
  Lock.hint = function (left) {
    var old = document.getElementById("jinx-left"); if (old) old.remove();
    if (!(left >= 0) || left > 5 || !document.body) return;
    lockCss();
    var d = document.createElement("div"); d.id = "jinx-left"; d.setAttribute("role", "status");
    d.setAttribute("dir", dirOf());
    d.innerHTML = svg("M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z", 20) + "<span></span>";
    d.lastChild.textContent = lt("left").replace("{n}", left);
    document.body.appendChild(d);
    clearTimeout(Lock.ht); Lock.ht = setTimeout(function () { d.remove(); }, 6000);
  };
  function onLoginResponse(status, read, header) {
    if (status === 429) {
      read().then(function (j) { if (j && j.locked) Lock.show(j.retry_after, j.max); }).catch(function () {});
    } else if (status === 401) {
      var l = header("X-Jinx-Attempts-Left"); if (l != null && l !== "") Lock.hint(parseInt(l, 10));
    } else if (status >= 200 && status < 300) {
      Lock.clear(false); var h = document.getElementById("jinx-left"); if (h) h.remove();
    }
  }
  var TOKEN_RE = /\/api\/admin\/token(\?|$)/;
  // 🌐 a reseller with its own domain: every subscription link in its panel (list, copy, QR) uses that domain
  var SUB_KEY = "jinx-subdom", USERS_RE = /\/api\/users?(\/|\?|$)/;
  function jwtUser() { try { var p = token().split(".")[1]; return p ? JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))).sub || "" : ""; } catch (e) { return ""; } }
  function subDomSave(m) { try { if (m && m.reseller && m.domain) localStorage.setItem(SUB_KEY, JSON.stringify({ u: m.username, d: m.domain })); else localStorage.removeItem(SUB_KEY); } catch (e) {} }
  function subDom() { try { var o = JSON.parse(localStorage.getItem(SUB_KEY) || "null"); return o && o.d && o.u && o.u === jwtUser() ? o.d : ""; } catch (e) { return ""; } }
  function subRewrite(r, dom) {
    try { if (!r || !r.ok || !/json/i.test(r.headers.get("content-type") || "")) return r; } catch (e) { return r; }
    return r.clone().text().then(function (t) {
      var t2 = t.replace(/("subscription_url"\s*:\s*")(?:https?:\/\/[^\/"]+)?(\/)/g, "$1https://" + dom + "$2");
      return t2 === t ? r : new Response(t2, { status: r.status, statusText: r.statusText, headers: r.headers });
    }).catch(function () { return r; });
  }
  var nativeFetch = window.__jinxFetch || window.fetch;
  if (window.fetch && !window.fetch.__jinx) {   // the panel logs in through fetch: watch only the login call
    window.__jinxFetch = nativeFetch;
    var patched = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var p = nativeFetch.apply(this, arguments);
      if (TOKEN_RE.test(url)) p.then(function (r) { try { onLoginResponse(r.status, function () { return r.clone().json(); }, function (h) { return r.headers.get(h); }); } catch (e) {} }, function () {});
      var sd = USERS_RE.test(url) && subDom();
      return sd ? p.then(function (r) { return subRewrite(r, sd); }) : p;
    };
    patched.__jinx = true; window.fetch = patched;
  }
  if (window.XMLHttpRequest && !XMLHttpRequest.prototype.open.__jinx) {   // and through XHR, in case a version uses axios
    var xo = XMLHttpRequest.prototype.open, xs = XMLHttpRequest.prototype.send;
    var no = function (m, u) { this.__jinxLogin = TOKEN_RE.test(String(u || "")); return xo.apply(this, arguments); };
    no.__jinx = true;
    XMLHttpRequest.prototype.open = no;
    XMLHttpRequest.prototype.send = function () {
      var x = this;
      if (x.__jinxLogin) x.addEventListener("loadend", function () {
        try { onLoginResponse(x.status, function () { return Promise.resolve(JSON.parse(x.responseText || "null")); }, function (h) { return x.getResponseHeader(h); }); } catch (e) {}
      });
      return xs.apply(this, arguments);
    };
  }
  // reload during a lock -> the lock screen comes back at once; the server is asked too (it is the truth)
  (function () {
    var u = 0, tot = 300;
    try { u = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10); tot = parseInt(localStorage.getItem(LOCK_KEY + "-total") || "300", 10) || 300; } catch (e) {}
    if (u > Date.now()) { Lock.until = u; Lock.total = tot; Lock.render(); }
    var check = function () {
      if (!/login/i.test(location.pathname + location.hash) && !Lock.el) return;
      nativeFetch("/jinx-api/lock-status", { credentials: "same-origin", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.locked) Lock.show(j.retry_after, j.max); else if (Lock.el && j && j.ok && !j.locked && Date.now() < Lock.until) { Lock.until = Date.now(); Lock.tick(); }
      }).catch(function () {});
    };
    setTimeout(check, 600);
  })();
  window.jinxLock = Lock;

  // 💎 the panel's own «Donation / حمایت مالی» menu item opens our donation page (/donate/) (same tab, see openDonate).
  //    Capture phase: runs before React, keeps the panel's own onClick (the yellow dot still clears).
  var DON_RE = /github\.com\/(gozargah\/marzban|x4gpanell)\/?#donation/i, DON_TXT = /^(donation|donate|حمایت مالی|حمایت|کمک مالی|دونیت|پشتیبانی مالی|捐赠|赞助|捐助|пожертвован|поддерж|донат)/i;
  function isDonate(el) {
    var a = el.closest && el.closest("a[href]");
    if (a && DON_RE.test(a.getAttribute("href") || "")) return a;
    var mi = el.closest && el.closest('[role="menuitem"]');
    if (mi && DON_TXT.test((mi.textContent || "").trim())) return mi;
    return null;
  }
  document.addEventListener("click", function (e) {
    if (e.button !== 0 && e.type === "click") return;
    var t = isDonate(e.target); if (!t) return;
    e.preventDefault();
    openDonate();
  }, true);
  // opens in the same tab (never blocked as a popup, works in the installed app too); the page has its own «back to panel» button
  var donGo = false;
  function openDonate() {
    if (donGo) return; donGo = true;
    try { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); } catch (x) {}
    var url = "/donate/", go = function () { location.assign(url); }, done = false, t = setTimeout(function () { if (!done) { done = true; go(); } }, 1500);
    (window.__jinxFetch || fetch)("/donate/", { cache: "no-store", credentials: "same-origin" }).then(function (r) {
      if (done) return; done = true; clearTimeout(t);
      if (!r.ok) url = "/jinx-api/donate-page";   // main address failed -> same page from the backup address (never an error page)
      go();
    }, function () { if (!done) { done = true; clearTimeout(t); go(); } });
  }
  window.jinxDonate = openDonate;
  function fixDonate() { var as = document.querySelectorAll('a[href*="#donation"]'); for (var i = 0; i < as.length; i++) if (DON_RE.test(as[i].getAttribute("href") || "")) { as[i].setAttribute("href", location.origin + "/donate/"); as[i].removeAttribute("target"); } }

  // 🔗 GitHub link of the panel -> Super JinX GitHub (backup for nginx)
  var GH = "https://github.com/x4gpanell", GH_OLD = /^https?:\/\/(www\.)?github\.com\/gozargah(\/marzban)?\/?$/i;
  var ghShadowDone = false, ghLastScan = 0;
  function fixLinks() {
    var as = document.querySelectorAll('a[href*="github.com"]');
    for (var i = 0; i < as.length; i++) if (GH_OLD.test(as[i].getAttribute("href") || "")) as[i].setAttribute("href", GH);
    fixDonate();
    // GitHub "Star" button draws its link in a shadow root: scan for it rarely, and stop once it is fixed
    if (ghShadowDone || Date.now() - ghLastScan < 5000) return;
    ghLastScan = Date.now();
    var sp = document.querySelectorAll("span");
    for (var k = 0; k < sp.length; k++) {
      var sr = sp[k].shadowRoot; if (!sr) continue;
      var ls = sr.querySelectorAll("a[href]");
      for (var m = 0; m < ls.length; m++) if (/github\.com/i.test(ls[m].getAttribute("href") || "")) {
        if (GH_OLD.test(ls[m].getAttribute("href"))) ls[m].setAttribute("href", GH);
        ghShadowDone = true;
      }
    }
  }
  var ghPend = false;
  new MutationObserver(function () { if (ghPend) return; ghPend = true; setTimeout(function () { ghPend = false; fixLinks(); }, 400); })
    .observe(document.documentElement, { childList: true, subtree: true });
  fixLinks();

  // ⭐ header GitHub button (with the star counter) -> our own twin: [GitHub x4gpanell | ♥ حمایت مالی]
  //    same size and shape as the original, follows the panel's light/dark theme; the right half opens the donation page
  var GH_SVG = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';
  var HEART_SVG = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002Z"/></svg>';
  (function () { var st = document.createElement("style"); st.textContent =
    ".jgh{display:inline-flex;align-items:stretch;vertical-align:middle;direction:ltr;height:var(--jgh-h,28px);font:600 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,'Vazirmatn',sans-serif;border-radius:6px;user-select:none}" +
    ".jgh a{display:inline-flex;align-items:center;gap:6px;padding:0 10px;text-decoration:none!important;white-space:nowrap;cursor:pointer;transition:background .2s,color .2s,border-color .2s;" +
      "color:#24292f;background:#f6f8fa;border:1px solid rgba(31,35,40,.15)}" +
    ".jgh a:hover{background:#eaeef2}.jgh a:focus-visible{outline:2px solid #0969da;outline-offset:1px}" +
    ".jgh .jgh-b{border-radius:6px 0 0 6px}.jgh .jgh-d{border-radius:0 6px 6px 0;border-left:0;direction:ltr;font-family:'Vazirmatn',-apple-system,'Segoe UI',Tahoma,sans-serif;font-weight:700}" +
    ".jgh .jgh-d svg{color:#cf222e;animation:jghb 2.4s ease-in-out infinite}@keyframes jghb{0%,100%{transform:scale(1)}12%{transform:scale(1.25)}24%{transform:scale(1)}}" +
    ".chakra-ui-dark .jgh a{color:#adbac7;background:#373e47;border-color:#444c56}.chakra-ui-dark .jgh a:hover{background:#444c56;color:#cdd9e5}.chakra-ui-dark .jgh .jgh-d svg{color:#f47067}" +
    "html[lang=fa] .jgh .jgh-d{direction:rtl}" +
    ".jgh.jgh-solo .jgh-d{border-radius:6px;border-left:1px solid rgba(31,35,40,.15)}.chakra-ui-dark .jgh.jgh-solo .jgh-d{border-left-color:#444c56}" +
    "@media (prefers-reduced-motion:reduce){.jgh .jgh-d svg{animation:none}}@media (max-width:480px){.jgh .jgh-b span{display:none}.jgh a{padding:0 8px}}@media (max-width:360px){.jgh.jgh-solo .jgh-d span{display:none}}";
    (document.head || document.documentElement).appendChild(st); })();
  // the GitHub star widget draws itself in a (sometimes closed) shadow root: keep shadow roots open so we can always find it
  try { if (Element.prototype.attachShadow && !Element.prototype.attachShadow.__jinx) { var aS = Element.prototype.attachShadow;
    var oS = function (o) { return aS.call(this, Object.assign({}, o || {}, { mode: "open" })); }; oS.__jinx = true; Element.prototype.attachShadow = oS; } } catch (e) {}
  var GH_LINK = 'a[href*="github.com" i]';
  function ghWraps() {
    // every form the header star widget can have: before it loads (plain link), loaded (shadow root / iframe), or blocked
    var out = [], add = function (el) { if (el && !el.closest(".jgh") && !el.closest("footer") && !el.closest('[role="menu"]') && out.indexOf(el) < 0) out.push(el); };
    var ls = document.querySelectorAll('a[data-show-count],a[data-icon*="star" i],a.github-button,a[href*="github.com" i][aria-label*="star" i]');
    for (var j = 0; j < ls.length; j++) add(ls[j].parentElement && ls[j].parentElement.children.length === 1 && ls[j].parentElement.tagName === "SPAN" ? ls[j].parentElement : ls[j]);
    var hs = document.querySelectorAll("span:empty,div:empty");
    for (var i = 0; i < hs.length; i++) { var sr = hs[i].shadowRoot; if (sr && (sr.querySelector(GH_LINK) || /github/i.test(sr.innerHTML || ""))) { var p = hs[i].parentElement; add(p && p.children.length === 1 && p.tagName === "SPAN" ? p : hs[i]); } }
    var fr = document.querySelectorAll('iframe[src*="github" i],iframe[title*="GitHub" i]');
    for (var k = 0; k < fr.length; k++) add(fr[k]);
    return out;
  }
  function donLabel() { return L4("حمایت مالی", "Donate", "Поддержать", "赞助"); }
  function donBtn() {
    var tw = document.createElement("span"); tw.className = "jgh jgh-solo"; var dl = donLabel();
    tw.innerHTML = '<a class="jgh-d" href="/donate/" aria-label="' + dl + '" title="' + dl + '">' + HEART_SVG + '<span>' + dl + '</span></a>';
    tw.querySelector(".jgh-d").addEventListener("click", function (e) { if (e.button === 0 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openDonate(); } });
    return tw;
  }
  // 💎 «حمایت مالی» lives in its OWN box on <body>, outside the panel's page: the panel can never remove it,
  //    swap it for the GitHub star, or crash while redrawing its header (that was the page error). The GitHub star
  //    only becomes invisible (its space stays), and the button sits exactly on that spot and never moves on scroll.
  (function () { var st = document.createElement("style"); st.textContent =
    "[data-jinx-gh]{visibility:hidden!important;pointer-events:none!important}" +
    "#jinx-don{position:fixed;z-index:999;top:12px;left:12px;display:none;transition:none!important}#jinx-don.on{display:block}" +
    "#jinx-don .jgh{box-shadow:0 6px 16px -10px rgba(0,0,0,.45);border-radius:6px}" +
    "body:has(.chakra-menu__menu-button[aria-expanded=true]) #jinx-don,body:has(.chakra-popover__popper[style*='visibility: visible']) #jinx-don{z-index:0}";   // an open menu always covers it
    (document.head || document.documentElement).appendChild(st); })();
  var don = { box: null, top: null, left: null, w: 0, th: null, cand: null, t0: 0 };
  function donBox() {
    if (don.box && don.box.isConnected) return don.box;
    var b = document.createElement("div"); b.id = "jinx-don"; b.appendChild(donBtn());
    document.body.appendChild(b); don.box = b; return b;
  }
  function donSlot() {
    var ws = ghWraps();
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i]; if (!w.hasAttribute("data-jinx-gh")) { w.setAttribute("data-jinx-gh", "1"); w.setAttribute("aria-hidden", "true"); }
      var r = w.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return w;
    }
    return null;
  }
  function ghTwin() { return; }   // v14: the old button that followed the GitHub star is off; the fixed one is at the end of this file
  function ghTwinOld() {
    if (!document.body) return;
    var box = donBox();
    if (/login/i.test(location.pathname + location.hash) || !document.querySelector("#root *, #app *, body > div *")) { box.classList.remove("on"); return; }
    var bw = box.firstChild.getBoundingClientRect().width || 110, bh = box.firstChild.getBoundingClientRect().height || 28;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var slot = donSlot(), anchor = null;
    if (slot) {
      // give the hidden star's place the size of our button, so the header layout fits it exactly
      var want = Math.ceil(bw) + "px";
      if (slot.style.width !== want) { slot.style.setProperty("display", "inline-block", "important"); slot.style.width = want; slot.style.minHeight = Math.ceil(bh) + "px"; }
      anchor = slot.getBoundingClientRect();
      if (don.th && don.th.isConnected) { don.th.style.marginInlineStart = ""; don.th = null; }
    } else {
      // no GitHub star at all: make room right before the theme switch, so the button never covers another button
      var th = document.querySelector('button[aria-label*="theme" i],button[aria-label*="تم" i]');
      if (th && th.offsetParent !== null) {
        var gap = Math.ceil(bw) + 16 + "px"; if (th.style.marginInlineStart !== gap) { th.style.marginInlineStart = gap; } don.th = th;
        var tr = th.getBoundingClientRect(), rtl = getComputedStyle(th).direction === "rtl";
        anchor = { top: tr.top + (tr.height - bh) / 2, left: rtl ? tr.right + 8 : tr.left - 8 - bw, width: bw, height: bh }; }
    }
    // 📌 rock-steady: the spot is measured ONLY at the top of the page, must read the same twice in a row before it is
    //    used (the header is still drawing before that), and a change smaller than 3px is ignored. While scrolled it is
    //    never measured again, a missing star for a moment keeps the old spot. Result: the button never jumps or wanders.
    if (anchor && y < 4) {
      var t = Math.round(anchor.top + (anchor.height - bh) / 2), l = Math.round(anchor.left + (anchor.width - bw) / 2);
      l = Math.max(6, Math.min(l, document.documentElement.clientWidth - bw - 6));
      if (t < 0 || t > 160) t = 12;
      if (!don.cand || Math.abs(don.cand[0] - t) > 2 || Math.abs(don.cand[1] - l) > 2) don.cand = [t, l, Date.now()];
      else if (Date.now() - don.cand[2] >= 700 && (don.top === null || Math.abs(t - don.top) > 2 || Math.abs(l - don.left) > 2)) {
        don.top = t; don.left = l; box.style.top = t + "px"; box.style.left = l + "px"; }   // same spot for 0.7 s = the header is done drawing
    }
    if (don.top === null) {
      if (!don.t0) don.t0 = Date.now();
      if (Date.now() - don.t0 < 2500) { box.classList.remove("on"); return; }     // still waiting for the header: stay hidden, never show in a wrong spot
      don.top = 12; don.left = getComputedStyle(document.body).direction === "rtl" ? 12 : Math.max(6, document.documentElement.clientWidth - bw - 12);
      box.style.top = don.top + "px"; box.style.left = don.left + "px";
    }
    box.classList.add("on");
  }
  // only a real width change (rotate / window resize) moves it; the phone's address bar hiding on scroll changes only the height
  var donW = document.documentElement.clientWidth;
  window.addEventListener("resize", function () { var w = document.documentElement.clientWidth; if (w === donW) return; donW = w; don.top = null; don.cand = null; don.t0 = Date.now() - 2000; try { ghTwin(); } catch (e) {} });
  var ghtPend = false;
  new MutationObserver(function (ms) {
    if (ghtPend) return; for (var i = 0; i < ms.length; i++) if (don.box && don.box.contains(ms[i].target)) return;   // our own button changing is not a reason
    ghtPend = true; setTimeout(function () { ghtPend = false; try { ghTwin(); } catch (e) {} }, 150); })
    .observe(document.documentElement, { childList: true, subtree: true });
  setInterval(function () { try { ghTwin(); var dl = document.querySelector("#jinx-don .jgh-d span"), w = donLabel(); if (dl && dl.textContent !== w) { dl.textContent = w; dl.parentNode.setAttribute("aria-label", w); dl.parentNode.setAttribute("title", w); } } catch (e) {} }, 1000);
  try { ghTwin(); } catch (e) {}

  window.jinxChangePassword = openModal; // manual fallback from the browser console
})();

/* 💎 v14 «حمایت مالی» button: ONE fixed spot set only by CSS (bottom corner of the screen).
   Nothing is measured and nothing follows the header, so it can never jump, move, flicker or leave the screen.
   It sits above the page but under every panel menu and dialog, and it is hidden on the login page. */
(function () {
  if (window.__jinxDonFix) return; window.__jinxDonFix = true;
  function lng() { try { return (localStorage.getItem("i18nextLng") || "fa").slice(0, 2); } catch (e) { return "fa"; } }
  function label() { var l = lng(); return l === "fa" ? "حمایت مالی" : l === "ru" ? "Поддержать" : l === "zh" ? "赞助" : "Donate"; }
  var st = document.createElement("style"); st.id = "jinx-donfix-css";
  st.textContent =
    "#jinx-don{display:none!important}" +                                  /* the old moving button never shows again */
    "#jinx-donfix{position:fixed;z-index:990;bottom:calc(16px + env(safe-area-inset-bottom,0px));inset-inline-start:calc(16px + env(safe-area-inset-left,0px));" +
      "display:none;align-items:center;gap:7px;height:40px;max-width:calc(100vw - 32px);padding:0 16px 0 13px;border-radius:999px;box-sizing:border-box;" +
      "font:700 13px/1 'Vazirmatn',-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" +
      "text-decoration:none!important;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;" +
      "color:#24292f;background:#ffffff;border:1px solid rgba(31,35,40,.15);box-shadow:0 10px 28px -12px rgba(0,0,0,.45);" +
      "transition:background .2s,color .2s,border-color .2s,box-shadow .2s;animation:none!important;transform:none!important}" +
    "#jinx-donfix.on{display:inline-flex}" +
    "#jinx-donfix:hover{background:#f3f4f6}#jinx-donfix:active{background:#e5e7eb}" +
    "#jinx-donfix:focus-visible{outline:2px solid #0969da;outline-offset:2px}" +
    "#jinx-donfix svg{flex:none;width:15px;height:15px;color:#cf222e}" +
    "#jinx-donfix svg path{transform-origin:center;transform-box:fill-box;animation:jdfb 2.4s ease-in-out infinite}" +
    "@keyframes jdfb{0%,100%{transform:scale(1)}12%{transform:scale(1.22)}24%{transform:scale(1)}}" +
    ".chakra-ui-dark #jinx-donfix,[data-theme=dark] #jinx-donfix{color:#e6edf3;background:#2d333b;border-color:#444c56;box-shadow:0 10px 28px -12px rgba(0,0,0,.8)}" +
    ".chakra-ui-dark #jinx-donfix:hover,[data-theme=dark] #jinx-donfix:hover{background:#373e47}" +
    ".chakra-ui-dark #jinx-donfix svg,[data-theme=dark] #jinx-donfix svg{color:#f47067}" +
    "body.jinx-donfix-pad{padding-bottom:72px}" +
    "body:has(.chakra-modal__content-container) #jinx-donfix,body:has(.chakra-modal__overlay) #jinx-donfix{display:none!important}" +   /* hidden while any panel window is open */                          /* the last rows of the page never sit under the button */
    "@media (prefers-reduced-motion:reduce){#jinx-donfix svg path{animation:none}}" +
    "@media print{#jinx-donfix{display:none!important}}";
  (document.head || document.documentElement).appendChild(st);
  var HEART = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002Z"/></svg>';
  var btn = null;
  function make() {
    var a = document.createElement("a"); a.id = "jinx-donfix"; a.href = "/donate/";
    a.innerHTML = HEART + "<span></span>";
    a.addEventListener("click", function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      if (typeof window.jinxDonate === "function") { try { window.jinxDonate(); return; } catch (x) {} }
      location.assign("/donate/");
    });
    return a;
  }
  function onLogin() { return /login/i.test(location.pathname + location.hash); }
  function sync() {
    if (!document.body) return;
    if (!btn || !btn.isConnected) { btn = make(); document.body.appendChild(btn); }   /* lives on <body>: the panel never redraws or removes it */
    var t = label(), s = btn.lastChild;
    if (s.textContent !== t) { s.textContent = t; btn.setAttribute("aria-label", t); btn.setAttribute("title", t); }
    var show = !onLogin();
    btn.classList.toggle("on", show);
    document.body.classList.toggle("jinx-donfix-pad", show);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync); else sync();
  setInterval(function () { try { sync(); } catch (e) {} }, 700);
  window.addEventListener("hashchange", function () { try { sync(); } catch (e) {} });
})();

/* 🤝 v14 reseller panel layout (پنل‌های نمایندگی): nothing ever sticks out, one layout for phones and one for computers.
   Only layout rules: every button, form and action of the reseller panel works exactly as before. */
(function () {
  if (window.__jinxRsFix) return; window.__jinxRsFix = true;
  var st = document.createElement("style"); st.id = "jinx-rsfix-css";
  st.textContent =
    "#jinx-rs,#jinx-rs *{box-sizing:border-box}" +
    "#jinx-rs .chakra-modal__content{max-width:min(60rem,calc(100vw - 2rem))!important;width:100%;overflow:hidden}" +
    "#jinx-rs .chakra-modal__body{overflow-x:hidden;min-width:0}" +
    "#jinx-rs button,#jinx-rs input,#jinx-rs select{min-width:0;max-width:100%}" +
    "#jinx-rs .chakra-modal__footer{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:flex-end}" +
    "#jinx-rs .chakra-modal__footer>button{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    "#jinx-rs .jr-acts{display:flex;flex-wrap:wrap;gap:.5rem;min-width:0}#jinx-rs .jr-acts>*{min-width:0}" +
    "#jinx-rs .jr-find{display:flex;flex-wrap:wrap;gap:.5rem;min-width:0}#jinx-rs .jr-find>*{flex:1 1 10rem;min-width:0}" +
    "#jinx-rs .jr-row{display:flex;flex-wrap:wrap;gap:.5rem;min-width:0}#jinx-rs .jr-row>input{flex:1 1 10rem}#jinx-rs .jr-row>button{flex:0 0 auto}" +
    "#jinx-rs .jr-dom select{flex:1 1 12rem}" +
    "#jinx-rs .jr-urow{flex-wrap:nowrap!important}#jinx-rs .jr-urow>input{flex:1 1 auto;min-width:0}" +
    "#jinx-rs select.jr-unit{flex:0 0 4.75rem;width:4.75rem;min-width:4.75rem;padding-inline:.45rem;direction:ltr;text-align:center;cursor:pointer}" +
    ".chakra-ui-dark #jinx-rs select.jr-unit option{background:#2d3748}" +
    /* create screen: package cards in a tidy grid (never a side-scroll), form + live preview card */
    "#jinx-rs .jc{min-width:0}" +
    "#jinx-rs .jc-pk{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:.6rem;overflow:visible!important;margin:0 0 1.1rem!important;padding:0!important}" +
    "#jinx-rs .jc-p{flex:none!important;min-width:0;width:auto;padding:.7rem .75rem .65rem;gap:.2rem}" +
    "#jinx-rs .jc-p b{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    "#jinx-rs .jc-p small{display:block;max-width:100%;white-space:normal!important;line-height:1.35;overflow-wrap:anywhere}" +
    "#jinx-rs .jc-p.on{box-shadow:0 0 0 2px var(--chakra-colors-primary-500,#3182ce)}" +
    "#jinx-rs .jc-grid{display:grid;grid-template-columns:minmax(0,1fr) 17rem;gap:1.25rem;align-items:start}" +
    "#jinx-rs .jc-form{min-width:0}#jinx-rs .jc-form>*{min-width:0}" +
    "#jinx-rs .jc-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}" +
    "#jinx-rs .jc-prev{position:sticky;top:0;min-width:0}" +
    "#jinx-rs .jc-kv div,#jinx-rs .jc-url{min-width:0}#jinx-rs .jc-kv b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    "#jinx-rs .jc-url b{overflow-wrap:anywhere}" +
    "#jinx-rs .jc-tag{display:inline-block;margin-bottom:.5rem}#jinx-rs .jc-nm,#jinx-rs .jc-un{display:block;max-width:100%;overflow-wrap:anywhere}" +
    "#jinx-rs .jc-cred>div{display:flex;align-items:center;gap:.5rem;min-width:0;flex-wrap:wrap}#jinx-rs .jc-cred b{flex:1 1 8rem;min-width:0;overflow-wrap:anywhere}" +
    /* 📱 phones and small tablets */
    "@media (max-width:760px){" +
      "#jinx-rs .chakra-modal__content{max-width:calc(100vw - 1rem)!important;margin:.5rem!important}" +
      "#jinx-rs .chakra-modal__body{padding-inline:1rem!important}" +
      "#jinx-rs .chakra-modal__footer{padding:.75rem 1rem!important;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:.5rem}" +
      "#jinx-rs .chakra-modal__footer>button{width:100%;padding-inline:.5rem}" +
      "#jinx-rs .chakra-modal__footer.jc-foot{position:sticky;bottom:0;z-index:2;background:inherit}" +
      "#jinx-rs .jc-pk{grid-template-columns:repeat(2,minmax(0,1fr))}#jinx-rs .jc-pk .jc-custom{grid-column:1/-1}" +
      "#jinx-rs .jc-grid{grid-template-columns:minmax(0,1fr);gap:1rem}#jinx-rs .jc-prev{position:static;order:-1}" +
      "#jinx-rs .jc-glow{display:none}#jinx-rs .jc-kv{grid-template-columns:repeat(3,minmax(0,1fr))}" +
      "#jinx-rs .jc-kv div{flex-direction:column;align-items:flex-start;gap:.1rem;padding:.4rem .5rem}" +
      "#jinx-rs .jr-dom{flex-direction:column}#jinx-rs .jr-dom>*{flex:1 1 auto;width:100%}" +
    "}" +
    "@media (max-width:420px){#jinx-rs .jc-3{grid-template-columns:1fr 1fr}#jinx-rs .jc-3>div:last-child{grid-column:1/-1}}" +
    "@media (max-width:360px){#jinx-rs .chakra-modal__footer{grid-template-columns:1fr!important}#jinx-rs .chakra-modal__footer>button:last-child{order:-1}}" +
    "@media (max-width:340px){#jinx-rs .jc-kv{grid-template-columns:1fr}#jinx-rs .jc-kv div{flex-direction:row;justify-content:space-between}}";
  (document.head || document.documentElement).appendChild(st);
})();

/* 📏 v14: decimals in every number field of the panel (e.g. data limit 0.5 GB = 512 MB, 0.001 GB = 1 MB).
   Without step="any" the browser refused anything that is not a whole number when the form was sent. */
(function () {
  if (window.__jinxStepFix) return; window.__jinxStepFix = true;
  function fix() { var l = document.querySelectorAll('input[type="number"]:not([step])'); for (var i = 0; i < l.length; i++) l[i].setAttribute("step", "any"); }
  var pend = false;
  new MutationObserver(function () { if (pend) return; pend = true; setTimeout(function () { pend = false; try { fix(); } catch (e) {} }, 60); })
    .observe(document.documentElement, { childList: true, subtree: true });
  try { fix(); } catch (e) {}
})();
