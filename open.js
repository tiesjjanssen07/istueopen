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
  if (!r || r === "?") return null; // "?" = unknown that day
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
  var normal = (day === 6 && b.saturday !== undefined) ? b.saturday
             : (day === 0 && b.sunday !== undefined) ? b.sunday
             : (day === 0 || day === 6) ? b.weekend : b.weekdays;
  var special = window.SPECIAL_DAYS && window.SPECIAL_DAYS[dateStr];
  if (special) {
    var range = normal;
    if (special.buildings && b.name in special.buildings) range = special.buildings[b.name];
    else if ("all" in special) range = special.all;
    else if (special.closeAt) range = capRange(normal, special.closeAt);
    if (range !== normal) return { range: range, label: labelOf(special) };
  }
  return { range: normal, label: "" };
}
// "07:30-20:00" capped at "16:00" becomes "07:30-16:00"; a place that opens later is closed.
function capRange(r, closeAt) {
  var p = parseRange(r), c = toMinutes(closeAt);
  if (!p) return r;
  if (p.open >= c) return null;
  return p.close > c ? r.split("-")[0] + "-" + closeAt : r;
}
// "11 November 2026" / "11 november 2026" from window.HOURS_CHECKED ("YYYY-MM-DD").
function checkedText() {
  var c = window.HOURS_CHECKED;
  if (!c) return t("unknown", "onbekend");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c)) return c;
  var d = new Date(c + "T12:00:00Z");
  return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
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

  var todayHours = hoursOn(b, now.date, now.day).range;
  if (todayHours === "?") return { open: false, unknown: true, text: t("❔ Unknown today, check the official site", "❔ Vandaag onbekend, check de officiële site") };
  var td = parseRange(todayHours);
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
    var th = el("th"); th.scope = "row";
    var name = mapLink(b);
    if (linkedName() === b.name) { var mk = el("mark"); mk.append("👉 ", name); th.append(mk); } else th.append(name);
    th.append(" ", starButton(b));
    tr.append(th);
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

// ---------- Dutch public holidays (calculated, so they work for every year) ----------
function easterSunday(year) {
  var a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
}
// Name of the public holiday (or extra warning day from hours.js) on a date, or null.
function holidayOn(dateStr) {
  var year = Number(dateStr.slice(0, 4)), md = dateStr.slice(5), easter = easterSunday(year);
  // King's Day is 27 April, or 26 April when the 27th is a Sunday.
  var kings = new Date(year + "-04-27T12:00:00Z").getUTCDay() === 0 ? "04-26" : "04-27";
  var list = {};
  list[year + "-01-01"] = ["New Year's Day", "Nieuwjaarsdag"];
  list[addDays(easter, -2)] = ["Good Friday", "Goede Vrijdag"];
  list[easter] = ["Easter Sunday", "Eerste Paasdag"];
  list[addDays(easter, 1)] = ["Easter Monday", "Tweede Paasdag"];
  list[year + "-" + kings] = ["King's Day", "Koningsdag"];
  list[year + "-05-05"] = ["Liberation Day", "Bevrijdingsdag"];
  list[addDays(easter, 39)] = ["Ascension Day", "Hemelvaartsdag"];
  list[addDays(easter, 49)] = ["Whit Sunday", "Eerste Pinksterdag"];
  list[addDays(easter, 50)] = ["Whit Monday", "Tweede Pinksterdag"];
  list[year + "-12-25"] = ["Christmas Day", "Eerste Kerstdag"];
  list[year + "-12-26"] = ["Boxing Day", "Tweede Kerstdag"];
  if (list[dateStr]) return list[dateStr][NL ? 1 : 0];
  var extra = window.WARNING_DAYS && (window.WARNING_DAYS[dateStr] || window.WARNING_DAYS[md]);
  return extra ? ((NL && extra.nameNl) || extra.name) : null;
}
// Holiday name if today needs an "hours may differ" warning (not when exact special hours are set).
function holidayWarning(now) {
  if (window.SPECIAL_DAYS && window.SPECIAL_DAYS[now.date]) return null;
  return holidayOn(now.date);
}

// Banner: warnings and special days, today and in the next 14 days.
function renderBanner(id, now) {
  var box = document.getElementById(id);
  box.replaceChildren();
  var days = window.SPECIAL_DAYS || {};
  var today = days[now.date], holiday = holidayWarning(now);
  // Group consecutive days with the same label into one range.
  var upcoming = [], run = null;
  for (var i = 1; i <= 15; i++) {
    var d = addDays(now.date, i), label = i > 14 ? null : days[d] ? labelOf(days[d]) : holidayOn(d);
    if (run && label === run.label) { run.end = d; continue; }
    if (run) upcoming.push((run.end === run.start ? prettyDate(run.start) : prettyDate(run.start) + " – " + prettyDate(run.end)) + ": " + run.label);
    run = label ? { label: label, start: d, end: d } : null;
  }
  if (!today && !holiday && upcoming.length === 0) { box.hidden = true; return; }
  box.hidden = false;
  var p = el("p");
  if (today) p.append(el("b", t("📅 Special hours today: ", "📅 Aangepaste tijden vandaag: ") + labelOf(today) + "."),
    t(" The times below already take this into account.", " De tijden hieronder houden hier al rekening mee."));
  else if (holiday) p.append(el("b", t("⚠️ Hours may differ today because it's " + holiday + ".", "⚠️ Tijden kunnen vandaag afwijken omdat het " + holiday + " is.")),
    t(" The times below are the normal hours, so check the official page to be sure.", " De tijden hieronder zijn de normale tijden; check de officiële pagina voor de zekerheid."));
  if (upcoming.length) {
    if (today || holiday) p.append(el("br"));
    p.append(el("b", t("📅 Coming up: ", "📅 Binnenkort: ")), upcoming.slice(0, 4).join(" · ") + (upcoming.length > 4 ? t(" · and more", " · en meer") : "") + "."
      + t(" Hours may differ on those days.", " Op die dagen kunnen de tijden afwijken."));
  }
  box.append(p, el("hr"));
}

// Re-run a render function every 30 s, when a phone is rotated, and when you come back to the tab.
function keepFresh(render) {
  window.rerender = render;
  render();
  setInterval(render, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
  var lastNarrow = window.innerWidth < 600;
  window.addEventListener("resize", function () {
    if ((window.innerWidth < 600) !== lastNarrow) { lastNarrow = !lastNarrow; render(); }
  });
}


// ====================================================================
// ⭐ Favourites ("my buildings"), remembered in this browser only.
// ====================================================================
var FAV_KEY = "istueopen-favourites";
function favs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
}
function isFav(name) { return favs().indexOf(name) !== -1; }
function toggleFav(name) {
  var f = favs(), i = f.indexOf(name);
  if (i === -1) f.push(name); else f.splice(i, 1);
  try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
  if (window.rerender) window.rerender();
}
function starButton(b) {
  var on = isFav(b.name), btn = el("button", on ? "⭐" : "☆");
  btn.type = "button";
  btn.title = on ? t("Remove from your list", "Verwijderen uit je lijst") : t("Pin to the top", "Bovenaan vastzetten");
  btn.setAttribute("aria-label", btn.title + ": " + b.name);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.addEventListener("click", function () { toggleFav(b.name); });
  return btn;
}

// ====================================================================
// 🔗 Links to one place: ?b=Flux highlights Flux and puts it at the top.
// ====================================================================
function linkedName() {
  var wanted;
  try { wanted = new URLSearchParams(location.search).get("b"); } catch (e) { return null; }
  if (!wanted) return null;
  var all = [].concat(window.BUILDINGS || [], window.SERVICES || [], window.FOOD || []);
  for (var i = 0; i < all.length; i++) if (all[i].name.toLowerCase() === wanted.toLowerCase()) return all[i].name;
  return null;
}
function shareButton(b) {
  var btn = el("button", t("📤 Share", "📤 Delen"));
  btn.type = "button";
  btn.addEventListener("click", function () {
    var url = location.origin + location.pathname + "?b=" + encodeURIComponent(b.name);
    var text = t("Is " + b.name + " open right now?", "Is " + b.name + " nu open?");
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = t("📤 Share", "📤 Delen"); }, 2500); }
    if (navigator.share) {
      navigator.share({ title: text, text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { done(t("✅ Link copied!", "✅ Link gekopieerd!")); },
                                             function () { done(url); });
    } else done(url);
  });
  return btn;
}

// ====================================================================
// ➡️ Where to go next: another place from the same list that stays open longer.
// ====================================================================
function nextPlace(b, items, now) {
  var s = status(b, now);
  if (!s.open) return null;
  var pool = items.filter(function (x) { return x !== b && (!b.study || x.study); });
  var best = null, bestUntil = s.until;
  pool.forEach(function (x) {
    var sx = status(x, now);
    if (sx.open && sx.until > bestUntil) { best = x; bestUntil = sx.until; }
  });
  return best ? { place: best, until: bestUntil } : null;
}
// Text like "→ then: MetaForum (until 22:00)" when b closes within the hour.
function nextText(b, items, now) {
  var s = status(b, now);
  if (!s.open || s.until - now.minutes > 60) return "";
  var n = nextPlace(b, items, now);
  if (n) return t(" → then: ", " → daarna: ") + n.place.name + t(" (until ", " (tot ") + fmt(n.until) + ")";
  return t(" → nothing similar is open later", " → daarna is er niets vergelijkbaars meer open");
}

// The "⭐ Your buildings" box: favourites plus the linked place.
function renderMine(boxId, items, now, title) {
  var box = document.getElementById(boxId);
  box.replaceChildren();
  var names = favs().slice(), linked = linkedName();
  if (linked && names.indexOf(linked) === -1) names.unshift(linked);
  var mine = names.map(function (n) { return items.filter(function (x) { return x.name === n; })[0]; }).filter(Boolean);
  if (!mine.length) { box.hidden = true; return; }
  box.hidden = false;
  box.append(el("h2", title));
  var ul = el("ul");
  mine.forEach(function (b) {
    var s = status(b, now), li = el("li");
    var label = el("b"); label.append(mapLink(b)); li.append(label, ": ");
    if (s.open) li.append(el("b", s.text)); else li.append(s.text);
    var nt = nextText(b, items, now);
    if (nt) li.append(el("br"), nt);
    li.append(el("br"), shareButton(b), " ");
    if (isFav(b.name)) li.append(starButton(b));
    else { var save = el("button", t("⭐ Save", "⭐ Bewaren")); save.type = "button";
           save.addEventListener("click", function () { toggleFav(b.name); }); li.append(save); }
    ul.append(li);
  });
  box.append(ul, el("hr"));
}

// ====================================================================
// 📚 Exam-period countdown (dates in hours.js, from the TU/e academic calendar).
// ====================================================================
function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000); }
function renderExam(id, now) {
  var box = document.getElementById(id);
  box.replaceChildren(); box.hidden = true;
  var periods = window.EXAM_PERIODS || [];
  for (var i = 0; i < periods.length; i++) {
    var p = periods[i], untilStart = daysBetween(now.date, p.start), untilEnd = daysBetween(now.date, p.end);
    if (untilStart <= 0 && untilEnd >= 0) {
      box.append(el("b", t("📚 It's exam period", "📚 Het is tentamenperiode")),
        t(" (until " + prettyDate(p.end) + "). Good luck! Flux and Neuron are usually open at weekends from 10:00 to 21:00 during exams; check TU/e's announcements.",
          " (tot " + prettyDate(p.end) + "). Succes! Flux en Neuron zijn in tentamenperiodes meestal ook in het weekend open van 10:00 tot 21:00; check de aankondigingen van de TU/e."));
      box.hidden = false; return;
    }
    if (untilStart > 0 && untilStart <= 21) {
      box.append(el("b", t("📚 Exam period starts in " + untilStart + (untilStart === 1 ? " day" : " days"),
                           "📚 Tentamenperiode begint over " + untilStart + (untilStart === 1 ? " dag" : " dagen"))),
        " (" + prettyDate(p.start) + " – " + prettyDate(p.end) + ").");
      box.hidden = false; return;
    }
  }
}

// ====================================================================
// 🌧️ Rain warning for cycling (Open-Meteo, free, no account; fetched every 15 min).
// ====================================================================
var weatherCache = null, weatherFetched = 0;
function renderWeather(id, now) {
  var box = document.getElementById(id);
  if (!window.fetch || !window.CAMPUS) return;
  if (weatherCache) drawWeather(box, weatherCache, now);
  if (Date.now() - weatherFetched < 15 * 60000) return;
  weatherFetched = Date.now();
  var url = "https://api.open-meteo.com/v1/forecast?latitude=" + window.CAMPUS.lat + "&longitude=" + window.CAMPUS.lon +
            "&hourly=precipitation,precipitation_probability&timezone=Europe%2FAmsterdam&forecast_days=2";
  fetch(url).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { if (data && data.hourly) { weatherCache = data.hourly; drawWeather(box, weatherCache, amsterdamNow()); } })
    .catch(function () {});
}
function drawWeather(box, hourly, now) {
  var hour = now.date + "T" + now.time.slice(0, 2) + ":00";
  var i0 = hourly.time.indexOf(hour);
  if (i0 === -1) { box.hidden = true; return; }
  function wet(i) { return hourly.precipitation[i] >= 0.2 || (hourly.precipitation_probability[i] >= 70 && hourly.precipitation[i] > 0); }
  function at(i) { return hourly.time[i].slice(11, 16); }
  var msg;
  if (wet(i0)) {
    var dry = -1;
    for (var i = i0 + 1; i <= i0 + 6 && i < hourly.time.length; i++) if (!wet(i)) { dry = i; break; }
    msg = dry !== -1 ? t("🌧️ Rain on campus now, probably dry from about " + at(dry) + ".", "🌧️ Het regent nu op de campus, waarschijnlijk droog vanaf ongeveer " + at(dry) + ".")
                     : t("🌧️ Rain on campus for the next few hours. Bring a raincoat!", "🌧️ De komende uren regen op de campus. Neem een regenjas mee!");
  } else {
    var rain = -1;
    for (var j = i0 + 1; j <= i0 + 3 && j < hourly.time.length; j++) if (wet(j)) { rain = j; break; }
    msg = rain !== -1 ? t("🌦️ Rain expected around " + at(rain) + ". Cycle before then if you can.", "🌦️ Rond " + at(rain) + " wordt regen verwacht. Fiets als het kan daarvoor.")
                      : t("🚲 Dry on campus for the next 3 hours.", "🚲 De komende 3 uur droog op de campus.");
  }
  box.replaceChildren();
  var a = el("a", "Open-Meteo.com"); a.href = "https://open-meteo.com/"; a.target = "_blank"; a.rel = "noopener";
  var small = el("small"); small.append(" (" + t("weather data: ", "weerdata: "), a, ")");
  box.append(msg, small);
  box.hidden = false;
}
