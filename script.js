(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- mobile nav toggle ---------- */

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll progress bar + timeline playheads ---------- */

  var scrubFill = document.getElementById("scrubFill");
  var playheads = document.querySelectorAll(".playhead");

  function updateScrollProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
    var pctStr = (pct * 100).toFixed(2) + "%";

    if (scrubFill) scrubFill.style.width = pctStr;
    playheads.forEach(function (p) {
      p.style.left = pctStr;
    });
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  updateScrollProgress();

  /* ---------- reveal-on-scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // No IntersectionObserver support, or reduced motion: just show everything.
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- animated skill bars ---------- */

  var skillBars = document.querySelectorAll(".skill-row .bar span[data-width]");

  if ("IntersectionObserver" in window) {
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var target = entry.target;
            var width = target.getAttribute("data-width") || "0";
            target.style.width = width + "%";
            barObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.4 },
    );

    skillBars.forEach(function (bar) {
      barObserver.observe(bar);
    });
  } else {
    skillBars.forEach(function (bar) {
      bar.style.width = (bar.getAttribute("data-width") || "0") + "%";
    });
  }

  /* ---------- hero running timecode clock ---------- */

  var heroClock = document.getElementById("heroClock");

  if (heroClock) {
    var startTime = Date.now();
    var FPS = 24;

    function pad(num, len) {
      var s = String(Math.floor(num));
      while (s.length < len) s = "0" + s;
      return s;
    }

    function renderClock() {
      var elapsedMs = Date.now() - startTime;
      var totalSeconds = Math.floor(elapsedMs / 1000);
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;
      var frames = Math.floor((elapsedMs % 1000) / (1000 / FPS));

      heroClock.innerHTML =
        '<span class="rec-dot small" aria-hidden="true"></span> REC ' +
        pad(hours, 2) +
        ":" +
        pad(minutes, 2) +
        ":" +
        pad(seconds, 2) +
        ":" +
        pad(frames, 2);
    }

    renderClock();

    if (!reduceMotion) {
      setInterval(renderClock, 1000 / FPS);
    } else {
      // Reduced motion: update once per second instead of every frame.
      setInterval(renderClock, 1000);
    }
  }
})();
