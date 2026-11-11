// Shared "is it open?" logic for index.html and food.html.
// You normally don't need to edit this file: hours live in hours.js.

// Language: pages with <html lang="nl"> get Dutch texts.
var NL = document.documentElement.lang === "nl";
function t(en, nl) { return NL ? nl : en; }
var DAYS = NL ? ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
              : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTHS = NL ? ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
                : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function noteOf(b) { return (NL && b.noteNl) || b.note || ""; }
function labelOf(sp) { return sp ? ((NL && sp.labelNl) || sp.label) : ""; }
var SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
var SOON = 30; // minutes before closing to show a warning

// Current date and time in the Netherlands, wherever the visitor is.
function amsterdamNow() {
  var parts = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam", weekday: "short", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
  return {
    date: parts.year + "-" + parts.month + "-" + parts.day,
    day: SHORT[parts.weekday],
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    time: parts.hour + ":" + parts.minute
  };
}

function addDays(dateStr, n) {
  var d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function prettyDate(dateStr) {
  var d = new Date(dateStr + "T12:00:00Z");
  return DAYS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()];
}
function toMinutes(hhmm) { var p = hhmm.split(":"); return Number(p[0]) * 60 + Number(p[1]); }
function parseRange(r) {
  if (!r) return null;
  var p = r.split("-");
  var open = toMinutes(p[0]), close = toMinutes(p[1]);
  if (close <= open) close += 24 * 60; // closes after midnight
  return { open: open, close: close };
}
function fmt(min) {
  min = ((min % 1440) + 1440) % 1440;
  var h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
}
function dash(r) { return r ? r.replace("-", "–") : t("Closed", "Gesloten"); }

// Hours for one place on one date (special days win over the normal week).
function hoursOn(b, dateStr, day) {
  var special = window.SPECIAL_DAYS && window.SPECIAL_DAYS[dateStr];
  if (special) {
    if (special.buildings && b.name in special.buildings) return { range: special.buildings[b.name], label: labelOf(special) };
    if ("all" in special) return { range: special.all, label: labelOf(special) };
  }
  if (day === 6 && b.saturday !== undefined) return { range: b.saturday, label: "" };
  if (day === 0 && b.sunday !== undefined) return { range: b.sunday, label: "" };
  return { range: (day === 0 || day === 6) ? b.weekend : b.weekdays, label: "" };
}

// Text for the weekend column, e.g. "10:00–21:00" or "Sat 08:30–21:00, Sun 09:00–17:00".
function weekendText(b) {
  if (b.saturday !== undefined || b.sunday !== undefined) {
    var sat = b.saturday !== undefined ? b.saturday : b.weekend;
    var sun = b.sunday !== undefined ? b.sunday : b.weekend;
    return t("Sat ", "za ") + dash(sat) + t(", Sun ", ", zo ") + dash(sun);
  }
  return dash(b.weekend);
}

// Link that opens the place in Google Maps.
function mapLink(b) {
  var q = b.mapQuery || ((b.building && b.building !== b.name ? b.name + " " + b.building : b.name) + " TU Eindhoven");
  var a = el("a", b.name);
  a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  a.target = "_blank"; a.rel = "noopener";
  a.title = t("Show " + b.name + " on the map", b.name + " op de kaart bekijken");
  return a;
}

// Is this place open right now? Returns { open, soon, until, text }.
function status(b, now) {
  if (b.unknown) return { open: false, unknown: true, text: t("❔ Hours unknown", "❔ Tijden onbekend") };
  function openUntil(close) {
    var left = close - now.minutes;
    return left <= SOON
      ? { open: true, soon: true, until: close, text: t("⚠️ Closes in ", "⚠️ Sluit over ") + left + " min (" + fmt(close) + ")" }
      : { open: true, soon: false, until: close, text: t("✅ Open until ", "✅ Open tot ") + fmt(close) };
  }
  // Still open from yesterday (after midnight)?
  var y = parseRange(hoursOn(b, addDays(now.date, -1), (now.day + 6) % 7).range);
  if (y && y.close > 1440 && now.minutes < y.close - 1440) return openUntil(y.close - 1440);

  var td = parseRange(hoursOn(b, now.date, now.day).range);
  if (td && now.minutes >= td.open && now.minutes < td.close) return openUntil(td.close);
  if (td && now.minutes < td.open) return { open: false, opensAt: td.open, text: t("❌ Closed, opens today at ", "❌ Gesloten, opent vandaag om ") + fmt(td.open) };
  for (var i = 1; i <= 14; i++) {
    var wd = (now.day + i) % 7;
    var r = parseRange(hoursOn(b, addDays(now.date, i), wd).range);
    if (r) return { open: false, text: t("❌ Closed, opens ", "❌ Gesloten, opent ") + (i === 1 ? t("tomorrow", "morgen") : i < 7 ? DAYS[wd] : prettyDate(addDays(now.date, i))) + t(" at ", " om ") + fmt(r.open) };
  }
  return { open: false, text: t("❌ Closed", "❌ Gesloten") };
}

function el(tag, text) { var e = document.createElement(tag); if (text != null) e.textContent = text; return e; }

// Draws the big table. Phones (< 600 px) get fewer columns.
function renderTable(headId, bodyId, items, now, withBuilding) {
  var narrow = window.innerWidth < 600;
  var head = document.getElementById(headId), body = document.getElementById(bodyId);
  head.replaceChildren(); body.replaceChildren();

  var cols = [t("Name", "Naam"), t("Right now", "Nu"), t("Today", "Vandaag")];
  if (!narrow) { if (withBuilding) cols.push(t("Building", "Gebouw")); cols.push(t("Mon–Fri", "ma–vr"), t("Sat–Sun", "za–zo"), t("Notes", "Opmerkingen")); }
  if (!withBuilding) cols[0] = t("Building", "Gebouw");
  var hr = el("tr");
  cols.forEach(function (c) { var th = el("th", c); th.scope = "col"; hr.append(th); });
  head.append(hr);

  items.forEach(function (b) {
    var s = status(b, now), today = hoursOn(b, now.date, now.day);
    var tr = el("tr");
    var th = el("th"); th.scope = "row"; th.append(mapLink(b)); tr.append(th);
    if (narrow) {
      var small = el("small");
      if (withBuilding && b.building) small.append(el("br"), b.building);
      if (!b.unknown) small.append(el("br"), t("Mon–Fri ", "ma–vr ") + dash(b.weekdays), el("br"), t("Sat–Sun ", "za–zo ") + weekendText(b));
      if (noteOf(b)) small.append(el("br"), noteOf(b));
      th.append(small);
    }
    var now_td = el("td");
    if (s.open) now_td.append(el("b", s.text)); else now_td.textContent = s.text;
    tr.append(now_td);
    tr.append(el("td", b.unknown ? "?" : dash(today.range) + (today.label ? " (" + today.label + ")" : "")));
    if (!narrow) {
      if (withBuilding) tr.append(el("td", b.building || ""));
      tr.append(el("td", b.unknown ? "?" : dash(b.weekdays)));
      tr.append(el("td", b.unknown ? "?" : weekendText(b)));
      tr.append(el("td", noteOf(b)));
    }
    body.append(tr);
  });
}

// Banner for special days today or in the next 14 days.
function renderBanner(id, now) {
  var box = document.getElementById(id);
  box.replaceChildren();
  var days = window.SPECIAL_DAYS || {};
  var today = days[now.date];
  // Group consecutive days with the same label into one range.
  var upcoming = [], run = null;
  for (var i = 1; i <= 15; i++) {
    var d = addDays(now.date, i), label = days[d] && i <= 14 ? labelOf(days[d]) : null;
    if (run && label === run.label) { run.end = d; continue; }
    if (run) upcoming.push((run.end === run.start ? prettyDate(run.start) : prettyDate(run.start) + " – " + prettyDate(run.end)) + ": " + run.label);
    run = label ? { label: label, start: d, end: d } : null;
  }
  if (!today && upcoming.length === 0) { box.hidden = true; return; }
  box.hidden = false;
  var p = el("p");
  if (today) p.append(el("b", t("📅 Special hours today: ", "📅 Aangepaste tijden vandaag: ") + labelOf(today) + "."),
    t(" The times below already take this into account.", " De tijden hieronder houden hier al rekening mee."));
  if (upcoming.length) {
    if (today) p.append(el("br"));
    p.append(el("b", t("📅 Coming up: ", "📅 Binnenkort: ")), upcoming.slice(0, 3).join(" · ") + (upcoming.length > 3 ? t(" · and more", " · en meer") : "") + ".");
  }
  box.append(p, el("hr"));
}

// Re-run a render function every 30 s, and when a phone is rotated.
function keepFresh(render) {
  render();
  setInterval(render, 30000);
  var lastNarrow = window.innerWidth < 600;
  window.addEventListener("resize", function () {
    if ((window.innerWidth < 600) !== lastNarrow) { lastNarrow = !lastNarrow; render(); }
  });
}
