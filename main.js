/* =========================================================
   Yang Yanqiao — Portfolio
   Minimal interactions: footer year + gentle scroll reveal.
   ========================================================= */

(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Respect reduced motion preference
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Subtle scroll reveal for sections and key blocks
  var targets = document.querySelectorAll(
    ".section-head, .section-body, .hero-inner, .project, .music-block, .lyrics-block, .contact-row, .resume-status"
  );

  if (prefersReduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();

/* =========================================================
   EarPods On — audio player + lyrics loader.
   ========================================================= */
(function () {
  "use strict";

  var audio = document.querySelector(".project-music audio");
  if (!audio) return;

  var block = audio.closest(".music-block");
  var toggle = block ? block.querySelector(".play-toggle") : null;
  var fill = block ? block.querySelector(".progress-fill") : null;
  var input = block ? block.querySelector(".progress-input") : null;
  var currentEl = block ? block.querySelector(".current-time") : null;
  var durationEl = block ? block.querySelector(".duration-time") : null;

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  var seeking = false;

  function render() {
    var d = audio.duration || 0;
    var c = audio.currentTime || 0;
    if (currentEl) currentEl.textContent = fmt(c);
    if (durationEl) durationEl.textContent = fmt(d);
    if (fill) fill.style.width = (d ? (c / d) * 100 : 0) + "%";
    if (input && !seeking) input.value = d ? (c / d) * 1000 : 0;
  }

  function setPlaying(on) {
    if (!toggle) return;
    toggle.classList.toggle("is-playing", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.setAttribute("aria-label", on ? "Pause EarPods On" : "Play EarPods On");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (audio.paused || audio.ended) {
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    });
  }

  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });
  audio.addEventListener("loadedmetadata", render);
  audio.addEventListener("timeupdate", render);
  audio.addEventListener("ended", function () { setPlaying(false); render(); });

  if (input) {
    input.addEventListener("input", function () {
      seeking = true;
      var d = audio.duration || 0;
      audio.currentTime = (input.value / 1000) * d;
      render();
    });
    input.addEventListener("change", function () {
      seeking = false;
    });
  }

  // Lyrics loader — fetches the plain text file and renders it.
  // Works on GitHub Pages (HTTP). Falls back gracefully when blocked (file://).
  var lyricsEl = document.getElementById("earpods-lyrics");
  if (lyricsEl) {
    fetch("lyrics.txt")
      .then(function (r) {
        return r.ok ? r.text() : Promise.reject(new Error("not found"));
      })
      .then(function (text) {
        var t = (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
        lyricsEl.textContent = t ? t : "Lyrics to be added.";
      })
      .catch(function () {
        lyricsEl.textContent = "Lyrics to be added.";
      });
  }
})();
