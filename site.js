// small things used on every page: theme toggle, back to top, offline support, language choice

// set the saved theme right away, so the page doesn't flash
// show short addresses: /index.html -> /, /food.html -> /food
(function () {
  if (location.protocol === "file:" || !window.history || !history.replaceState) return;
  var p = location.pathname, clean = p.replace(/index\.html$/, "").replace(/\.html$/, "");
  if (clean !== p && !/\/404$/.test(clean)) history.replaceState(null, "", clean + location.search + location.hash);
})();

(function () {
  try { var th = localStorage.getItem("istueopen-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
})();

(function () {
  var NL = document.documentElement.lang === "nl";
  function t(en, nl) { return NL ? nl : en; }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var me = document.currentScript && document.currentScript.src;

  // dutch phones go to the dutch page on their first visit
  var langLink = null;
  function findLangLink() { return document.querySelector("nav a[hreflang]"); }
  if (!NL && !load("istueopen-lang") && /^nl\b/i.test(navigator.language || "")) {
    document.addEventListener("DOMContentLoaded", function () {
      langLink = findLangLink();
      if (langLink) { save("istueopen-lang", "nl"); location.replace(langLink.href + location.search); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.querySelector("nav");
    langLink = findLangLink();
    if (langLink) langLink.addEventListener("click", function () { save("istueopen-lang", langLink.getAttribute("hreflang")); });

    // light/dark toggle
    if (nav) {
      var btn = document.createElement("button");
      btn.type = "button"; btn.id = "theme";
      function isDark() {
        var set = document.documentElement.getAttribute("data-theme");
        return set ? set === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      function label() {
        var dark = isDark();
        btn.textContent = dark ? "☀️" : "🌙";
        btn.title = dark ? t("Switch to light mode", "Naar lichte modus") : t("Switch to dark mode", "Naar donkere modus");
        btn.setAttribute("aria-label", btn.title);
      }
      btn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        save("istueopen-theme", next);
        label();
      });
      label();
      nav.append(btn);
    }

    // back to top
    var up = document.createElement("button");
    up.type = "button"; up.id = "top"; up.textContent = "↑"; up.hidden = true;
    up.setAttribute("aria-label", t("Back to top", "Terug naar boven"));
    up.title = up.getAttribute("aria-label");
    up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.append(up);
    function onScroll() { up.hidden = window.scrollY < 700; }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // note when there's no internet (the page then shows the saved version)
    var note = document.createElement("p");
    note.id = "offline"; note.hidden = navigator.onLine !== false;
    note.textContent = t("You're offline. These are the hours from your last visit; the open/closed status is still worked out live.",
                         "Je bent offline. Dit zijn de tijden van je vorige bezoek; open of dicht wordt nog steeds live berekend.");
    if (nav) nav.after(note); else document.body.prepend(note);
    window.addEventListener("online", function () { note.hidden = true; });
    window.addEventListener("offline", function () { note.hidden = false; });
  });

  // offline support
  if ("serviceWorker" in navigator && me && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(new URL("sw.js", me).href).catch(function () {});
    });
  }
})();
