/* =========================================================
   Cantina El Chaparral — site scripts
   ========================================================= */
(function () {
  "use strict";

  // Booking requests are delivered to this inbox via FormSubmit (free, no backend).
  // First submission sends an activation email to this address — click "Activate" once.
  var BOOKING_EMAIL = "cantinaelchaparral@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + BOOKING_EMAIL;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Language (EN / ES) ---------------- */
  var ES = window.I18N_ES || {};
  var MSG = window.I18N_MSG || { en: {}, es: {} };
  var currentLang = "en";

  // Capture the English copy that lives in the HTML
  $$("[data-i18n]").forEach(function (el) { el.dataset.en = el.textContent; });
  $$("[data-i18n-html]").forEach(function (el) { el.dataset.en = el.innerHTML; });
  $$("[data-i18n-ph]").forEach(function (el) { el.dataset.enPh = el.getAttribute("placeholder") || ""; });

  function setLang(lang) {
    currentLang = lang === "es" ? "es" : "en";
    var es = currentLang === "es";
    document.documentElement.lang = currentLang;

    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = es && ES[key] ? ES[key] : el.dataset.en;
    });
    $$("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      el.innerHTML = es && ES[key] ? ES[key] : el.dataset.en;
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      el.setAttribute("placeholder", es && ES[key] ? ES[key] : el.dataset.enPh);
    });

    $$(".lang__btn").forEach(function (b) {
      var on = b.dataset.lang === currentLang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var langField = $("#siteLangField");
    if (langField) langField.value = es ? "Español" : "English";

    try { localStorage.setItem("cec-lang", currentLang); } catch (e) {}
  }

  $$(".lang__btn").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  var saved = null;
  try { saved = localStorage.getItem("cec-lang"); } catch (e) {}
  var urlLang = new URLSearchParams(location.search).get("lang");
  var browserEs = (navigator.language || "").toLowerCase().indexOf("es") === 0;
  setLang(urlLang || saved || (browserEs ? "es" : "en"));

  function t(key) { return (MSG[currentLang] && MSG[currentLang][key]) || MSG.en[key] || ""; }

  /* ---------------- Header / mobile nav ---------------- */
  var nav = $(".nav");
  var toggle = $("#navToggle");
  var links = $("#navLinks");

  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("no-scroll", open);
  });
  $$("a", links).forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    });
  });

  /* ---------------- Reveal on scroll ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- Event videos ---------------- */
  var vids = $$(".vid");
  vids.forEach(function (wrap) {
    var v = $("video", wrap);
    var play = $(".vid__play", wrap);
    var sound = $(".vid__sound", wrap);

    function pauseOthers() {
      vids.forEach(function (o) {
        var ov = $("video", o);
        if (ov !== v && !ov.paused) { ov.pause(); o.classList.remove("is-playing"); }
      });
    }

    function toggle() {
      if (v.paused) {
        pauseOthers();
        v.muted = false;
        wrap.classList.remove("is-muted");
        v.play().catch(function () { v.muted = true; wrap.classList.add("is-muted"); v.play(); });
        wrap.classList.add("is-playing");
        play.setAttribute("aria-label", t("pauseLabel"));
      } else {
        v.pause();
        wrap.classList.remove("is-playing");
        play.setAttribute("aria-label", t("playLabel"));
      }
    }

    play.addEventListener("click", toggle);
    v.addEventListener("click", toggle);
    sound.addEventListener("click", function (e) {
      e.stopPropagation();
      v.muted = !v.muted;
      wrap.classList.toggle("is-muted", v.muted);
    });
    v.addEventListener("ended", function () { wrap.classList.remove("is-playing"); });
  });

  // Pause videos that scroll out of view
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && !en.target.paused) {
          en.target.pause();
          en.target.closest(".vid").classList.remove("is-playing");
        }
      });
    }, { threshold: 0.2 });
    $$(".vid video").forEach(function (v) { vio.observe(v); });
  }

  /* ---------------- Gallery lightbox ---------------- */
  var lb = $("#lightbox");
  var lbImg = $("img", lb);
  var items = $$(".gallery__grid .g");
  var idx = 0;

  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lbImg.src = it.dataset.full;
    lbImg.alt = $("img", it).alt;
  }
  function openLb(i) {
    show(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.body.classList.add("no-scroll");
  }
  function closeLb() {
    lb.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () { lb.hidden = true; }, 250);
  }
  items.forEach(function (it, i) { it.addEventListener("click", function () { openLb(i); }); });
  $(".lightbox__close", lb).addEventListener("click", closeLb);
  $(".lightbox__prev", lb).addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  $(".lightbox__next", lb).addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------------- Booking form ---------------- */
  var form = $("#bookingForm");
  var status = $("#formStatus");
  var submitBtn = $("#submitBtn");
  var dateInput = $("#eventDate");
  var dateHint = $("#dateHint");
  var guests = $("#guestCount");

  // Package buttons pre-select the matching radio
  $$("[data-pkg].pkg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var r = $('input[type="radio"][data-pkg="' + btn.dataset.pkg + '"]', form);
      if (r) r.checked = true;
    });
  });

  // No past dates
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  dateInput.addEventListener("change", function () {
    if (!dateInput.value) { dateHint.hidden = true; return; }
    var d = new Date(dateInput.value + "T12:00:00").getDay(); // 0 Sun … 6 Sat
    dateHint.hidden = d === 0 || d === 5 || d === 6;
  });

  function guestAdvice() {
    var n = parseInt(guests.value, 10);
    var basic = $('input[data-pkg="basic"]', form).checked;
    var std = $('input[data-pkg="standard"]', form).checked;
    if (n > 80 && (basic || std)) return t("over80");
    if (n > 50 && basic) return t("over50");
    return "";
  }
  function showAdvice() {
    var msg = guestAdvice();
    status.className = "form__status" + (msg ? " is-info" : "");
    status.textContent = msg;
  }
  guests.addEventListener("input", showAdvice);
  $$('input[name="Package"]', form).forEach(function (r) { r.addEventListener("change", showAdvice); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if ($(".hp", form).value) return; // bot

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      status.className = "form__status is-error";
      status.textContent = t("invalid");
      var firstBad = $(":invalid", form);
      if (firstBad && firstBad.focus) firstBad.focus();
      return;
    }

    var label = $("span", submitBtn);
    var original = label.textContent;
    submitBtn.disabled = true;
    label.textContent = t("sending");
    status.className = "form__status";
    status.textContent = "";

    var data = new FormData(form);
    data.delete("_honey");
    data.append("_replyto", data.get("email") || "");

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || String(res.j.success) === "false") throw new Error(res.j.message || "send failed");
        form.reset();
        form.classList.remove("was-validated");
        dateHint.hidden = true;
        status.className = "form__status is-success";
        status.textContent = t("success");
      })
      .catch(function () {
        status.className = "form__status is-error";
        status.textContent = t("error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        label.textContent = original;
        var langField = $("#siteLangField");
        if (langField) langField.value = currentLang === "es" ? "Español" : "English";
      });
  });

  // Re-translate the button label after language switch mid-send is not needed; keep year fresh
  $("#year").textContent = new Date().getFullYear();
})();
