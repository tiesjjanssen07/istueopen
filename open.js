// Shared "is it open?" logic for index.html and food.html.
// You normally don't need to edit this file: hours live in hours.js.

var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
function dash(r) { return r ? r.replace("-", "–") : "Closed"; }

// Hours for one place on one date (special days win over the normal week).
function hoursOn(b, dateStr, day) {
  var special = window.SPECIAL_DAYS && window.SPECIAL_DAYS[dateStr];
  if (special) {
    if (special.buildings && b.name in special.buildings) return { range: special.buildings[b.name], label: special.label };
    if ("all" in special) return { range: special.all, label: special.label };
  }
  return { range: (day === 0 || day === 6) ? b.weekend : b.weekdays, label: "" };
}

// Is this place open right now? Returns { open, soon, until, text }.
function status(b, now) {
  if (b.unknown) return { open: false, unknown: true, text: "❔ Hours unknown" };
  function openUntil(close) {
    var left = close - now.minutes;
    return left <= SOON
      ? { open: true, soon: true, until: close, text: "⚠️ Closes in " + left + " min (" + fmt(close) + ")" }
      : { open: true, soon: false, until: close, text: "✅ Open until " + fmt(close) };
  }
  // Still open from yesterday (after midnight)?
  var y = parseRange(hoursOn(b, addDays(now.date, -1), (now.day + 6) % 7).range);
  if (y && y.close > 1440 && now.minutes < y.close - 1440) return openUntil(y.close - 1440);

  var t = parseRange(hoursOn(b, now.date, now.day).range);
  if (t && now.minutes >= t.open && now.minutes < t.close) return openUntil(t.close);
  if (t && now.minutes < t.open) return { open: false, opensAt: t.open, text: "❌ Closed, opens today at " + fmt(t.open) };
  for (var i = 1; i <= 14; i++) {
    var wd = (now.day + i) % 7;
    var r = parseRange(hoursOn(b, addDays(now.date, i), wd).range);
    if (r) return { open: false, text: "❌ Closed, opens " + (i === 1 ? "tomorrow" : DAYS[wd]) + " at " + fmt(r.open) };
  }
  return { open: false, text: "❌ Closed" };
}

function el(tag, text) { var e = document.createElement(tag); if (text != null) e.textContent = text; return e; }

// Draws the big table. Phones (< 600 px) get fewer columns.
function renderTable(headId, bodyId, items, now, withBuilding) {
  var narrow = window.innerWidth < 600;
  var head = document.getElementById(headId), body = document.getElementById(bodyId);
  head.replaceChildren(); body.replaceChildren();

  var cols = ["Name", "Right now", "Today"];
  if (!narrow) { if (withBuilding) cols.push("Building"); cols.push("Mon–Fri", "Sat–Sun", "Notes"); }
  if (!withBuilding) cols[0] = "Building";
  var hr = el("tr");
  cols.forEach(function (c) { var th = el("th", c); th.scope = "col"; hr.append(th); });
  head.append(hr);

  items.forEach(function (b) {
    var s = status(b, now), today = hoursOn(b, now.date, now.day);
    var tr = el("tr");
    var th = el("th", b.name); th.scope = "row"; tr.append(th);
    if (narrow) {
      var small = el("small");
      if (withBuilding && b.building) small.append(el("br"), b.building);
      if (!b.unknown) small.append(el("br"), "Mon–Fri " + dash(b.weekdays), el("br"), "Sat–Sun " + dash(b.weekend));
      if (b.note) small.append(el("br"), b.note);
      th.append(small);
    }
    var now_td = el("td");
    if (s.open) now_td.append(el("b", s.text)); else now_td.textContent = s.text;
    tr.append(now_td);
    tr.append(el("td", b.unknown ? "?" : dash(today.range) + (today.label ? " (" + today.label + ")" : "")));
    if (!narrow) {
      if (withBuilding) tr.append(el("td", b.building || ""));
      tr.append(el("td", b.unknown ? "?" : dash(b.weekdays)));
      tr.append(el("td", b.unknown ? "?" : dash(b.weekend)));
      tr.append(el("td", b.note || ""));
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
  var upcoming = [];
  for (var i = 1; i <= 14; i++) {
    var d = addDays(now.date, i);
    if (days[d]) upcoming.push(prettyDate(d) + ": " + days[d].label);
  }
  if (!today && upcoming.length === 0) { box.hidden = true; return; }
  box.hidden = false;
  var p = el("p");
  if (today) p.append(el("b", "📅 Special hours today: " + today.label + "."), " The times below already take this into account.");
  if (upcoming.length) {
    if (today) p.append(el("br"));
    p.append(el("b", "📅 Coming up: "), upcoming.slice(0, 3).join(" · ") + (upcoming.length > 3 ? " · and more" : "") + ".");
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
