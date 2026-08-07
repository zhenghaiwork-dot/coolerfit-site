/**
 * Browser-language auto-routing (inline in BaseLayout).
 * Kept as a string so it can run blocking in <head> before paint.
 *
 * Rules:
 * - Skip bots / prerender hints
 * - Skip when html has data-skip-lang-redirect (404 error pages)
 * - Honor explicit cookie preference (set by language switcher or first detect)
 * - On first visit only: map navigator.languages → en | es | ar and redirect once
 * - Preserve path across locales (en unprefixed, es/ar prefixed)
 * - Target URLs always use trailing slash (matches Astro trailingSlash: always)
 */
export const localeRedirectInlineScript = `(function(){
  try {
    var KEY = "coolerfit_lang";
    var locales = ["en", "es", "ar"];
    var ua = navigator.userAgent || "";
    if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|preview/i.test(ua)) return;
    if ((location.search || "").indexOf("nolang=1") !== -1) return;

    var html = document.documentElement;
    if (html.getAttribute("data-skip-lang-redirect") === "1") return;

    var current = html.getAttribute("data-locale") || "en";
    var path = location.pathname || "/";

    function isLocale(v){ return locales.indexOf(v) !== -1; }

    function fromPath(pathname){
      var seg = pathname.replace(/^\\//, "").split("/")[0];
      if (seg && isLocale(seg) && seg !== "en") return seg;
      return "en";
    }

    function strip(pathname){
      var loc = fromPath(pathname);
      if (loc === "en") return pathname || "/";
      return pathname.replace(new RegExp("^/" + loc), "") || "/";
    }

    function withSlash(p){
      if (!p || p === "/") return "/";
      var q = p.indexOf("?");
      var h = p.indexOf("#");
      var cut = p.length;
      if (q !== -1) cut = Math.min(cut, q);
      if (h !== -1) cut = Math.min(cut, h);
      var base = p.slice(0, cut);
      var suf = p.slice(cut);
      if (base === "/" || /\\/$/.test(base)) return p;
      return base + "/" + suf;
    }

    function withLocale(locale, bare){
      var n = bare.charAt(0) === "/" ? bare : "/" + bare;
      var out;
      if (locale === "en") out = n === "" ? "/" : n;
      else if (n === "/") out = "/" + locale + "/";
      else out = "/" + locale + n;
      return withSlash(out);
    }

    function detect(){
      var list = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "en"];
      for (var i = 0; i < list.length; i++) {
        var raw = String(list[i] || "").toLowerCase();
        var primary = raw.split("-")[0];
        if (primary === "es") return "es";
        if (primary === "ar") return "ar";
      }
      return "en";
    }

    function readPref(){
      try {
        var m = document.cookie.match(/(?:^|; )coolerfit_lang=([^;]*)/);
        if (m && isLocale(decodeURIComponent(m[1]))) return decodeURIComponent(m[1]);
      } catch (e) {}
      try {
        var ls = localStorage.getItem(KEY);
        if (ls && isLocale(ls)) return ls;
      } catch (e2) {}
      return null;
    }

    function writePref(locale){
      try {
        localStorage.setItem(KEY, locale);
      } catch (e) {}
      try {
        var maxAge = 60 * 60 * 24 * 365;
        document.cookie = KEY + "=" + encodeURIComponent(locale) + ";path=/;max-age=" + maxAge + ";samesite=lax";
      } catch (e2) {}
    }

    var pref = readPref();
    var firstVisit = !pref;
    if (firstVisit) {
      pref = detect();
      writePref(pref);
    }

    if (pref === current) return;

    var target = withLocale(pref, strip(path));
    if (target === path || withSlash(path) === target) return;
    var q = location.search || "";
    var h = location.hash || "";
    location.replace(target + q + h);
  } catch (err) {}
})();`;
