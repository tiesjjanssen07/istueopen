// campus map: openstreetmap tiles (leaflet), building outlines from overpass, walking routes from routing.openstreetmap.de
(function () {
  var mapEl = document.getElementById("map"), routeBox = document.getElementById("routebox"), missingEl = document.getElementById("missing");
  if (!mapEl) return;
  if (!window.L) {
    mapEl.replaceChildren(el("p", t("The map couldn't load. Check your internet connection and try again.",
                                    "De kaart kon niet laden. Check je internetverbinding en probeer het opnieuw.")));
    mapEl.className = "failed";
    return;
  }

  var BBOX = "51.4425,5.4790,51.4545,5.5010"; // south,west,north,east around the campus
  var CACHE_KEY = "istueopen-osm-v1", WEEK = 7 * 24 * 3600 * 1000;
  var COLORS = { open: "#1f7a3f", soon: "#e09a1b", closed: "#8a8a85", unknown: "#8a8a85" };

  var map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([51.4482, 5.4900], 16);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // places we can show: all buildings, plus services that say which building they are (osm)
  var places = (window.BUILDINGS || []).concat((window.SERVICES || []).filter(function (s) { return s.osm; }));
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function matchPlace(osmName) {
    var n = norm(osmName);
    for (var i = 0; i < places.length; i++) {
      var p = places[i];
      if (n === norm(p.osm || p.name) || n === norm(p.name)) return p;
    }
    for (var j = 0; j < places.length; j++) {
      var q = norm(places[j].osm || places[j].name);
      if (q.length >= 4 && n.indexOf(q) !== -1) return places[j];
    }
    return null;
  }

  var shapes = {};   // place name -> [L.polygon]
  var centers = {};  // place name -> [lat, lon]
  var sel = [], routeLine = null, routeReq = 0;

  function styleFor(p, now) {
    var cls = statusClass(status(p, now)), chosen = sel.indexOf(p.name) !== -1;
    return { color: chosen ? "#1d1d1b" : COLORS[cls], weight: chosen ? 4 : 2, fillColor: COLORS[cls], fillOpacity: chosen ? 0.75 : 0.5 };
  }
  function restyle() {
    var now = amsterdamNow();
    places.forEach(function (p) { (shapes[p.name] || []).forEach(function (s) { s.setStyle(styleFor(p, now)); }); });
    var c = document.getElementById("clock");
    if (c) c.textContent = t("It is " + DAYS[now.day] + " " + now.time + ". Colours update live.", "Het is " + DAYS[now.day] + " " + now.time + ". De kleuren worden live bijgewerkt.");
    if (sel.length === 2) describeRoute(lastRoute);
  }

  function addPlace(p, rings) {
    rings.forEach(function (ring) {
      var poly = L.polygon(ring, styleFor(p, amsterdamNow())).addTo(map);
      poly.bindTooltip(p.name, { permanent: true, direction: "center", className: "blabel" });
      poly.on("click", function () { choose(p.name); });
      (shapes[p.name] = shapes[p.name] || []).push(poly);
    });
    var lat = 0, lon = 0, n = 0;
    rings[0].forEach(function (pt) { lat += pt[0]; lon += pt[1]; n++; });
    if (!centers[p.name]) centers[p.name] = [lat / n, lon / n];
  }

  function useData(elements) {
    elements.forEach(function (e) {
      var p = matchPlace(e.tags && e.tags.name);
      if (!p) return;
      var rings = [];
      if (e.type === "way" && e.geometry) rings.push(e.geometry.map(function (g) { return [g.lat, g.lon]; }));
      if (e.type === "relation" && e.members) e.members.forEach(function (m) {
        if (m.role === "outer" && m.geometry) rings.push(m.geometry.map(function (g) { return [g.lat, g.lon]; }));
      });
      if (rings.length) addPlace(p, rings);
    });
    var missing = places.filter(function (p) { return !shapes[p.name] && (p.weekdays || p.weekend); }).map(function (p) { return p.name; });
    if (missing.length && missingEl) missingEl.textContent = t("Not on the map (yet): ", "(Nog) niet op de kaart: ") + missing.join(", ") + ".";
    var all = [];
    Object.keys(shapes).forEach(function (k) { shapes[k].forEach(function (s) { all.push(s); }); });
    if (all.length) map.fitBounds(L.featureGroup(all).getBounds(), { padding: [10, 10] });
    restyle();
    preselect();
  }

  function loadBuildings() {
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) {}
    if (cached && cached.time && Date.now() - cached.time < WEEK && cached.elements) { useData(cached.elements); return; }
    var q = '[out:json][timeout:25];(way["building"]["name"](' + BBOX + ');relation["building"]["name"](' + BBOX + '););out geom;';
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST", body: "data=" + encodeURIComponent(q),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var els = (data.elements || []).filter(function (e) { return matchPlace(e.tags && e.tags.name); });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), elements: els })); } catch (e) {}
        useData(els);
      })
      .catch(function () {
        if (cached && cached.elements) { useData(cached.elements); return; }
        if (missingEl) missingEl.textContent = t("The buildings couldn't be loaded right now. Try again in a minute.",
                                                 "De gebouwen konden nu niet geladen worden. Probeer het over een minuut opnieuw.");
      });
  }

  // ---- choosing buildings and routes
  function choose(name) {
    sel = sel.length >= 2 ? [name] : sel.concat([name]).filter(function (v, i, a) { return a.indexOf(v) === i; });
    try {
      var q = sel.length ? "?from=" + encodeURIComponent(sel[0]) + (sel[1] ? "&to=" + encodeURIComponent(sel[1]) : "") : "";
      history.replaceState(null, "", location.pathname + q);
    } catch (e) {}
    if (sel.length === 2) route(); else { clearRoute(); hint(); }
    restyle();
  }
  function preselect() {
    var u; try { u = new URLSearchParams(location.search); } catch (e) { hint(); return; }
    var a = u.get("from"), b = u.get("to");
    function find(n) { return places.filter(function (p) { return n && p.name.toLowerCase() === n.toLowerCase(); })[0]; }
    var pa = find(a), pb = find(b);
    if (pa && centers[pa.name]) { sel = [pa.name]; if (pb && centers[pb.name] && pb !== pa) { sel.push(pb.name); route(); } else hint(); restyle(); }
    else hint();
  }
  function hint() {
    routeBox.replaceChildren(sel.length === 1
      ? t(sel[0] + " selected. Now tap where you want to go.", sel[0] + " gekozen. Tik nu op waar je heen wilt.")
      : t("Tap a building to start, then tap where you want to go.", "Tik op een gebouw om te beginnen, en daarna op waar je heen wilt."));
  }
  function clearRoute() { if (routeLine) { map.removeLayer(routeLine); routeLine = null; } lastRoute = null; }

  function haversine(a, b) {
    var R = 6371000, toR = Math.PI / 180, dLat = (b[0] - a[0]) * toR, dLon = (b[1] - a[1]) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  var lastRoute = null;
  function route() {
    clearRoute();
    var a = centers[sel[0]], b = centers[sel[1]], id = ++routeReq;
    routeBox.replaceChildren(t("Finding a route…", "Route zoeken…"));
    var url = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/" + a[1] + "," + a[0] + ";" + b[1] + "," + b[0] + "?overview=full&geometries=geojson";
    fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (id !== routeReq) return;
        var r = data.routes && data.routes[0];
        if (!r) throw new Error("no route");
        draw(r.geometry.coordinates.map(function (c) { return [c[1], c[0]]; }), r.distance, false);
      })
      .catch(function () {
        if (id !== routeReq) return;
        draw([a, b], haversine(a, b) * 1.3, true); // rough guess when the routing service is down
      });
  }
  function draw(points, meters, rough) {
    routeLine = L.polyline(points, { color: "#2f5bd3", weight: 6, opacity: 0.9, dashArray: rough ? "4 10" : "10 8", className: "route" }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    lastRoute = { meters: meters, rough: rough };
    describeRoute(lastRoute);
  }
  function describeRoute(r) {
    if (!r || sel.length !== 2) return;
    var now = amsterdamNow(), dest = places.filter(function (p) { return p.name === sel[1]; })[0];
    var meters = Math.round(r.meters / 10) * 10, mins = Math.max(1, Math.round(r.meters / 80)), st = status(dest, now);
    routeBox.replaceChildren();
    var big = el("b", "🚶 " + mins + " min " + t("walk", "lopen")); big.className = "t";
    routeBox.append(big, " (" + (r.rough ? t("roughly ", "ongeveer ") : t("about ", "ongeveer ")) + meters + " m)", el("br"), sel[0] + " → " + sel[1] + ": ");
    var sp = el("span"); sp.className = statusClass(st);
    if (st.open) sp.append(el("b", st.text)); else sp.append(st.text);
    routeBox.append(sp);
    if (st.open && st.until - (now.minutes + mins) < 15)
      routeBox.append(el("br"), t("⚠️ You'd arrive just before it closes.", "⚠️ Je komt pas aan vlak voordat het sluit."));
    if (!st.open && !st.unknown)
      routeBox.append(el("br"), t("⚠️ It's closed right now.", "⚠️ Het is nu dicht."));
    if (r.rough) routeBox.append(el("br"), el("small", t("The route service didn't answer, so this is a straight-line estimate.",
                                                        "De routeservice reageerde niet, dus dit is een schatting in een rechte lijn.")));
    var share = el("button", t("Share route", "Route delen")); share.type = "button";
    share.addEventListener("click", function () {
      var link = location.origin + location.pathname + "?from=" + encodeURIComponent(sel[0]) + "&to=" + encodeURIComponent(sel[1]);
      if (navigator.share) navigator.share({ title: sel[0] + " → " + sel[1], url: link }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { share.textContent = t("Link copied", "Link gekopieerd"); });
    });
    var clear = el("button", t("Clear", "Wissen")); clear.type = "button";
    clear.addEventListener("click", function () { sel = []; clearRoute(); hint(); restyle(); try { history.replaceState(null, "", location.pathname); } catch (e) {} });
    routeBox.append(el("br"), share, " ", clear);
  }

  hint();
  loadBuildings();
  setInterval(restyle, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) restyle(); });
})();
