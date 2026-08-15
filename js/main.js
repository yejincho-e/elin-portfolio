/* 조예진 · Cho Yejin — Portfolio interactions (original, no external deps) */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Theme: saved choice > system > default(dark) ---- */
  var themeBtn = document.getElementById("themeBtn");
  var saved = null;
  try { saved = localStorage.getItem("yj-theme"); } catch (e) {}
  if (saved) {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("yj-theme", next); } catch (e) {}
    });
  }

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Sticky-nav border + scroll progress ---- */
  var nav = document.querySelector(".nav");
  var bar = document.getElementById("progress");
  var onScroll = function () {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-stuck", y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---- Reveal on scroll ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Parallax on media (motion-safe, large screens) ---- */
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bigScreen = window.matchMedia && matchMedia("(min-width: 861px)").matches;
  if (!reduceMotion && bigScreen) {
    var pxEls = [];
    document.querySelectorAll(".featured__media, .about__media").forEach(function (el) {
      pxEls.push({ el: el, speed: 0.08 });
    });
    document.querySelectorAll(".card__media").forEach(function (el) {
      pxEls.push({ el: el, speed: 0.04 });
    });
    var pxTick = false;
    var pxUpdate = function () {
      var vh = window.innerHeight;
      pxEls.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var mid = r.top + r.height / 2;
        var off = (mid - vh / 2) * p.speed; // px shift relative to viewport center
        p.el.style.transform = "translate3d(0," + (-off).toFixed(1) + "px,0)";
      });
      pxTick = false;
    };
    var pxRequest = function () { if (!pxTick) { pxTick = true; requestAnimationFrame(pxUpdate); } };
    window.addEventListener("scroll", pxRequest, { passive: true });
    window.addEventListener("resize", pxRequest);
    pxUpdate();
  }

  /* ---- Custom cursor (pointer devices, motion-safe) ---- */
  var cursor = document.getElementById("cursor");
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (cursor && fine && !reduce) {
    var cx = 0, cy = 0, tx = 0, ty = 0, active = false;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!active) { active = true; cursor.classList.add("is-active"); }
    });
    var hot = "a, button, .card__link, .featured__link";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hot)) cursor.classList.add("is-hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hot)) cursor.classList.remove("is-hot");
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Footer year ---- */
  var yEl = document.getElementById("year");
  if (yEl) yEl.textContent = String(new Date().getFullYear());
})();
