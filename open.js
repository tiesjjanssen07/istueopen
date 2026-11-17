// logic for the opening hours pages (the hours themselves are in hours.js)

// dutch pages have <html lang="nl">
var NL = document.documentElement.lang === "nl";
function t(en, nl) { return NL ? nl : en; }
var DAYS = NL ? ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
              : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTHS = NL ? ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
                : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function noteOf(b) { return (NL && b.noteNl) || b.note || ""; }
function labelOf(sp) { return sp ? ((NL && sp.labelNl) || sp.label) : ""; }
var SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
var SOON = 30; // minutes

// always use dutch time, also for visitors abroad
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
  if (!r || r === "?") return null;
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
// used for days like christmas eve when everything closes early
function capRange(r, closeAt) {
  var p = parseRange(r), c = toMinutes(closeAt);
  if (!p) return r;
  if (p.open >= c) return null;
  return p.close > c ? r.split("-")[0] + "-" + closeAt : r;
}
// small "hours checked 11 nov" after the clock line, orange when it's over two weeks old
function addChecked(box, now) {
  var c = window.HOURS_CHECKED;
  if (!box || !/^\d{4}-\d{2}-\d{2}$/.test(c || "")) return;
  var d = new Date(c + "T12:00:00Z"), age = Math.round((new Date(now.date + "T12:00:00Z") - d) / 864e5);
  var text = d.getUTCDate() + " " + MONTHS[d.getUTCMonth()].slice(0, 3) + (c.slice(0, 4) !== now.date.slice(0, 4) ? " " + c.slice(0, 4) : "");
  var sp = el("span");
  sp.className = "checked" + (age > 14 ? " old" : "");
  sp.textContent = "· " + (age > 14 ? t("hours checked " + Math.floor(age / 7) + " weeks ago", "tijden " + Math.floor(age / 7) + " weken geleden gecontroleerd")
                            : t("hours checked " + text, "tijden gecontroleerd op " + text));
  sp.title = t("Last checked against the official TU/e pages", "Laatst vergeleken met de officiële TU/e-pagina's");
  box.append(" ", sp);
}
function checkedText() {
  var c = window.HOURS_CHECKED;
  if (!c) return t("unknown", "onbekend");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c)) return c;
  var d = new Date(c + "T12:00:00Z");
  return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
}

function weekendText(b) {
  if (b.saturday !== undefined || b.sunday !== undefined) {
    var sat = b.saturday !== undefined ? b.saturday : b.weekend;
    var sun = b.sunday !== undefined ? b.sunday : b.weekend;
    return t("Sat ", "za ") + dash(sat) + t(", Sun ", ", zo ") + dash(sun);
  }
  return dash(b.weekend);
}

function mapLink(b) {
  var q = b.mapQuery || ((b.building && b.building !== b.name ? b.name + " " + b.building : b.name) + " TU Eindhoven");
  var a = el("a", b.name);
  a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  a.target = "_blank"; a.rel = "noopener";
  a.title = t("Show " + b.name + " on the map", b.name + " op de kaart bekijken");
  return a;
}

function status(b, now) {
  if (b.unknown) return { open: false, unknown: true, text: t("❔ Hours unknown", "❔ Tijden onbekend") };
  function openUntil(close) {
    var left = close - now.minutes;
    return left <= SOON
      ? { open: true, soon: true, until: close, text: t("⚠️ Closes in ", "⚠️ Sluit over ") + left + " min (" + fmt(close) + ")" }
      : { open: true, soon: false, until: close, text: t("✅ Open until ", "✅ Open tot ") + fmt(close) };
  }
  // still open from yesterday? (luna, hubble)
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

function statusClass(s) { return s.open ? (s.soon ? "soon" : "open") : (s.unknown ? "unknown" : "closed"); }
// colour of the big answer box
function markAnswer() {
  var a = document.getElementById("answer");
  if (!a) return;
  var c = a.textContent.charAt(0);
  a.className = c === "✅" ? "yes" : c === "❌" ? "no" : "warn";
  // the same emoji at the end of the tab title
  if (!markAnswer.title) markAnswer.title = document.title;
  document.title = markAnswer.title + " " + (c === "✅" ? "✅" : c === "❌" ? "❌" : "🟠");
}

function el(tag, text) { var e = document.createElement(tag); if (text != null) e.textContent = text; return e; }

// desktop gets the full table, phones get cards with filters
var filters = {};
function renderTable(headId, bodyId, items, now, withBuilding) {
  var narrow = window.innerWidth < 700;
  var head = document.getElementById(headId), body = document.getElementById(bodyId);
  var table = head.parentNode;
  head.replaceChildren(); body.replaceChildren();
  var box = document.getElementById(bodyId + "-cards");
  if (!box) {
    box = el("div"); box.id = bodyId + "-cards"; box.className = "cardbox";
    table.parentNode.insertBefore(box, table.nextSibling);
  }
  box.replaceChildren();
  table.hidden = narrow; box.hidden = !narrow;
  if (narrow) return renderCards(box, bodyId, items, now, withBuilding);

  var cols = [withBuilding ? t("Name", "Naam") : t("Building", "Gebouw"), t("Right now", "Nu"), t("Today", "Vandaag"), t("Mon–Fri", "ma–vr"), t("Sat–Sun", "za–zo")];
  var hr = el("tr");
  cols.forEach(function (c) { var th = el("th", c); th.scope = "col"; hr.append(th); });
  head.append(hr);

  items.forEach(function (b) {
    var s = status(b, now), today = hoursOn(b, now.date, now.day);
    var tr = el("tr");
    if (linkedName() === b.name) tr.className = "linked";
    var th = el("th"); th.scope = "row";
    var line = el("span"); line.className = "name";
    line.append(mapLink(b), starButton(b));
    th.append(line);
    tr.append(th);
    if (withBuilding && b.building) { var meta = el("span", b.building); meta.className = "meta"; th.append(meta); }
    if (noteOf(b)) { var note = el("span", noteOf(b)); note.className = "note"; th.append(note); }
    var now_td = el("td");
    now_td.className = "status " + statusClass(s);
    if (s.open) now_td.append(el("b", s.text)); else now_td.textContent = s.text;
    tr.append(now_td);
    var td0 = el("td", b.unknown ? "?" : dash(today.range) + (today.label ? " (" + today.label + ")" : "")); td0.className = "time"; tr.append(td0);
    var td1 = el("td", b.unknown ? "?" : dash(b.weekdays)); td1.className = "time"; tr.append(td1);
    var td2 = el("td"); td2.className = "time";
    (b.unknown ? "?" : weekendText(b)).split(", ").forEach(function (x, i) { if (i) td2.append(el("br")); td2.append(x); });
    tr.append(td2);
    body.append(tr);
  });
}

function renderCards(box, key, items, now, withBuilding) {
  var opts = [["all", t("All", "Alles")], ["open", t("Open now", "Nu open")]];
  if (items.some(function (x) { return x.study; })) opts.push(["study", t("Study spots", "Studeerplekken")]);
  var pick = filters[key] || "all";
  if (items.length > 4) {
    var bar = el("div"); bar.className = "filter";
    bar.setAttribute("role", "group"); bar.setAttribute("aria-label", t("Filter", "Filteren"));
    opts.forEach(function (o) {
      var btn = el("button", o[1]); btn.type = "button";
      btn.setAttribute("aria-pressed", pick === o[0] ? "true" : "false");
      btn.addEventListener("click", function () { filters[key] = o[0]; if (window.rerender) window.rerender(); });
      bar.append(btn);
    });
    box.append(bar);
  }
  var ul = el("ul"); ul.className = "cards";
  items.forEach(function (b) {
    var s = status(b, now);
    if (pick === "open" && !s.open) return;
    if (pick === "study" && !b.study) return;
    var li = el("li"); li.className = "card " + statusClass(s) + (linkedName() === b.name ? " linked" : "");
    var main = el("div"); main.className = "main";
    var top = el("div"); top.className = "top";
    var name = el("b"); name.append(mapLink(b));
    var st = el("span", s.text.replace(/^\S+\s/, "")); st.className = "st";
    top.append(name, st);
    main.append(top);
    var bits = [];
    if (withBuilding && b.building) bits.push(b.building);
    if (!b.unknown) bits.push(t("Mon–Fri ", "ma–vr ") + dash(b.weekdays), (b.saturday !== undefined || b.sunday !== undefined) ? weekendText(b) : t("Sat–Sun ", "za–zo ") + weekendText(b));
    var sub = el("div"); sub.className = "sub";
    bits.forEach(function (x, i) { if (i) sub.append(" · "); var sp = el("span", x); sp.className = "nw"; sub.append(sp); });
    if (bits.length) main.append(sub);
    if (noteOf(b)) { var note = el("div", noteOf(b)); note.className = "cnote"; main.append(note); }
    li.append(main, starButton(b));
    ul.append(li);
  });
  if (!ul.children.length) { var none = el("p", t("Nothing here right now.", "Hier is nu niets.")); none.className = "empty"; box.append(none); }
  else box.append(ul);
}

// dutch public holidays
function easterSunday(year) {
  var a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
}
function holidayOn(dateStr) {
  var year = Number(dateStr.slice(0, 4)), md = dateStr.slice(5), easter = easterSunday(year);
  // king's day moves to the 26th if the 27th is a sunday
  var kings = new Date(year + "-04-27T12:00:00Z").getUTCDay() === 0 ? "04-26" : "04-27";
  var list = {};
  list[year + "-01-01"] = ["New Year's Day", "nieuwjaarsdag"];
  list[addDays(easter, -2)] = ["Good Friday", "Goede Vrijdag"];
  list[easter] = ["Easter Sunday", "eerste paasdag"];
  list[addDays(easter, 1)] = ["Easter Monday", "tweede paasdag"];
  list[year + "-" + kings] = ["King's Day", "Koningsdag"];
  list[year + "-05-05"] = ["Liberation Day", "Bevrijdingsdag"];
  list[addDays(easter, 39)] = ["Ascension Day", "Hemelvaartsdag"];
  list[addDays(easter, 49)] = ["Whit Sunday", "eerste pinksterdag"];
  list[addDays(easter, 50)] = ["Whit Monday", "tweede pinksterdag"];
  list[year + "-12-25"] = ["Christmas Day", "eerste kerstdag"];
  list[year + "-12-26"] = ["Boxing Day", "tweede kerstdag"];
  if (list[dateStr]) return list[dateStr][NL ? 1 : 0];
  var extra = window.WARNING_DAYS && (window.WARNING_DAYS[dateStr] || window.WARNING_DAYS[md]);
  return extra ? ((NL && extra.nameNl) || extra.name) : null;
}
function holidayWarning(now) {
  if (window.SPECIAL_DAYS && window.SPECIAL_DAYS[now.date]) return null;
  return holidayOn(now.date);
}

function renderBanner(id, now) {
  var box = document.getElementById(id);
  box.replaceChildren();
  var days = window.SPECIAL_DAYS || {};
  var today = days[now.date], holiday = holidayWarning(now);
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
  if (today) p.append(el("b", t("Special hours today: ", "Aangepaste tijden vandaag: ") + labelOf(today) + "."),
    t(" The times below already take this into account.", " De tijden hieronder houden hier al rekening mee."));
  else if (holiday) p.append(el("b", t("Hours may be different today because it's " + holiday + ".", "Vandaag kunnen de tijden anders zijn, want het is " + holiday + ".")),
    t(" The times below are the normal hours, so check the official page to be sure.", " Hieronder staan de normale tijden, dus check voor de zekerheid de officiële pagina."));
  if (upcoming.length) {
    if (today || holiday) p.append(el("br"));
    p.append(el("b", t("Coming up: ", "Binnenkort: ")), upcoming.slice(0, 4).join(" · ") + (upcoming.length > 4 ? t(" · and more", " · en meer") : "") + "."
      + t(" Hours may be different on those days.", " Op die dagen kunnen de tijden anders zijn."));
  }
  box.append(p, el("hr"));
}

function keepFresh(draw) {
  function render() { draw(); markAnswer(); }
  window.rerender = render;
  render();
  setInterval(render, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
  var lastNarrow = window.innerWidth < 700;
  window.addEventListener("resize", function () {
    if ((window.innerWidth < 700) !== lastNarrow) { lastNarrow = !lastNarrow; render(); }
  });
}

// favourites (only stored in the browser)
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
  var stars = document.querySelectorAll("button[data-star]");
  for (var k = 0; k < stars.length; k++) if (stars[k].getAttribute("data-star") === name) { stars[k].focus(); break; }
}
function starButton(b) {
  var on = isFav(b.name), btn = el("button", on ? "⭐" : "☆");
  btn.type = "button";
  btn.title = on ? t("Remove from your list", "Verwijderen uit je lijst") : t("Pin to the top", "Bovenaan vastzetten");
  btn.setAttribute("aria-label", btn.title + ": " + b.name);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("data-star", b.name);
  btn.addEventListener("click", function () { toggleFav(b.name); });
  return btn;
}

// links like ?b=Flux
function linkedName() {
  var wanted;
  try { wanted = new URLSearchParams(location.search).get("b"); } catch (e) { return null; }
  if (!wanted) return null;
  var all = [].concat(window.BUILDINGS || [], window.SERVICES || [], window.FOOD || []);
  for (var i = 0; i < all.length; i++) if (all[i].name.toLowerCase() === wanted.toLowerCase()) return all[i].name;
  return null;
}
function shareButton(b) {
  var btn = el("button", t("Share", "Delen"));
  btn.type = "button";
  btn.addEventListener("click", function () {
    var url = location.origin + location.pathname + "?b=" + encodeURIComponent(b.name);
    var text = t("Is " + b.name + " open right now?", "Is " + b.name + " nu open?");
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = t("Share", "Delen"); }, 2500); }
    if (navigator.share) {
      navigator.share({ title: text, text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { done(t("Link copied", "Link gekopieerd")); },
                                             function () { done(url); });
    } else done(url);
  });
  return btn;
}

// where to go when a place closes
function nextPlace(b, items, now) {
  var s = status(b, now);
  if (!s.open) return null;
  var hasStudy = items.some(function (x) { return x.study; });
  var pool = items.filter(function (x) { return x !== b && (!hasStudy || x.study); });
  var best = null, bestUntil = s.until;
  pool.forEach(function (x) {
    var sx = status(x, now);
    if (sx.open && sx.until > bestUntil) { best = x; bestUntil = sx.until; }
  });
  return best ? { place: best, until: bestUntil } : null;
}
function nextText(b, items, now) {
  var s = status(b, now);
  if (!s.open || s.until - now.minutes > 60) return "";
  var n = nextPlace(b, items, now);
  if (n) return t(" → then: ", " → daarna: ") + n.place.name + t(" (until ", " (tot ") + fmt(n.until) + ")";
  return t(" → nothing similar is open later", " → daarna is er niets vergelijkbaars meer open");
}

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
    var label = el("b"); label.append(mapLink(b));
    li.append(label);
    if (isFav(b.name)) li.append(starButton(b));
    var st = el("span"); st.className = statusClass(s);
    if (s.open) st.append(el("b", s.text)); else st.append(s.text);
    li.append(st);
    var nt = nextText(b, items, now);
    if (nt) { var ns = el("span", nt.replace(/^ → /, "→ ")); ns.className = "next"; li.append(ns); }
    var actions = el("span"); actions.className = "actions";
    actions.append(shareButton(b));
    if (!isFav(b.name)) { var save = el("button", t("⭐ Save", "⭐ Bewaren")); save.type = "button";
      save.addEventListener("click", function () { toggleFav(b.name); }); actions.append(save); }
    li.append(actions);
    ul.append(li);
  });
  box.append(ul, el("hr"));
}

// exam periods
function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000); }
function renderExam(id, now) {
  var box = document.getElementById(id);
  box.replaceChildren(); box.hidden = true;
  var periods = window.EXAM_PERIODS || [];
  for (var i = 0; i < periods.length; i++) {
    var p = periods[i], untilStart = daysBetween(now.date, p.start), untilEnd = daysBetween(now.date, p.end);
    if (untilStart <= 0 && untilEnd >= 0) {
      box.append(el("b", t("It's exam period", "Het is tentamenperiode")),
        t(" (until " + prettyDate(p.end) + "). During exams Flux and Neuron are usually also open at weekends, 10:00–21:00. Keep an eye on TU/e's announcements.",
          " (t/m " + prettyDate(p.end) + "). In tentamenperiodes zijn Flux en Neuron meestal ook in het weekend open, van 10:00 tot 21:00. Houd de aankondigingen van de TU/e in de gaten."));
      box.hidden = false; return;
    }
    if (untilStart > 0 && untilStart <= 21) {
      box.append(el("b", t("Exam period starts in " + untilStart + (untilStart === 1 ? " day" : " days"),
                           "De tentamenperiode begint over " + untilStart + (untilStart === 1 ? " dag" : " dagen"))),
        " (" + prettyDate(p.start) + " – " + prettyDate(p.end) + ").");
      box.hidden = false; return;
    }
  }
}

// rain forecast from open-meteo, refreshed every 15 min
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
  // open-meteo values are for the hour before the timestamp, so hour k is stored at k + 1
  function wet(k) {
    var mm = hourly.precipitation[k + 1], chance = hourly.precipitation_probability[k + 1];
    return mm >= 0.2 || (chance >= 70 && mm > 0);
  }
  function at(k) { return hourly.time[k].slice(11, 16); }
  var last = hourly.time.length - 2, msg;
  if (i0 > last) { box.hidden = true; return; }
  if (wet(i0)) {
    var dry = -1;
    for (var i = i0 + 1; i <= i0 + 6 && i <= last; i++) if (!wet(i)) { dry = i; break; }
    msg = dry !== -1 ? t("It's raining on campus, probably dry again around " + at(dry) + ".", "Het regent op de campus, rond " + at(dry) + " is het waarschijnlijk weer droog.")
                     : t("Rain on campus for the next few hours, so bring a raincoat.", "De komende uren regen op de campus, dus neem een regenjas mee.");
  } else {
    var rain = -1;
    for (var j = i0 + 1; j <= i0 + 3 && j <= last; j++) if (wet(j)) { rain = j; break; }
    msg = rain !== -1 ? t("Rain expected around " + at(rain) + ", so try to cycle before then.", "Rond " + at(rain) + " wordt regen verwacht, dus fiets als het kan voor die tijd.")
                      : t("Dry on campus for the next 3 hours.", "De komende 3 uur blijft het droog op de campus.");
  }
  box.replaceChildren();
  var a = el("a", "Open-Meteo.com"); a.href = "https://open-meteo.com/"; a.target = "_blank"; a.rel = "noopener";
  var small = el("small"); small.append(" (" + t("weather data: ", "weerdata: "), a, ")");
  box.append(msg, small);
  box.hidden = false;
}
