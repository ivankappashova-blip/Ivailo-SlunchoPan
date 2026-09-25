/* =========================================================================
   ☀️  Слънчопан — логика на сайта / site logic
   Календар + Времева линия + Пожелания + БГ/EN
   ========================================================================= */
(function () {
  "use strict";

  var MONTH = 9;   /* септември */
  var DAY = 26;

  /* ---------- Двуезични текстове / Bilingual strings ---------- */
  var I18N = {
    bg: {
      docTitle: "Честит рожден ден, Слънчопан! ☀️",
      hello: "Честит рожден ден,",
      tagline: "Година след година, тук те чака по едно пожелание — само за теб.",
      chipToday: "🎉 Днес е твоят ден! Честит рожден ден!",
      chipTomorrow: "🎂 Утре е рожденият ти ден!",
      chipDays: "🎂 Остават {n} дни до рождения ти ден",
      chipDay: "🎂 Остава {n} ден до рождения ти ден",
      calTitle: "Календар",
      calSub: "26 септември — твоят ден",
      calHint: "Натисни слънцето на 26-ти, за да отвориш пожеланието.",
      tlTitle: "Времева линия",
      tlSub: "Отвори пожеланието за всяка година",
      years: "години",
      open: "Отвори пожеланието ›",
      locked: "🔒 Още не е време",
      lockedTitle: "Още не е време! 🤫",
      lockedSub: "Това пожелание ще се отвори на 26 септември {year} г.",
      lockedIn: "Остават още {n} дни.",
      emptyTitle: "Тук скоро ще има пожелание",
      emptyBody: "Пожеланието за {year} година още не е написано. Скоро ще се появи тук. ☀️",
      modalTitleOpen: "Честит рожден ден!",
      close: "Затвори",
      footer: "Направено с много обич за Ивайло (Слънчопан) ☀️",
      months: ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"],
      weekdays: ["пн", "вт", "ср", "чт", "пт", "сб", "нд"]
    },
    en: {
      docTitle: "Happy Birthday, Little Sunshine! ☀️",
      hello: "Happy birthday,",
      tagline: "Year after year, a little wish is waiting here — just for you.",
      chipToday: "🎉 Today is your day! Happy birthday!",
      chipTomorrow: "🎂 Your birthday is tomorrow!",
      chipDays: "🎂 {n} days until your birthday",
      chipDay: "🎂 {n} day until your birthday",
      calTitle: "Calendar",
      calSub: "September 26 — your day",
      calHint: "Tap the sun on the 26th to open your wish.",
      tlTitle: "Timeline",
      tlSub: "Open the wish for every year",
      years: "years old",
      open: "Open the wish ›",
      locked: "🔒 Not yet time",
      lockedTitle: "Not yet time! 🤫",
      lockedSub: "This wish opens on September 26, {year}.",
      lockedIn: "Still {n} days to go.",
      emptyTitle: "A wish is coming here soon",
      emptyBody: "The wish for {year} hasn't been written yet. It will appear here soon. ☀️",
      modalTitleOpen: "Happy birthday!",
      close: "Close",
      footer: "Made with lots of love for Ivaylo (Little Sunshine) ☀️",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    }
  };

  /* ---------- настройки / settings ---------- */
  var cfg = (typeof CONFIG !== "undefined") ? CONFIG : {
    name: "Ивайло", nickname: "Слънчопан", birthYear: 2018,
    birthMonth: 9, birthDay: 26, startYear: 2026, ageLimit: 100, previewUnlockAll: false
  };
  var wishes = (typeof WISHES !== "undefined") ? WISHES : {};

  var lang = "bg";
  try {
    var saved = localStorage.getItem("sunny-lang");
    if (saved === "bg" || saved === "en") lang = saved;
  } catch (e) { /* ignore */ }

  var calYear = new Date().getFullYear();

  /* ---------- граници на годините / year range ----------
     Крайната година се смята сама от възрастта:  ageLimit = 100  ->  до 100 г.
     The last year is derived from the age limit: ageLimit = 100 -> up to 100. */
  function lastYear() {
    var lim = (typeof cfg.ageLimit === "number" && cfg.ageLimit > 0) ? cfg.ageLimit : 100;
    return cfg.birthYear + lim;
  }

  /* ---------- помощни функции / helpers ---------- */
  function t(key, vars) {
    var dict = I18N[lang] || I18N.bg;
    var str = dict[key] != null ? dict[key] : (I18N.bg[key] != null ? I18N.bg[key] : key);
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          str = String(str).replace("{" + k + "}", vars[k]);
        }
      }
    }
    return str;
  }

  function ageIn(year) { return year - cfg.birthYear; }

  function birthdayDate(year) { return new Date(year, MONTH - 1, DAY, 0, 0, 0, 0); }

  /* Има ли написано пожелание? / Is there a written wish? */
  function rawWish(year) {
    var w = wishes[year];
    if (!w) return null;
    var txt = w[lang] || w.bg || w.en || "";
    return (typeof txt === "string" && txt.trim() !== "") ? txt.trim() : null;
  }

  /* Отключено = дошла е датата (26 септември) И има написано пожелание.
     Unlocked = the date has arrived AND a wish has been written. */
  function isUnlocked(year) {
    if (cfg.previewUnlockAll) return true;
    var timeReached = new Date().getTime() >= birthdayDate(year).getTime();
    return timeReached && !!rawWish(year);
  }

  /* Дошла ли е вече датата (независимо дали има текст) */
  function timeReached(year) {
    return new Date().getTime() >= birthdayDate(year).getTime();
  }

  function daysUntil(year) {
    var diff = birthdayDate(year).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  function isTodayBirthday() {
    var n = new Date();
    return n.getMonth() === MONTH - 1 && n.getDate() === DAY;
  }

  function nextBirthdayYear() {
    var n = new Date();
    var y = n.getFullYear();
    if (n.getTime() < birthdayDate(y).getTime()) return y;
    return y + 1;
  }

  function el(id) { return document.getElementById(id); }

  function messageFor(year) { return rawWish(year); }

  /* =====================================================================
     ЕЗИК / LANGUAGE
     ===================================================================== */
  function applyLanguage() {
    document.documentElement.lang = lang;
    document.title = t("docTitle");

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      nodes[i].textContent = t(key);
    }

    var nameNodes = document.querySelectorAll("[data-name]");
    for (var j = 0; j < nameNodes.length; j++) {
      var which = nameNodes[j].getAttribute("data-name");
      nameNodes[j].textContent = (which === "nickname") ? "(" + cfg.nickname + ")" : cfg.name;
    }

    var spans = document.querySelectorAll("#langToggle span");
    for (var s = 0; s < spans.length; s++) {
      spans[s].classList.toggle("active", spans[s].getAttribute("data-lang") === lang);
    }
  }

  function setLang(next) {
    lang = (next === "en") ? "en" : "bg";
    try { localStorage.setItem("sunny-lang", lang); } catch (e) { /* ignore */ }
    applyLanguage();
    renderChip();
    renderCalendar();
    renderTimeline();
  }

  /* =====================================================================
     CHIP (брояч) / countdown chip
     ===================================================================== */
  function renderChip() {
    var chip = el("chip-days");
    if (!chip) return;
    chip.classList.remove("is-today");

    if (isTodayBirthday()) {
      chip.textContent = t("chipToday");
      chip.classList.add("is-today");
      return;
    }
    var y = nextBirthdayYear();
    var d = daysUntil(y);
    if (d === 1) chip.textContent = t("chipTomorrow");
    else if (d === 2) chip.textContent = t("chipDay", { n: d - 1 });
    else chip.textContent = t("chipDays", { n: d });
  }

  /* =====================================================================
     КАЛЕНДАР / CALENDAR
     ===================================================================== */
  function renderCalendar() {
    var months = I18N[lang].months;
    var label = el("calLabel");
    if (label) label.textContent = months[MONTH - 1] + " " + calYear;

    var wd = el("weekdays");
    if (wd) {
      wd.innerHTML = "";
      var names = I18N[lang].weekdays;
      for (var i = 0; i < names.length; i++) {
        var d = document.createElement("div");
        d.textContent = names[i];
        wd.appendChild(d);
      }
    }

    var grid = el("calendar");
    if (!grid) return;
    grid.innerHTML = "";

    var firstDay = new Date(calYear, MONTH - 1, 1).getDay();      /* 0=нед ... 6=съб */
    var offset = (firstDay + 6) % 7;                               /* понеделник първи */
    var daysInMonth = new Date(calYear, MONTH, 0).getDate();
    var now = new Date();

    for (var b = 0; b < offset; b++) {
      var blank = document.createElement("div");
      blank.className = "cal-cell blank";
      grid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.textContent = String(day);

      var isBday = (day === DAY);
      var isToday = (now.getFullYear() === calYear && now.getMonth() === MONTH - 1 && now.getDate() === day);

      if (isBday) {
        cell.classList.add("bday");
        if (!isUnlocked(calYear)) cell.classList.add("locked-cell");
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.style.cursor = "pointer";
        (function (y) {
          cell.addEventListener("click", function () { openModal(y); });
          cell.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openModal(y); }
          });
        })(calYear);
      }
      if (isToday) cell.classList.add("today-cell");

      grid.appendChild(cell);
    }
  }

  /* =====================================================================
     ВРЕМЕВА ЛИНИЯ / TIMELINE
     ===================================================================== */
  function renderTimeline() {
    var wrap = el("timeline");
    if (!wrap) return;
    wrap.innerHTML = "";

    var from = cfg.startYear;
    var to = lastYear();
    if (to < from) to = from;

    for (var y = from; y <= to; y++) {
      var unlocked = isUnlocked(y);
      var item = document.createElement("div");
      item.className = "tl-item" + (unlocked ? " unlocked" : " locked");

      var dot = document.createElement("div");
      dot.className = "tl-dot";
      dot.textContent = unlocked ? String(ageIn(y)) : "🔒";

      var card = document.createElement("button");
      card.type = "button";
      card.className = "tl-card";

      var yearEl = document.createElement("div");
      yearEl.className = "tl-year";
      yearEl.textContent = String(y);

      var ageEl = document.createElement("div");
      ageEl.className = "tl-age";
      ageEl.textContent = ageIn(y) + " " + t("years");

      card.appendChild(yearEl);
      card.appendChild(ageEl);

      if (unlocked) {
        var msg = messageFor(y);
        if (msg) {
          var prev = document.createElement("div");
          prev.className = "tl-preview";
          prev.textContent = msg.replace(/\s+/g, " ").slice(0, 96) + "…";
          card.appendChild(prev);
        }
      }

      var state = document.createElement("div");
      state.className = "tl-state";
      state.textContent = unlocked ? t("open") : t("locked");
      card.appendChild(state);

      (function (year) {
        card.addEventListener("click", function () { openModal(year); });
      })(y);

      item.appendChild(dot);
      item.appendChild(card);
      wrap.appendChild(item);
    }
  }

  /* =====================================================================
     МОДАЛ / MODAL
     ===================================================================== */
  var modal = null;

  function openModal(year) {
    if (!modal) modal = el("modal");
    var unlocked = isUnlocked(year);

    el("modalYear").textContent = String(year);
    el("modalAge").textContent = String(Math.max(0, ageIn(year)));

    var body = el("modalBody");
    var locked = el("modalLocked");

    if (unlocked) {
      el("modalTitle").textContent = t("modalTitleOpen");
      body.hidden = false;
      locked.hidden = true;
      var msg = messageFor(year);
      body.textContent = msg ? msg : "";
      confettiBurst(90);
    } else {
      el("modalTitle").textContent = String(year);
      body.hidden = true;
      locked.hidden = false;
      if (timeReached(year)) {
        /* датата е дошла, но още няма написан текст */
        el("modalLockedTitle").textContent = t("emptyTitle");
        el("modalLockedSub").textContent = t("emptyBody", { year: year });
      } else {
        el("modalLockedTitle").textContent = t("lockedTitle");
        el("modalLockedSub").textContent =
          t("lockedSub", { year: year }) + " " + t("lockedIn", { n: daysUntil(year) });
      }
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) modal = el("modal");
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  /* =====================================================================
     КОНФЕТИ / CONFETTI
     ===================================================================== */
  var canvas, ctx, particles = [], rafId = null;

  var COLORS = ["#FFD166", "#FFB703", "#FB8500", "#48CAE4", "#EF476F", "#06D6A0", "#9B5DE5"];

  function initConfetti() {
    canvas = el("confetti");
    if (!canvas || !canvas.getContext) return;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function confettiBurst(count) {
    if (!ctx) return;
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 3.2,
        vy: 2 + Math.random() * 4,
        w: 6 + Math.random() * 8,
        h: 9 + Math.random() * 11,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.26,
        color: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.vy += 0.06;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    particles = particles.filter(function (p) { return p.y < canvas.height + 60; });
    if (particles.length > 0) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* =====================================================================
     СЪБИТИЯ / EVENTS
     ===================================================================== */
  function bind() {
    var toggle = el("langToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        setLang(lang === "bg" ? "en" : "bg");
      });
    }

    var prev = el("calPrev");
    var next = el("calNext");
    if (prev) prev.addEventListener("click", function () { calYear--; renderCalendar(); });
    if (next) next.addEventListener("click", function () { calYear++; renderCalendar(); });

    modal = el("modal");
    if (modal) {
      var closers = modal.querySelectorAll("[data-close]");
      for (var i = 0; i < closers.length; i++) closers[i].addEventListener("click", closeModal);
    }
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && modal && !modal.hidden) closeModal();
    });
  }

  /* =====================================================================
     СТАРТ / START
     ===================================================================== */
  function start() {
    initConfetti();
    applyLanguage();
    bind();
    renderChip();
    renderCalendar();
    renderTimeline();

    if (isTodayBirthday()) {
      setTimeout(function () { confettiBurst(150); }, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
