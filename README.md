# Is the TU/e open?

**[istueopen.nl](https://istueopen.nl)**

A small website that tells you which buildings, study spots and food places on the TU/e campus are open right now. In English and Dutch.

This is an unofficial student project and not affiliated with TU/e. The hours come from the [TU/e opening hours page](https://www.tue.nl/en/our-university/tue-campus/buildings/opening-hours-buildings) and can be out of date, so check the official sites when it matters.

## What it does

- Shows if the campus is open, with a warning when a building closes soon
- Lists every building, the library, the Sports Centre and all food places
- Campus map with walking routes between buildings
- Pin your own buildings to the top, and share a link to one building
- Study spots, exam period countdown and a rain warning
- Warns on Dutch public holidays and TU/e bridge days
- Report wrong hours through a form (only the admin sees the reports)
- Works offline and can be added to your home screen
- Light and dark mode

## Changing the hours

Almost everything you'd want to change is in `hours.js`:

| What | Where |
| --- | --- |
| Building hours | `BUILDINGS` |
| Library and Sports Centre | `SERVICES` |
| Food places | `FOOD` |
| Extra "hours may differ" days | `WARNING_DAYS` (public holidays are added automatically) |
| Exam periods | `EXAM_PERIODS` (update every summer) |
| Days with known special hours | `SPECIAL_DAYS` |

Hours are written as `"07:30-20:00"`, and `null` means closed. A building looks like this:

```js
{ name: "Flux", study: true, weekdays: "07:30-22:00", weekend: null,
  note: "Weekends 10:00–21:00 only during exam periods",
  noteNl: "Weekend 10:00–21:00 alleen in tentamenperiodes" }
```

Also update `HOURS_CHECKED` at the top of the file when you've checked the hours.

## Files

```
index.html, food.html, map.html, report.html, privacy.html   English pages
nl/                       Dutch pages (index, eten, kaart, melden, privacy)
hours.js                  all opening hours and dates
open.js                   status logic, tables, cards, favourites, holidays
map.js                    campus map and walking routes
site.js                   theme, language, offline note, clean URLs
style.css                 the look
sw.js                     offline cache (bump the version after changes)
admin.html                admin page to read the reports
firebase-config.js        Firebase project config for the report form
```

## Running it locally

It's plain HTML, CSS and JavaScript, so there's no build step. Start any local server in the folder:

```
python3 -m http.server
```

and open http://localhost:8000.

## Hosting

The site runs on GitHub Pages with the custom domain in `CNAME`. Every push to `main` goes live within a minute or two.

## Built with

- [Leaflet](https://leafletjs.com) and [OpenStreetMap](https://www.openstreetmap.org/copyright) for the map
- [OSRM](https://routing.openstreetmap.de) for walking routes
- [Open-Meteo](https://open-meteo.com) for the rain forecast
- [Firebase](https://firebase.google.com) for the report form and admin login
- [GoatCounter](https://www.goatcounter.com) for anonymous visit counts, without cookies
