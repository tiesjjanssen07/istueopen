// ============================================================
//  OPENING HOURS – edit this file when TU/e changes its hours.
//  Source: https://www.tue.nl/en/our-university/tue-campus/buildings/opening-hours-buildings
// ============================================================

// Shown on the page so visitors know how fresh the data is.
window.HOURS_CHECKED = "2026-11-11"; // write the date as YYYY-MM-DD

// weekdays = Monday to Friday, weekend = Saturday and Sunday.
// Write hours as "HH:MM-HH:MM". A closing time after midnight (e.g. "08:00-02:00") is fine.
// Use null when the building is closed in that period.
// note = English note, noteNl = Dutch note (for the Dutch pages). Special days: label and labelNl.
// Different hours on Saturday and Sunday? Add saturday: "..." and/or sunday: "..." (they win over weekend).
// Optional: mapQuery: "..." to change what the map link searches for.
window.BUILDINGS = [
  { name: "Atlas",        weekdays: "07:30-20:00", weekend: null },
  { name: "Auditorium",   weekdays: "07:30-20:00", weekend: null },
  { name: "Cascade",      weekdays: "07:30-20:00", weekend: null },
  { name: "Ceres",        weekdays: "07:30-20:00", weekend: null },
  { name: "Flux", study: true,         weekdays: "07:30-22:00", weekend: null, note: "Weekends 10:00–21:00 only during exam periods", noteNl: "Weekend 10:00–21:00 alleen in tentamenperiodes" },
  { name: "Gaslab",       weekdays: "08:00-18:00", weekend: null },
  { name: "Gemini-Noord", weekdays: "07:30-20:00", weekend: null },
  { name: "Gemini-Zuid",  weekdays: null,          weekend: null, note: "Closed due to renovation", noteNl: "Gesloten wegens renovatie" },
  { name: "Helix",        weekdays: "07:30-20:00", weekend: null, note: "Campus card holders only (labs)", noteNl: "Alleen met campuskaart (labs)" },
  { name: "Luna",         weekdays: "08:00-02:00", weekend: "10:00-02:00" },
  { name: "Matrix",       weekdays: "07:30-20:00", weekend: null },
  { name: "MetaForum", study: true,    weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "Library building", noteNl: "Gebouw van de bibliotheek" },
  { name: "Momentum",     weekdays: null,          weekend: null, note: "Not freely accessible", noteNl: "Niet vrij toegankelijk" },
  { name: "Neuron", study: true,       weekdays: "07:30-22:00", weekend: null, note: "Weekends 10:00–21:00 only during exam periods", noteNl: "Weekend 10:00–21:00 alleen in tentamenperiodes" },
  { name: "Pendulum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Qubit",        weekdays: "07:30-20:00", weekend: null },
  { name: "Spectrum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Traverse",     weekdays: "07:30-20:00", weekend: null },
  { name: "Vector",       weekdays: "07:30-20:00", weekend: null },
  { name: "Vertigo",      weekdays: "07:30-20:00", weekend: null },
  { name: "Zwarte Doos",  weekdays: "08:30-20:00", weekend: null }
];

// Other services students often need.
window.SERVICES = [
  { name: "Library", building: "MetaForum", weekdays: "08:00-22:00", weekend: "10:00-21:00",
    mapQuery: "TU/e Library MetaForum Eindhoven",
    note: "TU/e ID card needed during exam weeks (18–31 Jan 2027)", noteNl: "TU/e-kaart nodig in tentamenweken (18–31 jan 2027)" },
  // Source: https://ssceindhoven.tue.nl (opening hours SSC)
  { name: "Student Sports Centre", building: "Sports Centre", weekdays: "07:30-00:00", saturday: "08:30-21:00", sunday: "09:00-17:00",
    mapQuery: "Student Sports Centre Eindhoven", note: "Exercising until 23:00 on weekdays", noteNl: "Sporten tot 23:00 op doordeweekse dagen" }
];

// Places to eat and drink. Same format as the buildings.
// Source: https://www.tue.nl/en/our-university/about-the-university/facilities/catering
// (TU/e lists one set of hours per outlet; weekend opening is not listed, so weekend = null.)
window.FOOD = [
  { name: "Coffee&Co",              building: "Atlas",     weekdays: "09:00-15:00", weekend: null },
  { name: "Brownies&Downies",       building: "Atlas",     weekdays: "09:00-16:00", weekend: null },
  { name: "Food City",              building: "Atlas",     weekdays: "11:30-13:30", weekend: null, note: "Hot lunch", noteNl: "Warme lunch" },
  { name: "MetaForum canteen",      building: "MetaForum", weekdays: "09:00-15:00", weekend: null },
  { name: "Vertigo canteen",        building: "Vertigo",   weekdays: "09:00-15:00", weekend: null },
  { name: "Helix canteen",          building: "Helix",     weekdays: "10:00-14:00", weekend: null },
  { name: "Gemini canteen",         building: "Gemini",    weekdays: "11:30-13:30", weekend: null },
  { name: "Flux canteen",           building: "Flux",      weekdays: "10:00-14:00", weekend: null },
  { name: "Neuron canteen",         building: "Neuron",    weekdays: "10:00-14:00", weekend: null },
  { name: "Subway",                 building: "",          weekdays: "10:00-15:00", weekend: null, mapQuery: "Subway TU Eindhoven" },
  { name: "Hubble Community Café",  building: "",          weekdays: "10:30-02:00", weekend: "10:30-02:00", note: "Open every day, also in the evening", noteNl: "Elke dag open, ook 's avonds", mapQuery: "Hubble Community Cafe Eindhoven" },
  { name: "Student Sports Café",    building: "Sports Centre", weekdays: null, weekend: null, unknown: true, note: "Open 7 days a week; hours change weekly (see the SSC website)", noteNl: "7 dagen per week open; tijden wisselen per week (zie de SSC-website)", mapQuery: "Student Sports Centre Eindhoven" }
];

// ------------------------------------------------------------
// WARNING DAYS: "Hours may differ today because it's ..."
// All Dutch public holidays are added automatically, every year (New Year's Day, Good Friday,
// Easter, King's Day, Liberation Day, Ascension Day, Whitsun, Christmas). Nothing to maintain.
// Extra yearly days can be listed here as "MM-DD". Delete a line to stop warning on that day.
// ------------------------------------------------------------
window.WARNING_DAYS = {
  "12-24": { name: "Christmas Eve", nameNl: "Kerstavond" },
  "12-27": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-28": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-29": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-30": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-31": { name: "the Christmas break", nameNl: "kerstvakantie" }
};

// ------------------------------------------------------------
// SPECIAL DAYS (optional): days where you know the EXACT hours. Empty for now.
// Key = date "YYYY-MM-DD". Each day can have:
//   label / labelNl  text for the banner (English / Dutch)
//   all: null        everything is closed that day (buildings, services and food)
//   closeAt: "16:00" everything closes at that time at the latest
//   buildings: {...} hours for specific places by name; these win over all/closeAt.
//                    Use "HH:MM-HH:MM", null (closed) or "?" (unknown that day).
// A special day replaces the "hours may differ" warning for that date.
// Examples (remove the // to use them):
// ------------------------------------------------------------
window.SPECIAL_DAYS = {
  // "2027-01-23": { label: "Exam period", labelNl: "Tentamenperiode", buildings: { "Flux": "10:00-21:00", "Neuron": "10:00-21:00" } },
  // "2026-12-25": { label: "Christmas closure", labelNl: "Kerstsluiting", all: null },
};
