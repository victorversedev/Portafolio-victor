/* ==========================================================================
   Víctor Rivera — Portafolio 2026
   Interacciones sin dependencias.
   ========================================================================== */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año actual ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Ticker infinito ---------- */
  var track = doc.querySelector(".ticker__track");
  if (track && !reduceMotion) {
    track.innerHTML += track.innerHTML;
  }

  /* ---------- Header: fondo + progreso de scroll ---------- */
  var header = doc.getElementById("site-header");
  var progress = doc.querySelector(".scroll-progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);

    if (progress) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var menuBtn = doc.getElementById("menu-btn");
  var mobileMenu = doc.getElementById("mobile-menu");
  var main = doc.querySelector("main");
  var footer = doc.querySelector(".site-footer");
  var menuOpen = false;

  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    menuOpen = open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    doc.body.classList.toggle("no-scroll", open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;

    if (open) {
      var first = mobileMenu.querySelector("a");
      if (first) window.setTimeout(function () { first.focus(); }, 320);
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      setMenu(!menuOpen);
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuOpen) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && menuOpen) setMenu(false);
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var revealEls = doc.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Nav activo según la sección visible ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".site-nav a"));
  var sectionEls = Array.prototype.slice.call(doc.querySelectorAll("main section[id]"));

  if (sectionEls.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = null;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) active = link;
        });
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link === active);
        });
      });
    }, {
      root: null,
      rootMargin: "-42% 0px -52% 0px",
      threshold: 0
    });

    sectionEls.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Copiar correo ---------- */
  doc.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy") || "";
      var label = button.querySelector(".copy-btn__text");
      var original = label ? label.textContent : "";

      function done(ok) {
        button.classList.add("is-copied");
        if (label) label.textContent = ok ? "Copiado" : "Copia manual";
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          if (label) label.textContent = original;
        }, 2200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () {
          done(true);
        }).catch(function () {
          fallbackCopy(value, done);
        });
      } else {
        fallbackCopy(value, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var area = doc.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    doc.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
    doc.body.removeChild(area);
    done(ok);
  }

  /* ---------- Tilt sutil en la tarjeta del hero ---------- */
  var card = doc.querySelector(".hero-card");
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (card && finePointer && !reduceMotion) {
    var raf = null;

    card.addEventListener("pointermove", function (event) {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (x * 4).toFixed(2) + "deg) rotateX(" +
          (-y * 4).toFixed(2) + "deg)";
        raf = null;
      });
    });

    card.addEventListener("pointerleave", function () {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
      card.style.transform = "";
    });
  }

  /* ---------- Marcar el documento como listo ---------- */
  root.classList.add("is-ready");
})();
